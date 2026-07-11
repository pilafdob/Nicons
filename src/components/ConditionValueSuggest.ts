import { AbstractInputSuggest, TextComponent, prepareFuzzySearch } from 'obsidian';
import IconicPlugin, { Category } from 'src/IconicPlugin.js';
import { ConditionItem } from 'src/managers/RuleManager.js';

interface ValueSuggestion {
	text: string;
	score: number;
}

/**
 * Popover that suggests values already used by rules with the same condition source.
 */
export default class ConditionValueSuggest extends AbstractInputSuggest<ValueSuggestion> {
	private readonly plugin: IconicPlugin;
	private readonly page: Category;
	private readonly condition: ConditionItem;
	private readonly inputComponent: TextComponent;

	constructor(plugin: IconicPlugin, page: Category, condition: ConditionItem, inputComponent: TextComponent) {
		super(plugin.app, inputComponent.inputEl);
		this.plugin = plugin;
		this.page = page;
		this.condition = condition;
		this.inputComponent = inputComponent;
	}

	protected getSuggestions(query: string): ValueSuggestion[] {
		const currentValue = this.inputComponent.getValue();
		const fuzzySearch = prepareFuzzySearch(query);
		const values = new Set(
			(this.plugin.ruleManager?.getRules(this.page) ?? [])
				.flatMap(rule => rule.conditions)
				.filter(condition => condition.source === this.condition.source)
				.map(condition => condition.value)
				.filter(Boolean),
		);
		const suggestions: ValueSuggestion[] = [];

		for (const value of values) {
			if (value === currentValue) continue;
			const result = fuzzySearch(value);
			if (result) suggestions.push({ text: value, score: result.score });
		}

		return suggestions.sort((a, b) => b.score - a.score || a.text.localeCompare(b.text));
	}

	renderSuggestion(suggestion: ValueSuggestion, el: HTMLElement): void {
		el.setText(suggestion.text);
	}

	selectSuggestion(suggestion: ValueSuggestion): void {
		this.inputComponent.setValue(suggestion.text);
		this.inputComponent.onChanged();
		this.close();
	}
}
