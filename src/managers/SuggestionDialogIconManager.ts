import { Instruction, Plugin, SuggestModal, TFile, TFolder, WorkspaceLeaf } from 'obsidian';
import IconicPlugin, { PLUGIN_TAB_TYPES } from 'src/IconicPlugin.js';
import IconManager from 'src/managers/IconManager.js';

type PluginModal = SuggestModal<unknown> & { plugin: Plugin };

interface SuggestionValue {
	type?: string;
	file?: unknown;
	item?: unknown;
	text?: string;
	name?: string;
	tag?: string;
	widget?: unknown;
}

interface BookmarkSuggestion {
	type?: string;
	path?: string;
}

function getSuggestionValue(value: unknown): SuggestionValue | null {
	return value !== null && typeof value === 'object'
		? value
		: null;
}

function getBookmarkSuggestion(value: unknown): BookmarkSuggestion | null {
	return value !== null && typeof value === 'object'
		? value
		: null;
}

/**
 * Allow type-safe access to a modal.plugin property.
 */
function isPluginModal(modal: SuggestModal<unknown>): modal is PluginModal {
	return (modal as PluginModal).plugin instanceof Plugin;
}

const QUICK_SWITCHER = 'qs';
const QUICK_SWITCHER_PP = 'qs++';
const ANOTHER_QUICK_SWITCHER = 'aqs';
const MOVE_FILE_DIALOG = 'mfd';
type OnOpenMethod = (this: SuggestModal<unknown>) => Promise<void> | void;
type SetInstructionsMethod = (this: SuggestModal<unknown>, instructions: Instruction[]) => void;

interface InternalSuggestModalPrototype {
	onOpen: OnOpenMethod;
	setInstructions: SetInstructionsMethod;
}

/**
 * Intercepts suggestion dialogs like quick switchers and "Move file" dialogs to add custom icons.
 */
export default class SuggestionDialogIconManager extends IconManager {
	private onOpenOriginal: OnOpenMethod;
	private onOpenProxy: OnOpenMethod;
	private setInstructionsOriginal: SetInstructionsMethod;
	private setInstructionsProxy: SetInstructionsMethod;
	private readonly wrappedModals = new WeakSet<SuggestModal<unknown>>();

	constructor(plugin: IconicPlugin) {
		super(plugin);

		// Store original methods
		const prototype = SuggestModal.prototype as unknown as InternalSuggestModalPrototype;
		this.onOpenOriginal = prototype.onOpen;
		this.setInstructionsOriginal = prototype.setInstructions;

		// Catch Quick Switcher, Quick Switcher++, and "Move file" dialogs
		const isDisabled = (): boolean => this.isDisabled();
		const getModalType = (modal: SuggestModal<unknown>): string | null => this.getModalType(modal);
		const wrapRenderSuggestion = (modal: SuggestModal<unknown>, modalType: string): void => this.wrapRenderSuggestion(modal, modalType);
		const onOpenOriginal = this.onOpenOriginal;
		this.onOpenProxy = function(this: SuggestModal<unknown>): void {
			if (!isDisabled()) {
				const modalType = getModalType(this);
				if (modalType) wrapRenderSuggestion(this, modalType);
			}
			void onOpenOriginal.call(this);
		};

		// Catch Another Quick Switcher, which never call super.onOpen()
		const setInstructionsOriginal = this.setInstructionsOriginal;
		this.setInstructionsProxy = function(this: SuggestModal<unknown>, instructions: Instruction[]): void {
			if (!isDisabled() && getModalType(this) === ANOTHER_QUICK_SWITCHER) {
				wrapRenderSuggestion(this, ANOTHER_QUICK_SWITCHER);
			}
			setInstructionsOriginal.call(this, instructions);
		};

		// Replace original methods
		prototype.onOpen = this.onOpenProxy;
		prototype.setInstructions = this.setInstructionsProxy;
	}

	private wrapRenderSuggestion(modal: SuggestModal<unknown>, modalType: string): void {
		if (this.wrappedModals.has(modal)) return;
		this.wrappedModals.add(modal);
		const renderSuggestionOriginal = modal.renderSuggestion.bind(modal);
		modal.renderSuggestion = (value, el): void => {
			renderSuggestionOriginal(value, el);
			if (this.isDisabled()) return;
			switch (modalType) {
				case QUICK_SWITCHER:
					modal.modalEl.addClass('iconic-prompt');
					this.refreshSuggestionIconQS(value, el);
					break;
				case QUICK_SWITCHER_PP:
					modal.modalEl.addClass('iconic-prompt');
					this.refreshSuggestionIconQSPP(value, el);
					break;
				case ANOTHER_QUICK_SWITCHER:
					modal.modalEl.addClass('iconic-another-quick-switcher');
					this.refreshSuggestionIconAQS(value, el);
					break;
				case MOVE_FILE_DIALOG:
					modal.modalEl.addClass('iconic-prompt');
					this.refreshSuggestionIconMFD(value, el);
			}
		};
	}

	/**
	 * Determine which type of modal this is.
	 */
	private getModalType(modal: SuggestModal<unknown>): string | null {
		// Check for Another Quick Switcher
		if (modal.modalEl.hasClass('another-quick-switcher__modal-prompt')) {
			return ANOTHER_QUICK_SWITCHER;
		}

		// Check for Quick Switcher++
		if (isPluginModal(modal) && modal.plugin.manifest.id === 'darlal-switcher-plus') {
			return QUICK_SWITCHER_PP;
		}

		// Check for Quick Switcher
		if ('shouldShowMarkdown' in modal) {
			return QUICK_SWITCHER;
		}

		// Check for "Move file" dialog
		if ('files' in modal && 'emptyMatch' in modal) {
			return MOVE_FILE_DIALOG;
		}

		return null;
	}

	/**
	 * Refresh icon of a Quick Switcher suggestion.
	 */
	private refreshSuggestionIconQS(value: unknown, el: HTMLElement): void {
		const suggestion = getSuggestionValue(value);
		switch (suggestion?.type) {
			case 'alias': // Fallthrough
			case 'file': {
				if (suggestion.file instanceof TFile) {
					const file = this.plugin.getFileItem(suggestion.file.path);
					const rule = this.plugin.ruleManager?.checkRuling('file', file.id) ?? file;
					if (rule.icon || rule.color) {
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						el.prepend(iconEl);
						this.refreshIcon(rule, iconEl);
					}
				}
				break;
			}
			case 'bookmark': {
				const bmarkBase = getBookmarkSuggestion(suggestion.item);
				if (bmarkBase?.type === 'file' && bmarkBase.path) {
					const file = this.plugin.getFileItem(bmarkBase.path);
					const rule = this.plugin.ruleManager?.checkRuling('file', file.id) ?? file;
					if (rule.icon || rule.color) {
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						this.refreshIcon(rule, iconEl);
					}
				}
				break;
			}
		}
	}

	/**
	 * Refresh icon of a Quick Switcher++ suggestion.
	 */
	private refreshSuggestionIconQSPP(value: unknown, el: HTMLElement): void {
		const suggestion = getSuggestionValue(value);
		switch (suggestion?.type) {
			case 'relatedItemsList': // Fallthrough
			case 'file': {
				if (suggestion.file instanceof TFile) {
					const file = this.plugin.getFileItem(suggestion.file.path);
					const rule = this.plugin.ruleManager?.checkRuling('file', file.id) ?? file;
					if (rule.icon || rule.color) {
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						el.prepend(iconEl);
						this.refreshIcon(rule, iconEl);
					}
				}
				break;
			}
			case 'bookmark': {
				const bmarkBase = getBookmarkSuggestion(suggestion.item);
				if ((bmarkBase?.type === 'file' || bmarkBase?.type === 'folder') && bmarkBase.path) {
					const file = this.plugin.getFileItem(bmarkBase.path);
					const rule = this.plugin.ruleManager?.checkRuling(bmarkBase.type, file.id) ?? file;
					if (rule.icon || rule.color) {
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						el.prepend(iconEl);
						this.refreshIcon(rule, iconEl);
					}
				}
				break;
			}
			case 'editorList': { // Represents an open tab in Editor Mode
				if (!(suggestion.item instanceof WorkspaceLeaf)) break;
				const tabType = suggestion.item.view.getViewType();
				const iconDefault = suggestion.item.view.getIcon();

				// Distinguish between file tabs and plugin tabs
				if (!PLUGIN_TAB_TYPES.includes(tabType) && suggestion.file instanceof TFile) {
					const file = this.plugin.getFileItem(suggestion.file.path);
					const rule = this.plugin.ruleManager?.checkRuling('file', file.id) ?? file;
					if (rule.icon || rule.color) {
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						el.prepend(iconEl);
						this.refreshIcon(rule, iconEl);
					}
				} else {
					const tab = this.plugin.getTabItem(tabType);
					if (tab) {
						tab.iconDefault = iconDefault;
						const iconEl = el.find('.iconic-icon') ?? el.createDiv();
						el.prepend(iconEl);
						this.refreshIcon(tab, iconEl);
					}
				}
				break;
			}
		}
	}

	/**
	 * Refresh icon of Another Quick Switcher suggestion.
	 */
	private refreshSuggestionIconAQS(value: unknown, el: HTMLElement): void {
		const tFile = getSuggestionValue(value)?.file;
		if (!(tFile instanceof TFile)) return;

		const itemEl = el.find('.another-quick-switcher__item');
		const file = this.plugin.getFileItem(tFile.path);
		const rule = this.plugin.ruleManager?.checkRuling('file', file.id) ?? file;

		if (rule.icon || rule.color) {
			const iconEl = itemEl.find('.iconic-icon') ?? itemEl.createDiv();
			itemEl.prepend(iconEl);
			this.refreshIcon(rule, iconEl);
		}
	}

	/**
	 * Refresh icon of a "Move file" dialog suggestion.
	 */
	private refreshSuggestionIconMFD(value: unknown, el: HTMLElement): void {
		const tFolder = getSuggestionValue(value)?.item;
		if (!(tFolder instanceof TFolder)) return;

		el.addClass('mod-complex');
		const contentEl = el.createDiv({ cls: 'suggestion-content' });
		const titleEl = contentEl.createDiv({ cls: 'suggestion-title '});

		// Move text nodes and .suggestion-highlights into .suggestion-title
		for (const node of [...el.childNodes]) {
			if (node !== contentEl) titleEl.append(node);
		}

		const folder = this.plugin.getFileItem(tFolder.path);
		const rule = this.plugin.ruleManager?.checkRuling('folder', folder.id) ?? folder;

		if (rule.icon || rule.color) {
			const iconEl = el.find('.iconic-icon') ?? el.createDiv();
			el.prepend(iconEl);
			this.refreshIcon(rule, iconEl);
		}
	}

	/**
	 * Check whether user has disabled all suggestion dialog icons.
	 */
	private isDisabled(): boolean {
		return !this.plugin.settings.showQuickSwitcherIcons && !this.plugin.settings.showMoveFileIcons;
	}

	/**
	 * @override
	 */
	unload(): void {
		super.unload();
		if (SuggestModal.prototype.onOpen === this.onOpenProxy) {
			SuggestModal.prototype.onOpen = this.onOpenOriginal;
		}
		if (SuggestModal.prototype.setInstructions === this.setInstructionsProxy) {
			SuggestModal.prototype.setInstructions = this.setInstructionsOriginal;
		}
	}
}
