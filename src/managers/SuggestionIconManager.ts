import { AbstractInputSuggest, EditorSuggest, TFile } from 'obsidian';
import IconicPlugin from 'src/IconicPlugin.js';
import IconManager from 'src/managers/IconManager.js';

const FILE_SUGGESTION = 'file';
const TAG_SUGGESTION = 'tag';
const PROPERTY_SUGGESTION = 'property';
const UNKNOWN_SUGGESTION = null;

type RenderSuggestionMethod = (value: unknown, el: HTMLElement) => void;
type AbstractShowSuggestionsMethod = (this: AbstractInputSuggest<unknown>, suggestions: unknown[]) => void;
type EditorShowSuggestionsMethod = (this: EditorSuggest<unknown>, suggestions: unknown[]) => void;

interface AbstractSuggestPrototype {
	showSuggestions: AbstractShowSuggestionsMethod;
}
interface EditorSuggestPrototype {
	showSuggestions: EditorShowSuggestionsMethod;
}

interface SuggestionValue {
	type?: string;
	file?: unknown;
	tag?: string;
	widget?: unknown;
	text?: string;
	name?: string;
}

function getSuggestionValue(value: unknown): SuggestionValue | null {
	return value !== null && typeof value === 'object'
		? value
		: null;
}

/**
 * Intercepts suggestion popovers to add custom icons.
 */
export default class SuggestionIconManager extends IconManager {
	private showAbstractSuggestionsOriginal: AbstractShowSuggestionsMethod | null = null;
	private showAbstractSuggestionsProxy: AbstractShowSuggestionsMethod | null = null;
	private readonly wrappedAbstractSuggests = new WeakSet<AbstractInputSuggest<unknown>>();

	private showEditorSuggestionsOriginal: EditorShowSuggestionsMethod | null = null;
	private showEditorSuggestionsProxy: EditorShowSuggestionsMethod | null = null;
	private readonly wrappedEditorSuggests = new WeakSet<EditorSuggest<unknown>>();

	constructor(plugin: IconicPlugin) {
		super(plugin);
		this.setupAbstractSuggestionProxies();
		this.setupEditorSuggestionProxies();
	}

	/**
	 * Intercept property key/value suggestion popovers.
	 */
	private setupAbstractSuggestionProxies(): void {
		const prototype = AbstractInputSuggest.prototype as unknown as AbstractSuggestPrototype;
		this.showAbstractSuggestionsOriginal = prototype.showSuggestions;
		const isDisabled = (): boolean => this.isDisabled();
		const wrappedSuggests = this.wrappedAbstractSuggests;
		const getSuggestionType = (value: unknown): string | null => this.getSuggestionType(value);
		const refreshFileIcon = (value: unknown, el: HTMLElement): void => this.refreshFileIcon(value, el);
		const refreshTagIcon = (value: unknown, el: HTMLElement): void => this.refreshTagIcon(value, el);
		const refreshPropertyIcon = (value: unknown, el: HTMLElement): void => this.refreshPropertyIcon(value, el);
		const showSuggestionsOriginal = this.showAbstractSuggestionsOriginal;
		this.showAbstractSuggestionsProxy = function(suggestions): void {
			if (!isDisabled() && !wrappedSuggests.has(this)) {
				wrappedSuggests.add(this);
				const renderSuggestionOriginal = this.renderSuggestion.bind(this);
				const renderSuggestion: RenderSuggestionMethod = (value, el) => {
					renderSuggestionOriginal(value, el);
					if (isDisabled()) return;
					switch (getSuggestionType(value)) {
						case FILE_SUGGESTION: refreshFileIcon(value, el); break;
						case TAG_SUGGESTION: refreshTagIcon(value, el); break;
						case PROPERTY_SUGGESTION: refreshPropertyIcon(value, el); break;
					}
				};
				this.renderSuggestion = renderSuggestion;
			}
			showSuggestionsOriginal?.call(this, suggestions);
		};
		prototype.showSuggestions = this.showAbstractSuggestionsProxy;
	}

	/**
	 * Intercept editor suggestion popovers.
	 */
	private setupEditorSuggestionProxies(): void {
		const prototype = EditorSuggest.prototype as unknown as EditorSuggestPrototype;
		this.showEditorSuggestionsOriginal = prototype.showSuggestions;
		const isDisabled = (): boolean => this.isDisabled();
		const wrappedSuggests = this.wrappedEditorSuggests;
		const getSuggestionType = (value: unknown): string | null => this.getSuggestionType(value);
		const refreshFileIcon = (value: unknown, el: HTMLElement): void => this.refreshFileIcon(value, el);
		const refreshTagIcon = (value: unknown, el: HTMLElement): void => this.refreshTagIcon(value, el);
		const refreshPropertyIcon = (value: unknown, el: HTMLElement): void => this.refreshPropertyIcon(value, el);
		const showSuggestionsOriginal = this.showEditorSuggestionsOriginal;
		this.showEditorSuggestionsProxy = function(suggestions): void {
			if (!isDisabled() && !wrappedSuggests.has(this)) {
				wrappedSuggests.add(this);
				const renderSuggestionOriginal = this.renderSuggestion.bind(this);
				const renderSuggestion: RenderSuggestionMethod = (value, el) => {
					renderSuggestionOriginal(value, el);
					if (isDisabled()) return;
					switch (getSuggestionType(value)) {
						case FILE_SUGGESTION: refreshFileIcon(value, el); break;
						case TAG_SUGGESTION: refreshTagIcon(value, el); break;
						case PROPERTY_SUGGESTION: refreshPropertyIcon(value, el); break;
					}
				};
				this.renderSuggestion = renderSuggestion;
			}
			showSuggestionsOriginal?.call(this, suggestions);
		};
		prototype.showSuggestions = this.showEditorSuggestionsProxy;
	}

	/**
	 * Determine which type of suggestion this is.
	 */
	private getSuggestionType(value: unknown): string | null {
		const suggestion = getSuggestionValue(value);
		if (!suggestion) {
			return UNKNOWN_SUGGESTION;
		} else if (suggestion.type === 'file' && suggestion.file instanceof TFile) {
			return FILE_SUGGESTION;
		} else if (suggestion.type === 'alias' && suggestion.file instanceof TFile) {
			return FILE_SUGGESTION;
		} else if (suggestion.tag) {
			return TAG_SUGGESTION;
		} else if (suggestion.widget) {
			return PROPERTY_SUGGESTION;
		} else {
			return UNKNOWN_SUGGESTION;
		}
	}

	/**
	 * Refresh a file suggestion icon.
	 */
	private refreshFileIcon(value: unknown, el: HTMLElement): void {
		const suggestion = getSuggestionValue(value);
		if (!(suggestion?.file instanceof TFile)) return;
		const fileId = suggestion.file.path;
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
	private refreshPropertyIcon(value: unknown, el: HTMLElement): void {
		const suggestion = getSuggestionValue(value);
		switch (suggestion?.type) {
			// Property suggestions
			case 'text': {
				const propId = suggestion.text;
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
				const propId = suggestion.name;
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
	private refreshTagIcon(value: unknown, el: HTMLElement): void {
		const tagId = getSuggestionValue(value)?.tag;
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

		const abstractPrototype = AbstractInputSuggest.prototype as unknown as AbstractSuggestPrototype;
		if (abstractPrototype.showSuggestions === this.showAbstractSuggestionsProxy && this.showAbstractSuggestionsOriginal) {
			abstractPrototype.showSuggestions = this.showAbstractSuggestionsOriginal;
		}

		const editorPrototype = EditorSuggest.prototype as unknown as EditorSuggestPrototype;
		if (editorPrototype.showSuggestions === this.showEditorSuggestionsProxy && this.showEditorSuggestionsOriginal) {
			editorPrototype.showSuggestions = this.showEditorSuggestionsOriginal;
		}
	}
}
