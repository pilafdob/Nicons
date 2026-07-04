import { ExtraButtonComponent } from 'obsidian';
import ColorUtils from 'src/ColorUtils.js';
import { ICONS, EMOJIS } from 'src/IconicPlugin.js';
import { PACK_ICONS } from 'src/IconPackService.js';

const DEFAULT_ICON = 'lucide-file';

/**
 * Component that displays a clickable icon or emoji.
 */
export default class IconButtonComponent extends ExtraButtonComponent {
	private color: string | null = null;

	// Components
	private iconEl: Element | null = null;
	private emojiEl: HTMLElement | null = null;

	constructor(containerEl: HTMLElement) {
		super(containerEl);
		super.setIcon(DEFAULT_ICON);
	}

	/**
	 * Set the icon or emoji to display.
	 */
	setIcon(iconId: string | null): this {
		iconId ??= DEFAULT_ICON;
		if (PACK_ICONS.has(iconId)) {
			this.emojiEl = null;
			this.extraSettingsEl.empty();
			const svgText = PACK_ICONS.get(iconId)?.variants.regular ?? Object.values(PACK_ICONS.get(iconId)?.variants ?? {})[0];
			if (svgText) {
				const parser = new DOMParser();
				const doc = parser.parseFromString(svgText, 'image/svg+xml');
					const svgEl = this.extraSettingsEl.ownerDocument.importNode(doc.documentElement, true) as unknown as SVGSVGElement;
				svgEl.addClasses(['svg-icon', 'nicons-pack-icon']);
				this.extraSettingsEl.appendChild(svgEl);
				this.iconEl = svgEl;
			}
		} else if (ICONS.has(iconId)) {
			this.emojiEl = null;
			super.setIcon(iconId);
			this.iconEl = this.extraSettingsEl.find('.svg-icon');
		} else if (EMOJIS.has(iconId)) {
			this.iconEl = null;
			this.extraSettingsEl.empty();
			this.emojiEl = this.extraSettingsEl.createDiv({ cls: 'iconic-emoji', text: iconId });
		}
		if (this.color) this.setColor(this.color);
		return this;
	}

	/**
	 * Set the icon color.
	 */
	setColor(color: string | null): this {
		this.color = color;
		if (this.iconEl) {
			if (color) {
				this.extraSettingsEl.style.color = ColorUtils.toRgb(color);
			} else {
				this.extraSettingsEl.style.removeProperty('color');
			}
		} else if (this.emojiEl) {
			if (color) {
				this.setEmojiColor(color);
			} else {
				this.emojiEl.style.removeProperty('filter');
			}
		}
		return this;
	}

	/**
	 * Set the color filter of an emoji icon.
	 */
	private setEmojiColor(color: string | null): void {
		if (!this.emojiEl) return;
		const [h, s] = ColorUtils.toHslArray(color);
		this.emojiEl.style.filter = `grayscale() sepia() hue-rotate(${h - 50}deg) saturate(${s * 5}%)`;
	}
}
