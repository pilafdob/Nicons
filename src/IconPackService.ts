import { DataAdapter, normalizePath } from 'obsidian';
import { loadBundledPhosphorData } from 'src/BundledPhosphor.js';
import { getAliasTermsForIcon } from 'src/IconSearchAliases.js';

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

export async function scanIconPack(adapter: DataAdapter, packPath: string, preferredVariant: string): Promise<ScannedIconPack> {
	const normalizedPackPath = normalizePath(packPath.trim().replace(/^\/+/, ''));
	const rootPath = await getSvgRootPath(adapter, normalizedPackPath);
	const variantFolders = await getVariantFolders(adapter, rootPath);
	const icons = new Map<string, PackIcon>();

	for (const [variant, folderPath] of variantFolders) {
		const filePaths = await readSvgFilePaths(adapter, folderPath);
		for (const filePath of filePaths) {
			const slug = normalizeSvgSlug(basename(filePath), variant);
			if (!slug) continue;

			const id = `${PACK_ICON_PREFIX}${slug}`;
			const svg = await adapter.read(filePath);
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
		throw new Error(`No SVG icons found in ${normalizedPackPath}`);
	}

	const variants = [...new Set([...variantFolders.keys()])].sort(compareVariants);
	const selectedVariant = variants.includes(preferredVariant)
		? preferredVariant
		: variants.includes('regular')
			? 'regular'
				: variants[0] ?? 'regular';

	return {
		name: basename(normalizedPackPath),
		path: normalizedPackPath,
		variants,
		selectedVariant,
		icons,
	};
}

export async function loadBundledPhosphor(preferredVariant: string): Promise<ScannedIconPack> {
	const bundledPhosphor = await loadBundledPhosphorData();
	const icons = new Map<string, PackIcon>();
	const variants = Object.keys(bundledPhosphor.variants).sort(compareVariants);

	for (const [variant, svgs] of Object.entries(bundledPhosphor.variants)) {
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
				: variants[0] ?? 'regular';

	return {
		name: bundledPhosphor.name,
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

async function getSvgRootPath(adapter: DataAdapter, packPath: string): Promise<string> {
	const phosphorPath = normalizePath(`${packPath}/${SVG_FLAT_FOLDER}`);
	return await adapter.exists(phosphorPath) ? phosphorPath : packPath;
}

async function getVariantFolders(adapter: DataAdapter, rootPath: string): Promise<Map<string, string>> {
	const listing = await adapter.list(rootPath);
	const folders = new Map<string, string>();

	for (const folderPath of listing.folders) {
		const variant = basename(folderPath).toLowerCase();
		if ((await readSvgFilePaths(adapter, folderPath)).length > 0) {
			folders.set(variant, folderPath);
		}
	}

	if (folders.size === 0 && (await readSvgFilePaths(adapter, rootPath)).length > 0) {
		folders.set('regular', rootPath);
	}

	return folders;
}

async function readSvgFilePaths(adapter: DataAdapter, folderPath: string): Promise<string[]> {
	try {
		const listing = await adapter.list(folderPath);
		return listing.files
			.filter(filePath => filePath.toLowerCase().endsWith('.svg'))
			.sort((a, b) => a.localeCompare(b));
	} catch {
		return [];
	}
}

function basename(filePath: string): string {
	return filePath.split('/').filter(Boolean).pop() ?? filePath;
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
		...getAliasTermsForIcon(slug),
	].join(' ').toLowerCase();
}
