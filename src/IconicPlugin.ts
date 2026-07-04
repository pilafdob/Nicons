import { Command, Notice, Platform, Plugin, TAbstractFile, TFile, TFolder, View, WorkspaceFloating, WorkspaceLeaf, WorkspaceRoot, getLanguage, normalizePath } from 'obsidian';
import IconicSettingTab from 'src/IconicSettingTab.js';
import EMOJIS from 'src/Emojis.js';
import STRINGS from 'src/Strings.js';
import { PACK_ICONS, ScannedIconPack, loadBundledPhosphor, replacePackIcons, scanIconPack } from 'src/IconPackService.js';
import MenuManager from 'src/managers/MenuManager.js';
import RuleManager, { RuleTrigger } from 'src/managers/RuleManager.js';
import IconManager from 'src/managers/IconManager.js';
import AppIconManager from 'src/managers/AppIconManager.js';
import TabIconManager from 'src/managers/TabIconManager.js';
import FileIconManager from 'src/managers/FileIconManager.js';
import BookmarkIconManager from 'src/managers/BookmarkIconManager.js';
import TagIconManager from 'src/managers/TagIconManager.js';
import PropertyIconManager from 'src/managers/PropertyIconManager.js';
import EditorIconManager from 'src/managers/EditorIconManager.js';
import RibbonIconManager from 'src/managers/RibbonIconManager.js';
import SuggestionIconManager from 'src/managers/SuggestionIconManager.js';
import SuggestionDialogIconManager from 'src/managers/SuggestionDialogIconManager.js';
import IconPicker from 'src/dialogs/IconPicker.js';
import RulePicker from 'src/dialogs/RulePicker.js';
import ColorUtils from 'src/ColorUtils.js';

export const ICONS = new Map<string, string>();
export { EMOJIS };
export { STRINGS };
export type Category = 'app' | 'tab' | 'file' | 'folder' | 'group' | 'search' | 'graph' | 'url' | 'tag' | 'property' | 'ribbon' | 'rule';
export type AppItemId = 'help' | 'settings' | 'pin' | 'sidebarLeft' | 'sidebarRight' | 'minimize' | 'maximize' | 'unmaximize' | 'close';

// Plugin tabs that contain a file, but should still display a tab-specific icon
export const PLUGIN_TAB_TYPES = [
	'backlink',
	'file-properties',
	'footnotes',
	'outgoing-link',
	'outline',
];

const IMAGE_EXTENSIONS = ['bmp', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif'];
const AUDIO_EXTENSIONS = ['mp3', 'wav', 'm4a', '3gp', 'flac', 'ogg', 'oga', 'opus'];
const VIDEO_EXTENSIONS = ['mp4', 'mov', 'mkv', 'webm', 'avi', 'm4v'];
const ARCHIVE_EXTENSIONS = ['zip', '7z', 'rar', 'tar', 'gz', 'bz2', 'xz'];
const PACK_ICON_FALLBACKS: Record<string, string> = {
	'file': 'lucide-file',
	'file-archive': 'lucide-file-archive',
	'file-audio': 'lucide-file-audio',
	'file-code': 'lucide-file-code',
	'file-csv': 'lucide-file-spreadsheet',
	'file-doc': 'lucide-file-text',
	'file-html': 'lucide-file-code',
	'file-image': 'lucide-image',
	'file-jpg': 'lucide-image',
	'file-js': 'lucide-file-code',
	'file-json': 'lucide-file-code',
	'file-md': 'lucide-file-text',
	'file-pdf': 'lucide-file-text',
	'file-png': 'lucide-image',
	'file-ppt': 'lucide-presentation',
	'file-py': 'lucide-file-code',
	'file-rs': 'lucide-file-code',
	'file-sql': 'lucide-database',
	'file-svg': 'lucide-image',
	'file-text': 'lucide-file-text',
	'file-ts': 'lucide-file-code',
	'file-txt': 'lucide-file-text',
	'file-video': 'lucide-file-video',
	'file-xls': 'lucide-sheet',
	'file-zip': 'lucide-file-archive',
	'folder': 'lucide-folder',
	'folder-open': 'lucide-folder-open',
};

const HOUR = 1000 * 60 * 60; // 1 hour in millis
const MINUTE = 1000 * 60; // 1 minute in millis
const SECOND = 1000; // 1 second in millis

/**
 * Base interface for all icon objects.
 */
export interface Icon {
	icon: string | null;
	color: string | null;
}
export interface Item extends Icon {
	id: string;
	name: string;
	category: Category;
	iconDefault: string | null;
}
export type AppItem = Item;
export interface TabItem extends Item {
	isActive: boolean;
	isRoot: boolean;
	isStacked: boolean;
	iconEl: HTMLElement | null;
	tabEl: HTMLElement | null;
}
export interface FileItem extends Item {
	items: FileItem[] | null;
}
export interface BookmarkItem extends Item {
	items: BookmarkItem[] | null;
}
export type TagItem = Item;
export interface PropertyItem extends Item {
	type: string | null;
}
export interface RibbonItem extends Item {
	isHidden: boolean;
	iconEl: HTMLElement | null;
}

/**
 * Interface for storing plugin settings and user-selected icons.
 */
interface IconicSettings {
	iconPackPath: string | null;
	iconPackName: string;
	iconPackVariant: string;
	iconPackSize: number;
	biggerIcons: string;
	clickableIcons: string;
	showFileTypeIcons: boolean;
	showAllFileIcons: boolean,
	showAllFolderIcons: boolean,
	minimalFolderIcons: boolean;
	showMarkdownTabIcons: boolean;
	showTitleIcons: boolean;
	showTagPillIcons: boolean;
	showMenuActions: boolean;
	showSuggestionIcons: boolean;
	showQuickSwitcherIcons: boolean;
	showMoveFileIcons: boolean;
	showItemName: string;
	biggerSearchResults: string;
	maxSearchResults: number;
	colorPicker1: string;
	colorPicker2: string;
	uncolorHover: boolean;
	uncolorDrag: boolean;
	uncolorSelect: boolean;
	uncolorQuick: boolean;
	maxBackups: number;
	dialogState: {
		iconMode: boolean;
		emojiMode: boolean;
		rulePage: Category;
	},
	appIcons: Record<string, { icon?: string, color?: string }>;
	tabIcons: Record<string, { icon?: string, color?: string }>;
	fileIcons: Record<string, { icon?: string, color?: string }>;
	bookmarkIcons: Record<string, { icon?: string, color?: string }>;
	tagIcons: Record<string, { icon?: string, color?: string }>;
	propertyIcons: Record<string, { icon?: string, color?: string }>;
	ribbonIcons: Record<string, { icon?: string, color?: string }>;
	fileRules: Array<{
		id?: string,
		name?: string,
		icon?: string,
		color?: string,
		match?: string,
		conditions?: Array<{
			source?: string,
			operator?: string,
			value?: string,
		}>,
		enabled?: boolean,
	}>;
	folderRules: Array<{
		id?: string,
		name?: string,
		icon?: string,
		color?: string,
		match?: string,
		conditions?: Array<{
			source?: string,
			operator?: string,
			value?: string,
		}>,
		enabled?: boolean,
	}>;
}

const DEFAULT_SETTINGS: IconicSettings = {
	iconPackPath: null,
	iconPackName: 'Phosphor Icons',
	iconPackVariant: 'regular',
	iconPackSize: 100,
	biggerIcons: 'mobile',
	clickableIcons: 'desktop',
	showFileTypeIcons: true,
	showAllFileIcons: false,
	showAllFolderIcons: false,
	minimalFolderIcons: true,
	showMarkdownTabIcons: true,
	showTitleIcons: true,
	showTagPillIcons: false,
	showMenuActions: true,
	showSuggestionIcons: false,
	showQuickSwitcherIcons: true,
	showMoveFileIcons: true,
	showItemName: 'desktop',
	biggerSearchResults: 'mobile',
	maxSearchResults: 50,
	colorPicker1: 'list',
	colorPicker2: 'rgb',
	uncolorHover: false,
	uncolorDrag: false,
	uncolorSelect: false,
	uncolorQuick: false,
	maxBackups: 2,
	dialogState: {
		iconMode: true,
		emojiMode: false,
		rulePage: 'file',
	},
	appIcons: {},
	tabIcons: {},
	fileIcons: {},
	bookmarkIcons: {},
	tagIcons: {},
	propertyIcons: {},
	ribbonIcons: {},
	fileRules: [],
	folderRules: [],
}

/**
 * Loads, unloads, and manages storage for the plugin.
 */
export default class IconicPlugin extends Plugin {
	settings: IconicSettings = DEFAULT_SETTINGS;
	iconPack: ScannedIconPack | null = null;
	menuManager?: MenuManager;
	ruleManager?: RuleManager;
	appIconManager?: AppIconManager;
	tabIconManager?: TabIconManager;
	fileIconManager?: FileIconManager;
	bookmarkIconManager?: BookmarkIconManager;
	tagIconManager?: TagIconManager;
	propertyIconManager?: PropertyIconManager;
	editorIconManager?: EditorIconManager;
	ribbonIconManager?: RibbonIconManager;
	suggestionIconManager?: SuggestionIconManager;
	suggestionDialogIconManager?: SuggestionDialogIconManager;
	dialogCommands: Command[] = [];
	private isSaving = false;

	/**
	 * @override
	 */
	async onload(): Promise<void> {
		await this.loadSettings();
		await this.loadIconPack();
		this.addSettingTab(new IconicSettingTab(this));

		this.app.workspace.onLayoutReady(() => {
			this.populateIconMapFromPack();

			this.startManagers();
			this.refreshBody();

			this.registerEvent(this.app.vault.on('create', tAbstractFile => {
				const page = tAbstractFile instanceof TFile ? 'file' : 'folder';
				// If a created file/folder triggers a new ruling, refresh icons
				if (this.ruleManager?.triggerRulings(page, 'rename', 'move', 'modify')) {
					this.refreshManagers(page);
				}
			}));

			this.registerEvent(this.app.vault.on('rename', (tAbstractFile, oldPath) => {
				const { path } = tAbstractFile;
				const fileIcon = this.settings.fileIcons[oldPath];
				if (fileIcon) {
					this.settings.fileIcons[path] = fileIcon;
					delete this.settings.fileIcons[oldPath];
					this.saveSettings();
				}
				const { filename, tree } = this.splitFilePath(path);
				const { filename: oldFilename, tree: oldTree } = this.splitFilePath(oldPath);
				const page = tAbstractFile instanceof TFile ? 'file' : 'folder';
				// If a renamed file/folder triggers a new ruling, refresh icons
				if (filename !== oldFilename && this.ruleManager?.triggerRulings(page, 'rename')) {
					this.refreshManagers(page);
				// If a moved file/folder triggers a new ruling, refresh icons
				} else if (tree !== oldTree && this.ruleManager?.triggerRulings(page, 'move')) {
					this.refreshManagers(page);
				}
			}));

			this.registerEvent(this.app.vault.on('modify', tAbstractFile => {
				this.onFileModify(tAbstractFile);
			}));
			this.registerEvent(this.app.metadataCache.on('changed', tAbstractFile => {
				this.onFileModify(tAbstractFile);
			}));

			this.registerEvent(this.app.vault.on('delete', (tAbstractFile) => {
				const { path } = tAbstractFile;
				delete this.settings.fileIcons[path];
				this.saveSettings();
				// If a deleted file/folder was associated with a ruling, update rulings
				const page = tAbstractFile instanceof TFile ? 'file' : 'folder';
				if (this.ruleManager?.checkRuling(page, path)) {
					this.ruleManager.updateRulings(page);
				}
			}));
		});

		this.registerEvent(this.app.workspace.on('css-change', () => {
			this.refreshManagers();
			this.refreshBody();
		}));

		// RIBBON: Open rulebook
		this.addRibbonIcon(
			'lucide-book-image',
			STRINGS.commands.openRulebook,
			() => RulePicker.open(this),
		);

		// COMMAND: Open rulebook
		this.addCommand({
			id: 'open-rulebook',
			name: STRINGS.commands.openRulebook,
			callback: () => RulePicker.open(this),
		});

		// COMMAND: Toggle bigger icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-bigger-icons',
			name: STRINGS.commands.toggleBiggerIcons,
			callback: () => {
				if (Platform.isDesktop) {
					if (this.settings.biggerIcons === 'on') this.settings.biggerIcons = 'mobile';
					else if (this.settings.biggerIcons === 'desktop') this.settings.biggerIcons = 'off';
					else if (this.settings.biggerIcons === 'mobile') this.settings.biggerIcons = 'on';
					else if (this.settings.biggerIcons === 'off') this.settings.biggerIcons = 'desktop';
				} else {
					if (this.settings.biggerIcons === 'on') this.settings.biggerIcons = 'desktop';
					else if (this.settings.biggerIcons === 'desktop') this.settings.biggerIcons = 'on';
					else if (this.settings.biggerIcons === 'mobile') this.settings.biggerIcons = 'off';
					else if (this.settings.biggerIcons === 'off') this.settings.biggerIcons = 'mobile';
				}
				this.saveSettings();
				this.refreshBody();
			}
		}));

		// COMMAND: Toggle clickable icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-clickable-icons',
			name: Platform.isDesktop ? STRINGS.commands.toggleClickableIcons.desktop : STRINGS.commands.toggleClickableIcons.mobile,
			callback: () => {
				if (Platform.isDesktop) {
					if (this.settings.clickableIcons === 'on') this.settings.clickableIcons = 'mobile';
					else if (this.settings.clickableIcons === 'desktop') this.settings.clickableIcons = 'off';
					else if (this.settings.clickableIcons === 'mobile') this.settings.clickableIcons = 'on';
					else if (this.settings.clickableIcons === 'off') this.settings.clickableIcons = 'desktop';
				} else {
					if (this.settings.clickableIcons === 'on') this.settings.clickableIcons = 'desktop';
					else if (this.settings.clickableIcons === 'desktop') this.settings.clickableIcons = 'on';
					else if (this.settings.clickableIcons === 'mobile') this.settings.clickableIcons = 'off';
					else if (this.settings.clickableIcons === 'off') this.settings.clickableIcons = 'mobile';
				}
				this.saveSettings();
				this.refreshManagers();
				this.refreshBody();
			}
		}));

		// COMMAND: Toggle all file icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-all-file-icons',
			name: STRINGS.commands.toggleAllFileIcons,
			callback: () => {
				this.settings.showAllFileIcons = !this.settings.showAllFileIcons;
				this.saveSettings();
				this.refreshManagers('file');
			}
		}));

		// COMMAND: Toggle all folder icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-all-folder-icons',
			name: STRINGS.commands.toggleAllFolderIcons,
			callback: () => {
				this.settings.showAllFolderIcons = !this.settings.showAllFolderIcons;
				this.saveSettings();
				this.refreshManagers('file', 'tag');
			}
		}));

		// COMMAND: Toggle minimal folder icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-minimal.folder-icons',
			name: STRINGS.commands.toggleMinimalFolderIcons,
			callback: () => {
				this.settings.minimalFolderIcons = !this.settings.minimalFolderIcons;
				this.saveSettings();
				this.refreshManagers('file', 'tag');
			}
		}));

		// COMMAND: Toggle Markdown tab icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-markdown-tab-icons',
			name: STRINGS.commands.toggleMarkdownTabIcons,
			callback: () => {
				this.settings.showMarkdownTabIcons = !this.settings.showMarkdownTabIcons;
				this.saveSettings();
				this.refreshBody();
			}
		}));

		// COMMAND: Toggle title icons
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-title-icons',
			name: STRINGS.commands.toggleTitleIcons,
			callback: () => {
				this.settings.showTitleIcons = !this.settings.showTitleIcons;
				this.saveSettings();
				this.refreshManagers('file');
			}
		}));

		// COMMAND: Toggle tag pill icons
		this.addCommand({
			id: 'toggle-tag-pill-icons',
			name: STRINGS.commands.toggleTagPillIcons,
			callback: () => {
				this.settings.showTagPillIcons = !this.settings.showTagPillIcons;
				this.saveSettings();
				this.refreshManagers('tag');
			}
		});

		// COMMAND: Toggle menu actions
		this.addCommand({
			id: 'toggle-menu-actions',
			name: STRINGS.commands.toggleMenuActions,
			callback: () => {
				this.settings.showMenuActions = !this.settings.showMenuActions;
				this.saveSettings();
				this.refreshManagers();
				this.menuManager?.closeAndFlush();
			}
		});

		// COMMAND: Toggle suggestion icons
		this.addCommand({
			id: 'toggle-suggestion-icons',
			name: STRINGS.commands.toggleSuggestionIcons,
			callback: () => {
				this.settings.showSuggestionIcons = !this.settings.showSuggestionIcons;
				this.saveSettings();
			}
		});

		// COMMAND: Toggle quick switcher icons
		this.addCommand({
			id: 'toggle-quick-switcher-icons',
			name: STRINGS.commands.toggleQuickSwitcherIcons,
			callback: () => {
				this.settings.showQuickSwitcherIcons = !this.settings.showQuickSwitcherIcons;
				this.saveSettings();
			}
		});

		// COMMAND: Toggle "Move file" icons
		this.addCommand({
			id: 'toggle-move-file-icons',
			name: STRINGS.commands.toggleMoveFileIcons,
			callback: () => {
				this.settings.showMoveFileIcons = !this.settings.showMoveFileIcons;
				this.saveSettings();
			}
		});

		// COMMAND: Toggle bigger search results
		this.dialogCommands.push(this.addCommand({
			id: 'toggle-bigger-search-results',
			name: STRINGS.commands.toggleBiggerSearchResults,
			callback: () => {
				if (Platform.isDesktop) {
					if (this.settings.biggerSearchResults === 'on') this.settings.biggerSearchResults = 'mobile';
					else if (this.settings.biggerSearchResults === 'desktop') this.settings.biggerSearchResults = 'off';
					else if (this.settings.biggerSearchResults === 'mobile') this.settings.biggerSearchResults = 'on';
					else if (this.settings.biggerSearchResults === 'off') this.settings.biggerSearchResults = 'desktop';
				} else {
					if (this.settings.biggerSearchResults === 'on') this.settings.biggerSearchResults = 'desktop';
					else if (this.settings.biggerSearchResults === 'desktop') this.settings.biggerSearchResults = 'on';
					else if (this.settings.biggerSearchResults === 'mobile') this.settings.biggerSearchResults = 'off';
					else if (this.settings.biggerSearchResults === 'off') this.settings.biggerSearchResults = 'mobile';
				}
				this.saveSettings();
				this.refreshBody();
			}
		}));

		// COMMAND: Change icon of the current file
		this.addCommand({
			id: 'change-icon-current-file',
			name: STRINGS.commands.changeIconCurrentFile,
			checkCallback: checking => {
				const tFile = this.app.workspace.getActiveFile();
				if (tFile === null) return false;

				const file = this.getFileItem(tFile.path);
				if (file === null) return false;

				if (!checking) {
					IconPicker.openSingle(this, file, (newIcon, newColor) => {
						this.saveFileIcon(file, newIcon, newColor);
						this.refreshManagers('file');
					});
				}
				return true
			},
		});
	}

	/**
	 * Load the active SVG icon pack into the picker registry.
	 */
	async loadIconPack(): Promise<void> {
		if (!this.settings.iconPackPath) {
			this.applyIconPack(loadBundledPhosphor(this.settings.iconPackVariant), 'Phosphor Icons');
			return;
		}

		try {
			const iconPack = await scanIconPack(this.settings.iconPackPath, this.settings.iconPackVariant);
			this.applyIconPack(iconPack);
		} catch (error) {
			console.error('Nicons failed to load icon pack', error);
			new Notice('Nicons could not load the selected icon pack. Falling back to bundled Phosphor Icons.');
			this.settings.iconPackPath = null;
			this.applyIconPack(loadBundledPhosphor('regular'), 'Phosphor Icons');
		}
	}

	/**
	 * Open the native folder picker and switch to the selected SVG icon pack.
	 */
	async chooseIconPack(): Promise<void> {
		const folderPath = await this.pickIconPackFolder();
		if (!folderPath) return;

		const previousPath = this.settings.iconPackPath;
		const previousVariant = this.settings.iconPackVariant;
		this.settings.iconPackPath = folderPath;
		try {
			await this.loadIconPack();
			await this.saveSettings();
			this.refreshManagers();
			new Notice(`Nicons loaded ${this.settings.iconPackName}.`);
		} catch (error) {
			console.error('Nicons failed to switch icon pack', error);
			this.settings.iconPackPath = previousPath;
			this.settings.iconPackVariant = previousVariant;
			await this.loadIconPack();
			new Notice('Nicons could not load that icon pack.');
		}
	}

	/**
	 * Reset icon source to bundled Phosphor Icons.
	 */
	async useBundledIconPack(): Promise<void> {
		this.settings.iconPackPath = null;
		this.settings.iconPackVariant = 'regular';
		await this.loadIconPack();
		await this.saveSettings();
		this.refreshManagers();
	}

	/**
	 * Render a selected SVG-pack icon into an existing icon element.
	 */
	renderPackIcon(iconEl: HTMLElement, iconId: string, color: string | null): boolean {
		const svgText = this.getPackIconSvg(iconId);
		if (!svgText) return false;

		const svgEl = this.createSafeSvgElement(iconEl, svgText);
		if (!svgEl) return false;

		iconEl.empty();
		iconEl.appendChild(svgEl);
		if (color) {
			svgEl.style.setProperty('color', ColorUtils.toRgb(color));
		} else {
			svgEl.style.removeProperty('color');
		}
		return true;
	}

	getPackIconSvg(iconId: string): string | null {
		const icon = PACK_ICONS.get(iconId);
		if (!icon) return null;
		return icon.variants[this.settings.iconPackVariant]
			?? icon.variants.regular
			?? Object.values(icon.variants)[0]
			?? null;
	}

	getFolderDefaultIcon(isOpen = false): string {
		return this.getPackIconOrFallback(isOpen ? 'folder-open' : 'folder');
	}

	getFileTypeDefaultIcon(extension: string, fallback: string | null = null): string | null {
		if (!this.settings.showFileTypeIcons) return fallback;

		const normalizedExtension = extension.toLowerCase();
		let packSlug: string | null = null;
		switch (normalizedExtension) {
			case 'md':
			case 'markdown':
			case 'base':
				packSlug = 'file-md';
				break;
			case 'canvas':
				return 'lucide-layout-dashboard';
			case 'pdf':
				packSlug = 'file-pdf';
				break;
			case 'doc':
			case 'docx':
			case 'docm':
			case 'dot':
			case 'dotx':
			case 'pages':
			case 'rtf':
				packSlug = 'file-doc';
				break;
			case 'xls':
			case 'xlsx':
			case 'xlsm':
			case 'numbers':
				packSlug = 'file-xls';
				break;
			case 'ppt':
			case 'pptx':
			case 'pptm':
			case 'key':
			case 'keynote':
				packSlug = 'file-ppt';
				break;
			case 'csv':
				packSlug = 'file-csv';
				break;
			case 'txt':
			case 'text':
				packSlug = 'file-txt';
				break;
			case 'html':
			case 'htm':
				packSlug = 'file-html';
				break;
			case 'js':
			case 'jsx':
				packSlug = 'file-js';
				break;
			case 'ts':
			case 'tsx':
				packSlug = 'file-ts';
				break;
			case 'py':
				packSlug = 'file-py';
				break;
			case 'rs':
				packSlug = 'file-rs';
				break;
			case 'sql':
				packSlug = 'file-sql';
				break;
			case 'json':
			case 'yaml':
			case 'yml':
			case 'toml':
			case 'xml':
			case 'css':
				packSlug = 'file-code';
				break;
			default:
				if (normalizedExtension === 'png') packSlug = 'file-png';
				else if (normalizedExtension === 'jpg' || normalizedExtension === 'jpeg') packSlug = 'file-jpg';
				else if (normalizedExtension === 'svg') packSlug = 'file-svg';
				else if (IMAGE_EXTENSIONS.includes(normalizedExtension)) packSlug = 'file-image';
				else if (AUDIO_EXTENSIONS.includes(normalizedExtension)) packSlug = 'file-audio';
				else if (VIDEO_EXTENSIONS.includes(normalizedExtension)) packSlug = 'file-video';
				else if (ARCHIVE_EXTENSIONS.includes(normalizedExtension)) packSlug = 'file-zip';
		}

		return packSlug ? this.getPackIconOrFallback(packSlug) : fallback;
	}

	private getPackIconOrFallback(slug: string): string {
		const packIcon = `nicons:${slug}`;
		return PACK_ICONS.has(packIcon) ? packIcon : PACK_ICON_FALLBACKS[slug] ?? 'lucide-file';
	}

	private applyIconPack(iconPack: ScannedIconPack, displayName?: string): void {
		this.iconPack = iconPack;
		replacePackIcons(iconPack);
		this.settings.iconPackName = displayName ?? iconPack.name;
		this.settings.iconPackVariant = iconPack.selectedVariant;
		this.populateIconMapFromPack();
	}

	private populateIconMapFromPack(): void {
		ICONS.clear();
		[...PACK_ICONS.values()]
			.sort((a, b) => a.name.localeCompare(b.name))
			.forEach(icon => ICONS.set(icon.id, icon.name));
	}

	private async pickIconPackFolder(): Promise<string | null> {
		const electron = require('electron') as any;
		const dialog = electron.remote?.dialog ?? electron.dialog;
		const getCurrentWindow = electron.remote?.getCurrentWindow;
		if (!dialog?.showOpenDialog) {
			new Notice('Nicons could not open the system file picker.');
			return null;
		}

		const result = await dialog.showOpenDialog(getCurrentWindow?.(), {
			title: 'Choose icon pack',
			properties: ['openDirectory'],
		});

		if (result.canceled) return null;
		return result.filePaths?.[0] ?? null;
	}

	private createSafeSvgElement(containerEl: HTMLElement, svgText: string): SVGSVGElement | null {
		const parser = new DOMParser();
		const doc = parser.parseFromString(svgText, 'image/svg+xml');
		const svgEl = doc.documentElement;
		if (svgEl.nodeName.toLowerCase() !== 'svg') return null;

		for (const element of Array.from(svgEl.querySelectorAll('script,foreignObject,iframe,object,embed,link,style'))) {
			element.remove();
		}

		for (const element of [svgEl, ...Array.from(svgEl.querySelectorAll('*'))]) {
			for (const attribute of Array.from(element.attributes)) {
				const name = attribute.name.toLowerCase();
				const value = attribute.value.trim().toLowerCase();
				if (name.startsWith('on') || value.startsWith('javascript:')) {
					element.removeAttribute(attribute.name);
				}
			}
		}

			const importedSvg = containerEl.ownerDocument.importNode(svgEl, true) as unknown as SVGSVGElement;
		importedSvg.addClasses(['svg-icon', 'nicons-pack-icon']);
		importedSvg.setAttribute('aria-hidden', 'true');
		importedSvg.setAttribute('focusable', 'false');
		return importedSvg;
	}

	/**
	 * @override
	 */
	async onExternalSettingsChange(): Promise<any> {
		await this.loadSettings();
		await this.loadIconPack();
		this.refreshManagers();
		this.refreshBody();
	}

	/**
	 * Refresh icon managers after a file/folder is modified.
	 */
	private onFileModify(tAbstractFile: TAbstractFile): void {
		const page = tAbstractFile instanceof TFile ? 'file' : 'folder';
		// If a modified file/folder triggers a new ruling, refresh icons
		if (this.ruleManager?.triggerRulings(page, 'modify')) {
			this.refreshManagers(page);
		}
	}

	/**
	 * Initialize all manager instances.
	 */
	private startManagers(): void {
		this.menuManager = new MenuManager();
		this.ruleManager = new RuleManager(this);
		try { this.appIconManager = new AppIconManager(this) } catch (e) { console.error(e) }
		try { this.tabIconManager = new TabIconManager(this) } catch (e) { console.error(e) }
		try { this.fileIconManager = new FileIconManager(this) } catch (e) { console.error(e) }
		try { this.tagIconManager = new TagIconManager(this) } catch (e) { console.error(e) }
		try { this.bookmarkIconManager = new BookmarkIconManager(this) } catch (e) { console.error(e) }
		try { this.propertyIconManager = new PropertyIconManager(this) } catch (e) { console.error(e) }
		try { this.editorIconManager = new EditorIconManager(this) } catch (e) { console.error(e) }
		try { this.ribbonIconManager = new RibbonIconManager(this) } catch (e) { console.error(e) }
		try { this.suggestionIconManager = new SuggestionIconManager(this) } catch (e) { console.error(e) }
		try { this.suggestionDialogIconManager = new SuggestionDialogIconManager(this) } catch (e) { console.error(e) }
	}

	/**
	 * Refresh all icon managers, or a specific group of them.
	 */
	refreshManagers(...categories: Category[]): void {
		if (categories.length === 0) {
			categories = ['app', 'tab', 'file', 'folder', 'tag', 'property', 'ribbon'];
		}
		const managers = new Set<IconManager | undefined>();

		if (categories.includes('app')) {
			managers.add(this.appIconManager);
		}
		if (categories.includes('tab')) {
			managers.add(this.tabIconManager);
		}
		if (categories.includes('file')) {
			managers.add(this.tabIconManager);
			managers.add(this.fileIconManager);
			managers.add(this.bookmarkIconManager);
			managers.add(this.editorIconManager);
		}
		if (categories.includes('folder')) {
			managers.add(this.fileIconManager);
			managers.add(this.bookmarkIconManager);
		}
		if (categories.includes('tag')) {
			managers.add(this.tagIconManager);
			managers.add(this.editorIconManager);
		}
		if (categories.includes('property')) {
			managers.add(this.propertyIconManager);
			managers.add(this.editorIconManager);
		}
		if (categories.includes('ribbon')) {
			managers.add(this.ribbonIconManager);
		}

		managers.delete(undefined);
		for (const manager of managers) manager?.refreshIcons();
	}

	/**
	 * Refresh any classes or attributes on every document body.
	 * @param unloading Remove all classes if true
	 */
	refreshBody(unloading?: boolean): void {
		// Check all open windows
		const bodyEls = new Set<HTMLElement>();
		this.app.workspace.iterateAllLeaves(leaf => {
			// @ts-expect-error (Private API)
			const bodyEl = leaf?.containerEl?.doc?.body;
			if (bodyEl instanceof HTMLElement) bodyEls.add(bodyEl);
		});

		// Refresh classes and theme attribute
		for (const bodyEl of bodyEls) {
			bodyEl.toggleClass('iconic-bigger-icons', unloading ? false : this.isSettingEnabled('biggerIcons'));
			bodyEl.toggleClass('iconic-clickable-icons', unloading ? false : this.isSettingEnabled('clickableIcons'));
			bodyEl.toggleClass('iconic-markdown-tab-icons', unloading ? false : this.settings.showMarkdownTabIcons);
			bodyEl.toggleClass('iconic-bigger-search-results', unloading ? false : this.isSettingEnabled('biggerSearchResults'));
			bodyEl.toggleClass('iconic-uncolor-hover', unloading ? false : this.settings.uncolorHover);
			bodyEl.toggleClass('iconic-uncolor-drag', unloading ? false : this.settings.uncolorDrag);
			bodyEl.toggleClass('iconic-uncolor-select', unloading ? false : this.settings.uncolorSelect);
			if (unloading) {
				bodyEl.style.removeProperty('--nicons-icon-scale');
			} else {
				bodyEl.style.setProperty('--nicons-icon-scale', (this.settings.iconPackSize / 100).toString());
			}

			// @ts-expect-error (Private API)
			const theme = this.app.customCss?.theme;
			if (theme) {
				bodyEl.setAttr('data-theme', theme);
			} else {
				bodyEl.removeAttribute('data-theme');
			}
		}
	}

	/**
	 * Check whether setting is enabled for the current platform.
	 */
	isSettingEnabled(setting: keyof IconicSettings): boolean {
		const state = this.settings[setting];
		return state === 'on' || Platform.isDesktop && state === 'desktop' || Platform.isMobile && state === 'mobile';
	}

	/**
	 * Check whether a community plugin is installed and enabled.
	 */
	isPluginEnabled(pluginId: string): boolean {
		// @ts-expect-error (Private API)
		return this.app.plugins?.plugins?.hasOwnProperty(pluginId) === true;
	}

	/**
	 * Get app item definition.
	 */
	getAppItem(appItemId: AppItemId, unloading?: boolean): AppItem {
		const appIcon = this.settings.appIcons[appItemId] ?? {};
		let name, iconDefault;
		switch (appItemId) {
			case 'help': {
				name = STRINGS.appItems.help;
				iconDefault = 'help';
				break;
			}
			case 'settings': {
				name = STRINGS.appItems.settings;
				iconDefault = 'lucide-settings';
				break;
			}
			case 'pin': {
				name = STRINGS.appItems.pin;
				iconDefault = 'lucide-pin';
				break;
			}
			case 'sidebarLeft': {
				name = STRINGS.appItems.sidebarLeft;
				iconDefault = 'sidebar-toggle-button-icon';
				break;
			}
			case 'sidebarRight': {
				name = STRINGS.appItems.sidebarRight;
				iconDefault = 'sidebar-toggle-button-icon';
				break;
			}
			case 'minimize': name = STRINGS.appItems.minimize; break;
			case 'maximize': name = STRINGS.appItems.maximize; break;
			case 'unmaximize': name = STRINGS.appItems.unmaximize; break;
			case 'close': name = STRINGS.appItems.close; break;
		}
		return {
			id: appItemId,
			name: name ?? '',
			category: 'app',
			iconDefault: iconDefault ?? null,
			icon: unloading ? null : appIcon.icon ?? null,
			color: unloading ? null : appIcon.color ?? null,
		}
	}

	/**
	 * Get array of tab definitions.
	 */
	getTabItems(unloading?: boolean): TabItem[] {
		const tabIcons: TabItem[] = [];
		this.app.workspace.iterateAllLeaves(leaf => {
			tabIcons.push(this.defineTabItem(leaf, unloading));
		});
		return tabIcons;
	}

	/**
	 * Get tab definition.
	 */
	getTabItem(tabId: string, unloading?: boolean): TabItem | null {
		let tab: TabItem | null = null;
		this.app.workspace.iterateAllLeaves(leaf => {
			if (tab) return;
			const tabType = leaf.view.getViewType();
			if (tabType === tabId || leaf.view.getState().file === tabId && !PLUGIN_TAB_TYPES.includes(tabType)) {
				tab = this.defineTabItem(leaf, unloading);
			}
		});
		return tab;
	}

	/**
	 * Create tab definition.
	 */
	private defineTabItem(leaf: WorkspaceLeaf, unloading?: boolean): TabItem {
		// @ts-expect-error (Private API)
		let iconEl: HTMLElement | null = leaf.tabHeaderInnerIconEl;
		if (Platform.isMobile) {
			// @ts-expect-error (Private API)
			if (leaf.containerEl?.parentElement === this.app.workspace.leftSplit.activeTabContentEl) {
				// @ts-expect-error (Private API)
				iconEl = this.app.workspace.leftSplit.activeTabIconEl;
				// @ts-expect-error (Private API)
			} else if (leaf.containerEl?.parentElement === this.app.workspace.rightSplit.activeTabContentEl) {
				// @ts-expect-error (Private API)
				iconEl = this.app.workspace.rightSplit.activeTabIconEl;
			}
		}

		const tabType = leaf.view.getViewType();
		// @ts-expect-error (Private API)
		const isActive = leaf.view === this.app.workspace.getActiveViewOfType(View) || leaf.tabHeaderEl?.hasClass('is-active');
		const isRoot = leaf.getRoot() instanceof WorkspaceRoot || leaf.getRoot() instanceof WorkspaceFloating;

		// @ts-expect-error (Private API)
		const isStacked = leaf.parent?.isStacked === true;
		const filePath = leaf.view.getState().file; // Used because view.file is undefined on deferred views

		if (filePath && !PLUGIN_TAB_TYPES.includes(tabType)) {
			const fileId = typeof filePath === 'string' ? filePath : '';
			const file = this.getFileItem(fileId, unloading);
			return {
				id: fileId,
				name: leaf.getDisplayText(),
				category: 'file',
				iconDefault: file.iconDefault,
				icon: file.icon,
				color: file.color,
				isActive: isActive,
				isRoot: isRoot,
				isStacked: isStacked,
				iconEl: iconEl ?? null,
				// @ts-expect-error (Private API)
				tabEl: leaf.tabHeaderEl ?? null,
			}
		} else {
			const tabIcon = this.settings.tabIcons[tabType] ?? {};
			let iconDefault;
			switch (tabType) {
				case 'empty':
					iconDefault = !isRoot || isStacked || tabIcon.color ? leaf.view.getIcon() : null; break;
				default:
					iconDefault = leaf.view.getIcon(); break;
			}
			return {
				id: tabType,
				name: leaf.getDisplayText(),
				category: 'tab',
				iconDefault: iconDefault,
				icon: unloading ? null : tabIcon.icon ?? null,
				color: unloading ? null : tabIcon.color ?? null,
				isActive: isActive,
				isRoot: isRoot,
				isStacked: isStacked,
				iconEl: iconEl ?? null,
				// @ts-expect-error (Private API)
				tabEl: leaf.tabHeaderEl ?? null,
			}
		}
	}

	/**
	 * Get array of file definitions.
	 */
	getFileItems(unloading?: boolean): FileItem[] {
		const tFiles = this.app.vault.getAllLoadedFiles();
		const rootFolder = tFiles.find(tFile => tFile.path === '/');
		if (rootFolder) tFiles.remove(rootFolder);
		return tFiles.map(tFile => this.defineFileItem(tFile, tFile.path, unloading));
	}

	/**
	 * Get file definition.
	 */
	getFileItem(fileId: string, unloading?: boolean): FileItem {
		const { path } = this.splitFilePath(fileId); // Ignore subpath
		const tFile = this.app.vault.getAbstractFileByPath(path);
		return this.defineFileItem(tFile, fileId, unloading);
	}

	/**
	 * Create file definition.
	 */
	private defineFileItem(tFile: TAbstractFile | null, fileId: string, unloading?: boolean): FileItem {
		const { filename, basename, extension } = this.splitFilePath(fileId);
		const fileIcon = this.settings.fileIcons[fileId] ?? {};
		let iconDefault = null;

		if (tFile instanceof TFile) {
			const typeIcon = this.getFileTypeDefaultIcon(extension);
			if (fileIcon.color || this.settings.showAllFileIcons || typeIcon) {
				iconDefault = typeIcon ?? this.getFileTypeDefaultIcon(extension, 'lucide-file');
			}
		} else if (tFile instanceof TFolder && (fileIcon.color && !this.settings.minimalFolderIcons || this.settings.showAllFolderIcons)) {
			iconDefault = this.getFolderDefaultIcon(false);
		}

		return {
			id: fileId,
			name: extension === 'md' ? basename : filename,
			category: tFile instanceof TFolder ? 'folder' : 'file',
			iconDefault: unloading ? null : iconDefault,
			icon: unloading ? null : fileIcon.icon ?? null,
			color: unloading ? null : fileIcon.color ?? null,
			items: tFile instanceof TFolder
				? tFile.children.map(tChild => this.defineFileItem(tChild, tChild.path, unloading))
				: null,
		}
	}

	/**
	 * Split a filepath into its hierarchical components.
	 */
	splitFilePath(fileId = ''): {
		path: string      // Folder tree + Filename
		tree: string      // Folder tree only
		filename: string  // Name.Extension
		basename: string  // Name only
		extension: string // Extension only
		subpath: string   // #Subpath after extension
	} {
		const subpathExts = ['md', 'base', 'pdf']; // Extensions with linkable subpaths
		const subpathStart = Math.max(...subpathExts.map(ext => {
			const index = fileId.lastIndexOf(`.${ext}#`);
			return index > -1 ? (index + ext.length + 1) : -1;
		}));
		const subpath = subpathStart > -1 ? fileId.substring(subpathStart, fileId.length) : '';
		const path = subpathStart > -1 ? fileId.substring(0, subpathStart) : fileId;

		const [, tree = '', filename = ''] = path.match(/^(.*\/)?(.*)$/s) ?? [];
		const extensionStart = filename.lastIndexOf('.');
		const extension = filename.substring(extensionStart > -1 ? extensionStart + 1 : filename.length) || '';
		const basename = filename.substring(0, extensionStart > -1 ? extensionStart : filename.length) || '';

		return { path, tree, filename, basename, extension, subpath };
	}

	/**
	 * Get array of bookmark definitions.
	 */
	getBookmarkItems(unloading?: boolean): BookmarkItem[] {
		// @ts-expect-error (Private API)
		const bmarkBases: any[] = this.app.internalPlugins?.plugins?.bookmarks?.instance?.items ?? [];
		return bmarkBases.map(bmarkBase => this.defineBookmarkItem(bmarkBase, unloading));
	}

	/**
	 * Get bookmark definition.
	 */
	getBookmarkItem(bmarkId: string, bmarkCategory: Category, unloading?: boolean): BookmarkItem {
		// @ts-expect-error (Private API)
		const bmarkBases = this.flattenBookmarks(this.app.internalPlugins?.plugins?.bookmarks?.instance?.items ?? []);
		const bmarkBase = bmarkBases.find(bmarkBase => {
			switch (bmarkCategory) {
				case 'file': // Fallthrough
				case 'folder': return bmarkBase.path + (bmarkBase.subpath ?? '') === bmarkId;
				default: return bmarkBase.ctime === bmarkId;
			}
		}) ?? {};
		return this.defineBookmarkItem(bmarkBase, unloading);
	}

	/**
	 * Create bookmark definition.
	 */
	private defineBookmarkItem(bmarkBase: any, unloading?: boolean): BookmarkItem {
		const { path, filename, basename, extension } = this.splitFilePath(bmarkBase.path);
		const subpath = bmarkBase.subpath ?? '';
		let id, name, bmarkIcon, iconDefault = null;

		switch (bmarkBase.type) {
			case 'file': {
				id = path + subpath;
				name = (extension === 'md' ? basename : filename) + subpath;
				if (extension === 'canvas') {
					iconDefault = 'lucide-layout-dashboard';
				} else if (subpath.startsWith('#^')) {
					iconDefault = 'lucide-toy-brick';
				} else if (subpath.startsWith('#')) {
					iconDefault = 'lucide-heading';
				} else {
					iconDefault = unloading ? 'lucide-file' : this.getFileTypeDefaultIcon(extension, 'lucide-file');
				}
				bmarkIcon = this.settings.fileIcons[id] ?? {};
				break;
			}
			case 'folder': {
				id = path;
				name = basename;
				bmarkIcon = this.settings.fileIcons[id] ?? {};
				iconDefault = this.getFolderDefaultIcon(false);
				break;
			}
			case 'group': {
				id = bmarkBase.ctime;
				name = bmarkBase.title;
				bmarkIcon = this.settings.bookmarkIcons[id] ?? {};
				if (bmarkIcon.color && !this.settings.minimalFolderIcons || this.settings.showAllFolderIcons) {
					iconDefault = this.getFolderDefaultIcon(false);
				}
				break;
			}
			case 'search': {
				id = bmarkBase.ctime;
				name = bmarkBase.query;
				bmarkIcon = this.settings.bookmarkIcons[id] ?? {};
				iconDefault = 'lucide-search';
				break;
			}
			case 'graph': {
				id = bmarkBase.ctime;
				name = bmarkBase.title;
				bmarkIcon = this.settings.bookmarkIcons[id] ?? {};
				iconDefault = 'lucide-git-fork';
				break;
			}
			case 'url': {
				id = bmarkBase.ctime;
				name = bmarkBase.url;
				bmarkIcon = this.settings.bookmarkIcons[id] ?? {};
				iconDefault = 'lucide-globe-2';
				break;
			}
		}
		return {
			id: id,
			name: name,
			category: bmarkBase.type ?? 'file',
			iconDefault: iconDefault,
			icon: unloading ? null : bmarkIcon?.icon ?? null,
			color: unloading ? null : bmarkIcon?.color ?? null,
			items: bmarkBase.items?.map((bmark: any) => this.defineBookmarkItem(bmark, unloading)) ?? null,
		}
	}

	/**
	 * Flatten an array of bookmark bases to include all children.
	 */
	private flattenBookmarks(bmarkBases: any[]): any[] {
		const flatArray = [];
		for (const bmarkBase of bmarkBases) {
			flatArray.push(bmarkBase);
			if (bmarkBase.items) flatArray.push(...this.flattenBookmarks(bmarkBase.items));
		}
		return flatArray;
	}

	/**
	 * Get array of tag definitions.
	 */
	getTagItems(unloading?: boolean): TagItem[] {
		// @ts-expect-error (Private API)
		const tagHashes: string[] = Object.keys(this.app.metadataCache.getTags()) ?? [];
		const tagBases = tagHashes.map(tagHash => {
			return {
				id: tagHash.replace('#', ''),
				name: tagHash,
			}
		});
		return tagBases.map(tagBase => this.defineTagItem(tagBase, unloading));
	}

	/**
	 * Get tag definition.
	 */
	getTagItem(tagId: string, unloading?: boolean): TagItem | null {
		const tagHash = '#' + tagId;
		// @ts-expect-error (Private API)
		const tagHashes: string[] = Object.keys(this.app.metadataCache.getTags()) ?? [];
		return tagHashes.includes(tagHash)
			? this.defineTagItem({
				id: tagId,
				name: tagHash,
			}, unloading) : null;
	}

	/**
	 * Create tag definition.
	 */
	private defineTagItem(tagBase: any, unloading?: boolean): TagItem {
		const tagIcon = this.settings.tagIcons[tagBase.id] ?? {};

		return {
			id: tagBase.id,
			name: tagBase.name,
			category: 'tag',
			iconDefault: null,
			icon: unloading ? null : tagIcon.icon ?? null,
			color: unloading ? null : tagIcon.color ?? null,
		};
	}

	/**
	 * Get array of property definitions.
	 */
	getPropertyItems(unloading?: boolean): PropertyItem[] {
		// @ts-expect-error (Private API)
		const propBases: any[] = Object.values(this.app.metadataTypeManager?.properties) ?? [];
		return propBases.map(propBase => this.definePropertyItem(propBase, unloading));
	}

	/**
	 * Get property definition.
	 * @param propId Case-insensitive
	 */
	getPropertyItem(propId: string, unloading?: boolean): PropertyItem {
		// @ts-expect-error (Private API)
		const propBases: any[] = Object.values(this.app.metadataTypeManager?.properties) ?? [];
		const propBase = propBases.find(propBase => propBase.name.toLowerCase() === propId.toLowerCase()) ?? {};
		return this.definePropertyItem(propBase, unloading);
	}

	/**
	 * Create property definition.
	 */
	private definePropertyItem(propBase: any, unloading?: boolean): PropertyItem {
		const propIcon = this.settings.propertyIcons[propBase.name] ?? {};
		// @ts-expect-error (Private API)
		const widget = this.app.metadataTypeManager?.getWidget?.(propBase.widget ?? '');
		const iconDefault = widget?.icon ?? 'lucide-file-question';

		return {
			id: propBase.name,
			name: propBase.name,
			category: 'property',
			iconDefault: iconDefault,
			icon: unloading ? null : propIcon.icon ?? null,
			color: unloading ? null : propIcon.color ?? null,
			type: propBase.widget ?? null,
		}
	}

	/**
	 * Get array of ribbon command definitions.
	 */
	getRibbonItems(unloading?: boolean): RibbonItem[] {
		// @ts-expect-error (Private API)
		const itemBases: any[] = this.app.workspace.leftRibbon.items ?? [];
		return itemBases.map(item => this.defineRibbonItem(item, unloading));
	}

	/**
	 * Get ribbon command definition.
	 */
	getRibbonItem(itemId: string, unloading?: boolean): RibbonItem {
		// @ts-expect-error (Private API)
		const itemBase: any = this.app.workspace.leftRibbon.items
			?.find((itemBase: any) => itemBase?.id === itemId) ?? {};
		return this.defineRibbonItem(itemBase, unloading);
	}

	/**
	 * Create ribbon command definition.
	 */
	private defineRibbonItem(itemBase: any, unloading?: boolean): RibbonItem {
		const itemIcon = this.settings.ribbonIcons[itemBase.id] ?? {};
		return {
			id: itemBase.id,
			name: itemBase.title ?? null,
			category: 'ribbon',
			iconDefault: itemBase.icon ?? null,
			icon: unloading ? null : itemIcon.icon ?? null,
			color: unloading ? null : itemIcon.color ?? null,
			isHidden: itemBase.hidden ?? false,
			iconEl: itemBase.buttonEl ?? null,
		}
	}

	/**
	 * Save app icon changes to settings.
	 */
	saveAppIcon(appItem: AppItem, icon: string | null, color: string | null): void {
		this.updateIconSetting(this.settings.appIcons, appItem.id, icon, color);
		this.saveSettings();
	}

	/**
	 * Save tab icon changes to settings.
	 */
	saveTabIcon(tab: TabItem, icon: string | null, color: string | null): void {
		this.updateIconSetting(this.settings.tabIcons, tab.id, icon, color);
		this.saveSettings();
	}

	/**
	 * Save file icon changes to settings.
	 */
	saveFileIcon(file: FileItem, icon: string | null, color: string | null): void {
		const triggers: Set<RuleTrigger> = new Set();
		const fileBase = this.settings.fileIcons[file.id];
		if (icon !== fileBase?.icon) triggers.add('icon');
		if (color !== fileBase?.color) triggers.add('color');
		this.updateIconSetting(this.settings.fileIcons, file.id, icon, color);
		this.saveSettings();
		this.ruleManager?.triggerRulings('file', ...triggers);
	}

	/**
	 * Save multiple file icon changes to settings.
	 * @param icon If undefined, leave icons unchanged
	 * @param color If undefined, leave colors unchanged
	 */
	saveFileIcons(files: FileItem[], icon: string | null | undefined, color: string | null | undefined): void {
		const triggers: Set<RuleTrigger> = new Set();
		for (const file of files) {
			if (icon !== undefined) file.icon = icon;
			if (color !== undefined) file.color = color;
			const bmarkBase = this.settings.fileIcons[file.id];
			if (icon !== bmarkBase?.icon) triggers.add('icon');
			if (color !== bmarkBase?.color) triggers.add('color');
			this.updateIconSetting(this.settings.fileIcons, file.id, file.icon, file.color);
		}
		this.saveSettings();
		this.ruleManager?.triggerRulings('file', ...triggers);
	}

	/**
	 * Save bookmark icon changes to settings.
	 */
	saveBookmarkIcon(bmark: BookmarkItem, icon: string | null, color: string | null): void {
		const triggers: Set<RuleTrigger> = new Set();
		switch (bmark.category) {
			case 'file': // Fallthrough
			case 'folder': {
				const bmarkBase = this.settings.fileIcons[bmark.id];
				if (icon !== bmarkBase?.icon) triggers.add('icon');
				if (color !== bmarkBase?.color) triggers.add('color');
				this.updateIconSetting(this.settings.fileIcons, bmark.id, icon, color);
			}
			default: {
				this.updateIconSetting(this.settings.bookmarkIcons, bmark.id, icon, color);
			}
		}
		this.saveSettings();
		this.ruleManager?.triggerRulings('file', ...triggers);
	}

	/**
	 * Save multiple bookmark icon changes to settings.
	 * @param icon If undefined, leave icons unchanged
	 * @param color If undefined, leave colors unchanged
	 */
	saveBookmarkIcons(bmarks: BookmarkItem[], icon: string | null | undefined, color: string | null | undefined): void {
		const triggers: Set<RuleTrigger> = new Set();
		for (const bmark of bmarks) {
			if (icon !== undefined) bmark.icon = icon;
			if (color !== undefined) bmark.color = color;
			switch (bmark.category) {
				case 'file': // Fallthrough
				case 'folder': {
					const bmarkBase = this.settings.fileIcons[bmark.id];
					if (icon !== bmarkBase?.icon) triggers.add('icon');
					if (color !== bmarkBase?.color) triggers.add('color');
					this.updateIconSetting(this.settings.fileIcons, bmark.id, bmark.icon, bmark.color);
				}
				default: {
					this.updateIconSetting(this.settings.bookmarkIcons, bmark.id, bmark.icon, bmark.color);
				}
			}
		}
		this.saveSettings();
		this.ruleManager?.triggerRulings('file', ...triggers);
	}

	/**
	 * Save tag icon changes to settings.
	 */
	saveTagIcon(tag: TagItem, icon: string | null, color: string | null): void {
		this.updateIconSetting(this.settings.tagIcons, tag.id, icon, color);
		this.saveSettings();
	}

	/**
	 * Save property icon changes to settings.
	 */
	savePropertyIcon(prop: PropertyItem, icon: string | null, color: string | null): void {
		this.updateIconSetting(this.settings.propertyIcons, prop.id, icon, color);
		this.saveSettings();
	}

	/**
	 * Save multiple property icon changes to settings.
	 * @param icon If undefined, leave icons unchanged
	 * @param color If undefined, leave colors unchanged
	 */
	savePropertyIcons(props: PropertyItem[], icon: string | null | undefined, color: string | null | undefined): void {
		for (const prop of props) {
			if (icon !== undefined) prop.icon = icon;
			if (color !== undefined) prop.color = color;
			this.updateIconSetting(this.settings.propertyIcons, prop.id, prop.icon, prop.color);
		}
		this.saveSettings();
	}

	/**
	 * Save ribbon icon changes to settings.
	 */
	saveRibbonIcon(ribbonItem: RibbonItem, icon: string | null, color: string | null): void {
		this.updateIconSetting(this.settings.ribbonIcons, ribbonItem.id, icon, color);
		this.saveSettings();
	}

	/**
	 * Update icon in a given settings object.
	 */
	private updateIconSetting(settings: any, itemId: string, icon: string | null, color: string | null): void {
		if (icon || color) {
			if (!settings[itemId]) settings[itemId] = {};

			if (icon) settings[itemId].icon = icon;
			else delete settings[itemId].icon;
			if (color) settings[itemId].color = color;
			else delete settings[itemId].color;
		} else {
			delete settings[itemId];
		}
	}

	/**
	 * Load settings from storage.
	 */
	private async loadSettings(): Promise<void> {
		const { adapter } = this.app.vault;
		const dataPath = normalizePath(this.manifest.dir + '/data.json');
		const backupPath = normalizePath(dataPath + '.backup');

		// If a backup exists, check `data.json` for corruption
		if (await adapter.exists(backupPath + 1)) {
			let dataObject = {};

			// Try to read `data.json`
			if (await adapter.exists(dataPath)) {
				const dataJson = await adapter.read(dataPath);
				try { dataObject = JSON.parse(dataJson) } catch (e) { /* Ignore */ }
			}

			// If `data.json` is missing or corrupted, restore the backup
			if (Object.keys(dataObject).length === 0) {
				await this.restoreBackup();
			}
		}

		// Load `data.json`
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
	}

	/**
	 * Restore backup settings from storage.
	 */
	private async restoreBackup(): Promise<void> {
		const { adapter } = this.app.vault;
		const dataPath = normalizePath(this.manifest.dir + '/data.json');
		const backupPath = normalizePath(dataPath + '.backup');
		const backupStat = await adapter.stat(backupPath + 1);
		if (!backupStat) return;

		// Overwrite `data.json` with the backup
		if (await adapter.exists(dataPath)) {
			await adapter.remove(dataPath);
		}
		await adapter.copy(backupPath + 1, dataPath);

		// Describe how long ago the backup was made
		const ago = Date.now() - backupStat.mtime;
		let message = STRINGS.backups.backupNotice + '\n\n';
		if (ago < 60 * SECOND) {
			message += STRINGS.backups.backupSecondsAgo.replace('{#}', Math.round(ago / SECOND).toString());
		} else if (ago < 60 * MINUTE) {
			message += STRINGS.backups.backupMinutesAgo.replace('{#}', Math.round(ago / MINUTE).toString());
		} else if (ago < 24 * HOUR) {
			message += STRINGS.backups.backupHoursAgo.replace('{#}', Math.round(ago / HOUR).toString());
		} else {
			const dateFormat = new Intl.DateTimeFormat(getLanguage(), {
				dateStyle: 'long',
				timeStyle: 'short'
			}).format(backupStat?.mtime);
			message += STRINGS.backups.backupDate.replace('{#}', dateFormat);
		}

		// Notify user about the restored data
		new Notice(message, 0);
	}

	/**
	 * Save settings to storage.
	 */
	async saveSettings(): Promise<void> {
		if (this.isSaving) return;
		this.isSaving = true;

		// Sort item IDs for human-readability
		this.settings.appIcons = Object.fromEntries(Object.entries(this.settings.appIcons).sort());
		this.settings.tabIcons = Object.fromEntries(Object.entries(this.settings.tabIcons).sort());
		this.settings.fileIcons = Object.fromEntries(Object.entries(this.settings.fileIcons).sort());
		this.settings.bookmarkIcons = Object.fromEntries(Object.entries(this.settings.bookmarkIcons).sort());
		this.settings.propertyIcons = Object.fromEntries(Object.entries(this.settings.propertyIcons).sort());
		this.settings.ribbonIcons = Object.fromEntries(Object.entries(this.settings.ribbonIcons).sort());

		// Pause before writing to storage, in case the current state cause an instant crash
		await sleep(300);

		// Save and backup settings
		await this.saveData(this.settings);
		this.saveBackup();
		this.isSaving = false;
	}

	/**
	 * Backup settings to separate file
	 */
	async saveBackup(): Promise<void> {
		const dataPath = normalizePath(this.manifest.dir + '/data.json');
		const backupPath = normalizePath(dataPath + '.backup');
		const { adapter } = this.app.vault;

		// Determine if a new backup is due for creation
		const backupStat = await adapter.stat(backupPath + 1);
		const timeSinceLastBackup = Date.now() - (backupStat?.mtime ?? 0);
		const isDueForBackup = this.settings.maxBackups > 0 && timeSinceLastBackup >= HOUR * 3;

		// Loop through backup files
		for (let i = 10; i--; i === 0) {
			if (await adapter.exists(backupPath + i)) {
				if (i > this.settings.maxBackups || isDueForBackup && i === this.settings.maxBackups) {
					// Delete any backup numbered higher than the maximum, or due for replacement
					await adapter.remove(backupPath + i);
				} else if (isDueForBackup && i < this.settings.maxBackups) {
					// Increment backup number
					await adapter.rename(backupPath + i, backupPath + (i + 1));
				}
			}
		}

		// Create new backup if necessary
		if (isDueForBackup) {
			await adapter.copy(dataPath, backupPath + 1);
		}
	}

	/**
	 * @override
	 */
	onunload(): void {
		this.menuManager?.unload();
		this.ruleManager?.unload();
		this.appIconManager?.unload();
		this.tabIconManager?.unload();
		this.fileIconManager?.unload();
		this.bookmarkIconManager?.unload();
		this.tagIconManager?.unload();
		this.propertyIconManager?.unload();
		this.editorIconManager?.unload();
		this.ribbonIconManager?.unload();
		this.suggestionIconManager?.unload();
		this.suggestionDialogIconManager?.unload();
		this.refreshBody(true);
	}
}
