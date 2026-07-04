import * as fs from 'fs/promises';
import * as path from 'path';
import { BUNDLED_PHOSPHOR } from 'src/BundledPhosphor.js';

export const PACK_ICON_PREFIX = 'nicons:';
export const PACK_ICONS = new Map<string, PackIcon>();

const SVG_FLAT_FOLDER = 'SVGs Flat';
const VARIANT_ORDER = ['thin', 'light', 'regular', 'bold', 'duotone', 'fill'];
const VARIANT_SUFFIXES = new Set(VARIANT_ORDER);

export interface PackIcon {
	id: string;
	name: string;
	slug: string;
	variants: Record<string, string>;
	searchText: string;
}

export interface ScannedIconPack {
	name: string;
	path: string;
	variants: string[];
	selectedVariant: string;
	icons: Map<string, PackIcon>;
}

export async function scanIconPack(packPath: string, preferredVariant: string): Promise<ScannedIconPack> {
	const rootPath = await getSvgRootPath(packPath);
	const variantFolders = await getVariantFolders(rootPath);
	const icons = new Map<string, PackIcon>();

	for (const [variant, folderPath] of variantFolders) {
		const fileNames = await readSvgFileNames(folderPath);
		for (const fileName of fileNames) {
			const slug = normalizeSvgSlug(fileName, variant);
			if (!slug) continue;

			const id = `${PACK_ICON_PREFIX}${slug}`;
			const svg = await fs.readFile(path.join(folderPath, fileName), 'utf8');
			const existing = icons.get(id);
			if (existing) {
				existing.variants[variant] = svg;
				continue;
			}

			const name = toDisplayName(slug);
			icons.set(id, {
				id,
				name,
				slug,
				variants: { [variant]: svg },
				searchText: makeSearchText(id, slug, name),
			});
		}
	}

	if (icons.size === 0) {
		throw new Error(`No SVG icons found in ${packPath}`);
	}

	const variants = [...new Set([...variantFolders.keys()])].sort(compareVariants);
	const selectedVariant = variants.includes(preferredVariant)
		? preferredVariant
		: variants.includes('regular')
			? 'regular'
			: variants[0];

	return {
		name: path.basename(packPath),
		path: packPath,
		variants,
		selectedVariant,
		icons,
	};
}

export function loadBundledPhosphor(preferredVariant: string): ScannedIconPack {
	const icons = new Map<string, PackIcon>();
	const variants = Object.keys(BUNDLED_PHOSPHOR.variants).sort(compareVariants);

	for (const [variant, svgs] of Object.entries(BUNDLED_PHOSPHOR.variants)) {
		for (const [slug, svg] of Object.entries(svgs)) {
			const id = `${PACK_ICON_PREFIX}${slug}`;
			const existing = icons.get(id);
			if (existing) {
				existing.variants[variant] = svg;
				continue;
			}

			const name = toDisplayName(slug);
			icons.set(id, {
				id,
				name,
				slug,
				variants: { [variant]: svg },
				searchText: makeSearchText(id, slug, name),
			});
		}
	}

	const selectedVariant = variants.includes(preferredVariant)
		? preferredVariant
		: variants.includes('regular')
			? 'regular'
			: variants[0];

	return {
		name: BUNDLED_PHOSPHOR.name,
		path: 'bundled:phosphor-icons',
		variants,
		selectedVariant,
		icons,
	};
}

export function replacePackIcons(scannedPack: ScannedIconPack): void {
	PACK_ICONS.clear();
	for (const [id, icon] of scannedPack.icons) {
		PACK_ICONS.set(id, icon);
	}
}

function compareVariants(a: string, b: string): number {
	const indexA = VARIANT_ORDER.indexOf(a);
	const indexB = VARIANT_ORDER.indexOf(b);
	if (indexA > -1 && indexB > -1) return indexA - indexB;
	if (indexA > -1) return -1;
	if (indexB > -1) return 1;
	return a.localeCompare(b);
}

async function getSvgRootPath(packPath: string): Promise<string> {
	const phosphorPath = path.join(packPath, SVG_FLAT_FOLDER);
	return await exists(phosphorPath) ? phosphorPath : packPath;
}

async function getVariantFolders(rootPath: string): Promise<Map<string, string>> {
	const entries = await fs.readdir(rootPath, { withFileTypes: true });
	const folders = new Map<string, string>();

	for (const entry of entries) {
		if (!entry.isDirectory()) continue;
		const variant = entry.name.toLowerCase();
		const folderPath = path.join(rootPath, entry.name);
		if ((await readSvgFileNames(folderPath)).length > 0) {
			folders.set(variant, folderPath);
		}
	}

	if (folders.size === 0 && (await readSvgFileNames(rootPath)).length > 0) {
		folders.set('regular', rootPath);
	}

	return folders;
}

async function readSvgFileNames(folderPath: string): Promise<string[]> {
	try {
		const entries = await fs.readdir(folderPath, { withFileTypes: true });
		return entries
			.filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith('.svg'))
			.map(entry => entry.name)
			.sort((a, b) => a.localeCompare(b));
	} catch {
		return [];
	}
}

function normalizeSvgSlug(fileName: string, variant: string): string {
	const slug = fileName.replace(/\.svg$/i, '').toLowerCase();
	const suffix = `-${variant}`;
	if (VARIANT_SUFFIXES.has(variant) && slug.endsWith(suffix)) {
		return slug.slice(0, -suffix.length);
	}
	return slug;
}

function toDisplayName(slug: string): string {
	return slug
		.split('-')
		.filter(Boolean)
		.map(part => part[0]?.toUpperCase() + part.slice(1))
		.join(' ');
}

function makeSearchText(id: string, slug: string, name: string): string {
	return [
		id,
		slug,
		name,
		slug.replaceAll('-', ' '),
	].join(' ').toLowerCase();
}

async function exists(filePath: string): Promise<boolean> {
	try {
		await fs.access(filePath);
		return true;
	} catch {
		return false;
	}
}
