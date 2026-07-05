import { AbstractInputSuggest, EditorSuggest, TFile } from 'obsidian';
import IconicPlugin from 'src/IconicPlugin.js';
import IconManager from 'src/managers/IconManager.js';

const FILE_SUGGESTION = 'file';
const TAG_SUGGESTION = 'tag';
const PROPERTY_SUGGESTION = 'property';
const UNKNOWN_SUGGESTION = null;

type SuggestionMethod = (...args: any[]) => any;

/**
 * Intercepts suggestion popovers to add custom icons.
 */
export default class SuggestionIconManager extends IconManager {
	private showAbstractSuggestionsOriginal: SuggestionMethod | null = null;
	private showAbstractSuggestionsProxy: SuggestionMethod | null = null;
	private renderAbstractSuggestionProxy: SuggestionMethod | null = null;

	private showEditorSuggestionsOriginal: SuggestionMethod | null = null;
	private showEditorSuggestionsProxy: SuggestionMethod | null = null;
	private renderEditorSuggestionProxy: SuggestionMethod | null = null;

	constructor(plugin: IconicPlugin) {
		super(plugin);
		this.setupAbstractSuggestionProxies();
		this.setupEditorSuggestionProxies();
	}

	/**
	 * Intercept property key/value suggestion popovers.
	 */
	private setupAbstractSuggestionProxies(): void {
		// Store original method
		this.showAbstractSuggestionsOriginal = Reflect.get(AbstractInputSuggest.prototype, 'showSuggestions') as SuggestionMethod;

		// Catch popovers before they open
		this.showAbstractSuggestionsProxy = new Proxy(this.showAbstractSuggestionsOriginal, {
			apply: (showSuggestions, popover: AbstractInputSuggest<any>, args: any[]) => {
				if (this.isDisabled()) {
					return showSuggestions.call(popover, ...args);
				}

				// Proxy renderSuggestion() for each instance
				if (popover.renderSuggestion !== this.renderAbstractSuggestionProxy) {
					this.renderAbstractSuggestionProxy = new Proxy(popover.renderSuggestion, {
						apply: (renderSuggestion, popover: AbstractInputSuggest<any>, args: any[]) => {
							// Call base method first to pre-populate elements
							const returnValue = Reflect.apply(renderSuggestion, popover, args);
							if (this.isDisabled()) return returnValue;

							const [value, el] = args;
							if (!value || !el.instanceOf(HTMLElement)) return returnValue;

							switch (this.getSuggestionType(value)) {
								case FILE_SUGGESTION: this.refreshFileIcon(value, el); break;
								case TAG_SUGGESTION: this.refreshTagIcon(value, el); break;
								case PROPERTY_SUGGESTION: this.refreshPropertyIcon(value, el); break;
							}

							return returnValue;
						}
					});

					// Replace original method
					popover.renderSuggestion = this.renderAbstractSuggestionProxy as typeof popover.renderSuggestion;
				}

				return Reflect.apply(showSuggestions, popover, args);
			}
		});

		// Replace original method
		Reflect.set(AbstractInputSuggest.prototype, 'showSuggestions', this.showAbstractSuggestionsProxy);
	}

	/**
	 * Intercept editor suggestion popovers.
	 */
	private setupEditorSuggestionProxies(): void {
		// Store original method
		this.showEditorSuggestionsOriginal = Reflect.get(EditorSuggest.prototype, 'showSuggestions') as SuggestionMethod;

		// Catch popovers before they open
		this.showEditorSuggestionsProxy = new Proxy(this.showEditorSuggestionsOriginal, {
			apply: (showSuggestions, popover: EditorSuggest<any>, args: any[]) => {
				if (this.isDisabled()) {
					return showSuggestions.call(popover, ...args);
				}

				// Proxy renderSuggestion() for each instance
				if (popover.renderSuggestion !== this.renderEditorSuggestionProxy) {
					this.renderEditorSuggestionProxy = new Proxy(popover.renderSuggestion, {
						apply: (renderSuggestion, popover: EditorSuggest<any>, args: any[]) => {
							// Call base method first to pre-populate elements
							const returnValue = Reflect.apply(renderSuggestion, popover, args);
							if (this.isDisabled()) return returnValue;

							const [value, el] = args;
							if (!value || !el.instanceOf(HTMLElement)) return returnValue;

							switch (this.getSuggestionType(value)) {
								case FILE_SUGGESTION: this.refreshFileIcon(value, el); break;
								case TAG_SUGGESTION: this.refreshTagIcon(value, el); break;
								case PROPERTY_SUGGESTION: this.refreshPropertyIcon(value, el); break;
							}

							return returnValue;
						}
					});

					// Replace original method
					popover.renderSuggestion = this.renderEditorSuggestionProxy as typeof popover.renderSuggestion;
				}

				return Reflect.apply(showSuggestions, popover, args);
			}
		});

		// Replace original method
		Reflect.set(EditorSuggest.prototype, 'showSuggestions', this.showEditorSuggestionsProxy);
	}

	/**
	 * Determine which type of suggestion this is.
	 */
	private getSuggestionType(value: any): string | null {
		if (!value || typeof value !== 'object') {
			return UNKNOWN_SUGGESTION;
		} else if (value.type === 'file' && value.file instanceof TFile) {
			return FILE_SUGGESTION;
		} else if (value.type === 'alias' && value.file instanceof TFile) {
			return FILE_SUGGESTION;
		} else if (value.tag) {
			return TAG_SUGGESTION;
		} else if (value.widget) {
			return PROPERTY_SUGGESTION;
		} else {
			return UNKNOWN_SUGGESTION;
		}
	}

	/**
	 * Refresh a file suggestion icon.
	 */
	private refreshFileIcon(value: any, el: HTMLElement): void {
		const fileId: string = value?.file.path;
		if (!fileId) return;
		const file = this.plugin.getFileItem(fileId);
		if (!file) return;
		const rule = this.plugin.ruleManager?.checkRuling('file', fileId) ?? file;

		el.addClass('iconic-item');
		const iconContainerEl = el.find(':scope > .suggestion-icon')
			?? createDiv({ cls: 'suggestion-icon' });
		const iconEl = iconContainerEl.find(':scope > .suggestion-flair')
			?? iconContainerEl.createSpan({ cls: 'suggestion-flair' });
		el.prepend(iconContainerEl);
		if (rule) {
			if (!rule.icon && !rule.color) iconEl.addClass('iconic-invisible');
			this.refreshIcon(rule, iconEl);
		}
	}

	/**
	 * Refresh a property suggestion icon.
	 */
	private refreshPropertyIcon(value: any, el: HTMLElement): void {
		switch (value?.type) {
			// Property suggestions
			case 'text': {
				const propId = value?.text;
				if (propId) {
					const prop = this.plugin.getPropertyItem(propId);
					const iconEl = el.find(':scope > .suggestion-icon > .suggestion-flair');
					if (iconEl) this.refreshIcon(prop, iconEl);
				}
				break;
			}
			// BASES: File attribute suggestions
			case 'file': break;
			// BASES: Formula suggestions
			case 'formula': break;
			// BASES: Property suggestions
			case 'note': {
				const propId = value?.name;
				if (propId) {
					const prop = this.plugin.getPropertyItem(propId);
					const iconEl = el.find(':scope > .suggestion-icon > .suggestion-flair');
					if (iconEl) this.refreshIcon(prop, iconEl);
				}
				break;
			}
		}
	}

	/**
	 * Refresh a tag suggestion icon.
	 */
	private refreshTagIcon(value: any, el: HTMLElement): void {
		const tagId = value?.tag;
		if (tagId) {
			el.addClass('mod-complex', 'iconic-item');
			const tag = this.plugin.getTagItem(tagId);
			const iconContainerEl = el.find(':scope > .suggestion-icon')
				?? createDiv({ cls: 'suggestion-icon' });
			const iconEl = iconContainerEl.find(':scope > .suggestion-flair')
				?? iconContainerEl.createSpan({ cls: 'suggestion-flair' });
			el.prepend(iconContainerEl);
			if (tag) {
				tag.iconDefault = 'lucide-tag';
				if (!tag.icon && !tag.color) iconEl.addClass('iconic-invisible');
				this.refreshIcon(tag, iconEl);
			}
		}
	}

	/**
	 * Check whether user has disabled suggestion icons.
	 */
	private isDisabled(): boolean {
		return !this.plugin.settings.showSuggestionIcons;
	}

	/**
	 * @override
	 */
	unload(): void {
		super.unload();

		// @ts-expect-error (Private API)
		if (AbstractInputSuggest.prototype.showSuggestions === this.showAbstractSuggestionsProxy) {
			// @ts-expect-error (Private API)
			AbstractInputSuggest.prototype.showSuggestions = this.showAbstractSuggestionsOriginal;
		}

		// @ts-expect-error (Private API)
		if (EditorSuggest.prototype.showSuggestions === this.showEditorSuggestionsProxy) {
			// @ts-expect-error (Private API)
			EditorSuggest.prototype.showSuggestions = this.showEditorSuggestionsOriginal;
		}
	}
}
