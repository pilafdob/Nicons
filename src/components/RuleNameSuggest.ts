import { AbstractInputSuggest, TextComponent, prepareFuzzySearch } from 'obsidian';
import IconicPlugin, { Category } from 'src/IconicPlugin.js';

interface RuleNameSuggestion {
	text: string;
	score: number;
}

/**
 * Popover that suggests names for a rule.
 */
export default class RuleNameSuggest extends AbstractInputSuggest<RuleNameSuggestion> {
	private readonly plugin: IconicPlugin;
	private readonly page: Category;
	private readonly inputComponent: TextComponent;

	constructor(plugin: IconicPlugin, page: Category, inputComponent: TextComponent) {
		super(plugin.app, inputComponent.inputEl);
		this.plugin = plugin;
		this.page = page;
		this.inputComponent = inputComponent;
	}

	protected getSuggestions(query: string): RuleNameSuggestion[] {
		const currentName = this.inputComponent.getValue();
		const fuzzySearch = prepareFuzzySearch(query);
		const names = new Set((this.plugin.ruleManager?.getRules(this.page) ?? []).map(rule => rule.name));
		const suggestions: RuleNameSuggestion[] = [];

		for (const name of names) {
			if (name === currentName) continue;
			const result = fuzzySearch(name);
			if (result) suggestions.push({ text: name, score: result.score });
		}

		return suggestions.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
	}

	renderSuggestion(suggestion: RuleNameSuggestion, el: HTMLElement): void {
		el.setText(suggestion.text);
	}

	selectSuggestion(suggestion: RuleNameSuggestion): void {
		this.inputComponent.setValue(suggestion.text);
		this.inputComponent.onChanged();
		this.close();
	}
}
