import { App, Hotkey } from 'obsidian';

interface InternalAppWithHotkeys {
	hotkeyManager?: {
		customKeys?: Record<string, Hotkey[]>;
	};
}

/**
 * Read user-configured hotkeys through one narrow, typed private-API boundary.
 */
export function getCommandHotkeys(app: App, commandId: string): Hotkey[] {
	const internalApp = app as unknown as InternalAppWithHotkeys;
	return internalApp.hotkeyManager?.customKeys?.[commandId] ?? [];
}
