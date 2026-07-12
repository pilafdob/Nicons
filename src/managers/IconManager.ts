import { App, setIcon } from 'obsidian';
import IconicPlugin, { Item, Icon, EMOJIS } from 'src/IconicPlugin.js';
import ColorUtils from 'src/ColorUtils.js';
import { PACK_ICONS } from 'src/IconPackService.js';

/**
 * Base class for all icon managers.
 */
export default abstract class IconManager {
	protected readonly app: App;
	protected readonly plugin: IconicPlugin;
	private readonly renderedIcons = new WeakMap<HTMLElement, {
		id: string,
		source: string | null,
		child: Element,
	}>();
	private readonly eventListeners = new Map<keyof HTMLElementEventMap, Map<HTMLElement, {
		listener: EventListener,
		options?: boolean | AddEventListenerOptions,
	}>>();
	private readonly mutationObservers = new Map<HTMLElement, MutationObserver>();

	constructor(plugin: IconicPlugin) {
		this.app = plugin.app;
		this.plugin = plugin;
	}

	/**
	 * Refresh all icons controlled by this icon manager. Should be overridden.
	 */
	refreshIcons(unloading?: boolean): void {
		return;
	}

	/**
	 * Refresh icon inside a given element.
	 */
	protected refreshIcon(item: Item | Icon, iconEl: HTMLElement, onClick?: (event: MouseEvent) => void): void {
		iconEl.addClass('iconic-icon');

		if (item.icon) {
			const color = this.plugin.getIconRenderColor(item.icon, item.color);
			if (EMOJIS.has(item.icon)) {
				iconEl.empty();
				const emojiEl = iconEl.createDiv({ cls: 'iconic-emoji', text: item.icon });
				if (color) IconManager.colorFilter(emojiEl, color);
			} else {
				this.renderIconId(iconEl, item.icon, color);
			}
			iconEl.show();
		} else if (iconEl.hasClass('collapse-icon')) {
			if (this.plugin.settings.showAllFolderIcons && 'iconDefault' in item && item.iconDefault) {
				const color = this.plugin.getIconRenderColor(item.iconDefault, item.color);
				this.renderIconId(iconEl, item.iconDefault, color);
			} else {
				setIcon(iconEl, 'right-triangle');
				iconEl.removeClass('iconic-icon');
			}
			iconEl.show();
		} else if ('iconDefault' in item && item.iconDefault) {
			const color = this.plugin.getIconRenderColor(item.iconDefault, item.color);
			this.renderIconId(iconEl, item.iconDefault, color);
			iconEl.show();
		} else {
			iconEl.removeClass('iconic-icon');
			iconEl.hide();
		}

		const svgEl = iconEl.find('.svg-icon');
		if (svgEl) {
			const renderedIcon = item.icon ?? ('iconDefault' in item ? item.iconDefault : null);
			const color = this.plugin.getIconRenderColor(renderedIcon, item.color);
			if (color) {
				svgEl.style.setProperty('color', ColorUtils.toRgb(color));
			} else {
				svgEl.style.removeProperty('color');
			}
		}

		if (onClick) {
			this.setEventListener(iconEl, 'click', onClick, { capture: true });
		} else {
			this.stopEventListener(iconEl, 'click');
		}
	}

	private renderIconId(iconEl: HTMLElement, iconId: string, color: string | null): boolean {
		const source = PACK_ICONS.has(iconId) ? this.plugin.getPackIconSvg(iconId) : null;
		const renderedIcon = this.renderedIcons.get(iconEl);
		if (renderedIcon?.id === iconId
			&& renderedIcon.source === source
			&& renderedIcon.child.parentElement === iconEl
		) {
			return true;
		}

		let didRender: boolean;
		if (PACK_ICONS.has(iconId)) {
			didRender = this.plugin.renderPackIcon(iconEl, iconId, color);
		} else {
			setIcon(iconEl, iconId);
			didRender = true;
		}

		const child = iconEl.firstElementChild;
		if (didRender && child) {
			this.renderedIcons.set(iconEl, { id: iconId, source, child });
		} else {
			this.renderedIcons.delete(iconEl);
		}
		return didRender;
	}

	/**
	 * Set an inline color filter on an element.
	 */
	private static colorFilter(element: HTMLElement, color: string): void {
		const [h, s] = ColorUtils.toHslArray(color);
		element.style.filter = `grayscale() sepia() hue-rotate(${h - 50}deg) saturate(${s * 5}%)`;
	}

	/**
	 * Set an event listener which will be removed when plugin unloads.
	 * Replaces any listener (of the same element & type) set by this {@link IconManager}.
	 */
	protected setEventListener<K extends keyof HTMLElementEventMap>(element: HTMLElement, type: K, listener: (this: HTMLElement, event: HTMLElementEventMap[K]) => void, options?: boolean | AddEventListenerOptions): void {
		if (!this.eventListeners.has(type)) {
			this.eventListeners.set(type, new Map());
		}
		const map = this.eventListeners.get(type)!;
		if (map.has(element)) {
			const { listener, options } = map.get(element)!;
			element.removeEventListener(type, listener, options);
		}
		this.plugin.registerDomEvent(element, type, listener, options);
		map.set(element, { listener: listener as EventListener, options });
	}

	/**
	 * Stop an event listener (of the given element & type) set by this {@link IconManager}.
	 */
	protected stopEventListener(element: HTMLElement | null, type: keyof HTMLElementEventMap): void {
		if (!element) return;
		const listenerMap = this.eventListeners.get(type);
		if (listenerMap?.has(element)) {
			const { listener, options } = listenerMap.get(element)!;
			element.removeEventListener(type, listener, options);
			listenerMap.delete(element);
		}
	}

	/**
	 * Stop all event listeners set by this {@link IconManager}.
	 */
	protected stopEventListeners(): void {
		for (const [type, listenerMap] of this.eventListeners) {
			for (const [element, { listener, options }] of listenerMap) {
				element.removeEventListener(type, listener, options);
				listenerMap.delete(element);
			}
		}
	}

	/**
	 * Set a mutation observer which will be removed when plugin unloads.
	 * Replaces any observer (of the same element) set by this {@link IconManager}.
	 * 
	 * Callback runs once per mutation.
	 */
	protected setMutationObserver(element: HTMLElement | null, options: MutationObserverInit, callback: (mutation: MutationRecord) => void): void {
		this.setMutationsObserver(element, options, mutations => {
			for (const mutation of mutations) callback(mutation);
		});
	}

	/**
	 * Set a mutation observer which will be removed when plugin unloads.
	 * Replaces any observer (of the same element) set by this {@link IconManager}.
	 * 
	 * Callback runs once per batch of mutations.
	 */
	protected setMutationsObserver(element: HTMLElement | null, options: MutationObserverInit, callback: MutationCallback): void {
		if (!element) return;
		const observer = new MutationObserver(callback);
		if (this.mutationObservers.has(element)) {
			this.mutationObservers.get(element)?.disconnect();
		}
		observer.observe(element, options);
		this.mutationObservers.set(element, observer);
	}

	/**
	 * Stop a mutation observer (of the given element) set by this {@link IconManager}.
	 */
	protected stopMutationObserver(element: HTMLElement | null): void {
		if (!element) return;
		this.mutationObservers.get(element)?.disconnect();
		this.mutationObservers.delete(element);
	}

	/**
	 * Stop all mutation observers set by this {@link IconManager}.
	 */
	protected stopMutationObservers(): void {
		for (const [element, observer] of this.mutationObservers) {
			observer.disconnect();
			this.mutationObservers.delete(element);
		}
	}

	/**
	 * Revert all DOM changes when plugin unloads.
	 */
	unload(): void {
		this.stopEventListeners();
		this.stopMutationObservers();
	}
}
