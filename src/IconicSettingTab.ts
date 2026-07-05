import { ExtraButtonComponent, Notice, Platform, PluginSettingTab, SettingGroup, setIcon } from 'obsidian';
import IconicPlugin, { EMOJIS, FileItem, ICONS, Item, STRINGS } from 'src/IconicPlugin.js';
import RulePicker from 'src/dialogs/RulePicker.js';
import UsageChecker from 'src/dialogs/UsageChecker.js';
import IconPicker from 'src/dialogs/IconPicker.js';
import ColorUtils from 'src/ColorUtils.js';

/**
 * Exposes UI settings for the plugin.
 */
export default class IconicSettingTab extends PluginSettingTab {
	private readonly plugin: IconicPlugin;
	private readonly indicators = {
		biggerIcons: undefined as unknown,
		clickableIcons: undefined as unknown,
		showItemName: undefined as unknown,
		biggerSearchResults: undefined as unknown,
		colorPicker1: undefined as unknown,
		colorPicker2: undefined as unknown,
	} as Record<string, ExtraButtonComponent>;
	private newIconColorIcon: string | null = null;
	private newIconColorColor: string | null = 'green';
	public icon = 'lucide-images';

	constructor(plugin: IconicPlugin) {
		super(plugin.app, plugin);
		this.plugin = plugin;
	}

	/**
	 * @override
	 */
	display(): void {
		this.containerEl.empty();

		// GROUP: Icon pack
		const groupIconPack = new SettingGroup(this.containerEl)
			.setHeading('Icon pack');

		groupIconPack.addSetting(setting => setting
			.setName('Active icon pack')
			.setDesc(this.plugin.settings.iconPackPath ?? 'Bundled Phosphor Icons')
			.addButton(button => button
				.setButtonText('Choose icon pack')
				.onClick(async () => {
					await this.plugin.chooseIconPack();
					this.display();
				})
			)
			.addExtraButton(button => button
				.setIcon('lucide-rotate-ccw')
				.setTooltip('Use bundled Phosphor Icons')
				.onClick(async () => {
					await this.plugin.useBundledIconPack();
					this.display();
				})
			)
		);

		const variants = this.plugin.iconPack?.variants ?? [];
		if (variants.length > 0) {
			groupIconPack.addSetting(setting => setting
				.setName('Style')
				.setDesc('Choose the active style for icon packs that include multiple variants.')
				.addDropdown(dropdown => {
					for (const variant of variants) {
						dropdown.addOption(variant, variant[0]?.toUpperCase() + variant.slice(1));
					}
					dropdown
						.setValue(this.plugin.settings.iconPackVariant)
						.onChange(value => {
							this.plugin.settings.iconPackVariant = value;
							void this.plugin.saveSettings();
							this.plugin.refreshManagers();
						});
				})
			);
		}

		groupIconPack.addSetting(setting => setting
			.setName('Icon pack size')
			.setDesc('Scale selected pack icons relative to Obsidian icon sizes.')
			.addSlider(slider => slider
				.setLimits(75, 150, 5)
				.setValue(this.plugin.settings.iconPackSize)
				.onChange(value => {
					this.plugin.settings.iconPackSize = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
					this.plugin.refreshManagers();
				})
			)
		);

		// GROUP: Top
		const groupTop = new SettingGroup(this.containerEl);

		// SETTING: Rules
		groupTop.addSetting(setting => setting
			.setName(STRINGS.settings.rulebook.name)
			.setDesc(STRINGS.settings.rulebook.desc)
			.addButton(button => { button
				.setButtonText(STRINGS.settings.manage)
				.onClick(() => {
					// Silently no-op if rulebook hasn't finished loading
					if (!this.plugin.ruleManager) return;
					// @ts-expect-error (Private API)
					this.app.setting.close();
					RulePicker.open(this.plugin);
				});
			})
		);

		// SETTING: Bigger icons
		groupTop.addSetting(setting => setting
			.setName(STRINGS.settings.biggerIcons.name)
			.setDesc(STRINGS.settings.biggerIcons.desc)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.biggerIcons = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('on', STRINGS.settings.values.on)
				.addOption('desktop', STRINGS.settings.values.desktop)
				.addOption('mobile', STRINGS.settings.values.mobile)
				.addOption('off', STRINGS.settings.values.off)
				.setValue(this.plugin.settings.biggerIcons)
				.onChange(value => {
					this.refreshIndicator(this.indicators.biggerIcons, value);
					this.plugin.settings.biggerIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				});
				this.refreshIndicator(this.indicators.biggerIcons, dropdown.getValue());
			})
		);

		// SETTING: Clickable icons
		groupTop.addSetting(setting => setting
			.setName(Platform.isDesktop
				? STRINGS.settings.clickableIcons.nameDesktop
				: STRINGS.settings.clickableIcons.nameMobile
			)
			.setDesc(Platform.isDesktop
				? STRINGS.settings.clickableIcons.descDesktop
				: STRINGS.settings.clickableIcons.descMobile
			)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.clickableIcons = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('on', STRINGS.settings.values.on)
				.addOption('desktop', STRINGS.settings.values.desktop)
				.addOption('mobile', STRINGS.settings.values.mobile)
				.addOption('off', STRINGS.settings.values.off)
				.setValue(this.plugin.settings.clickableIcons)
				.onChange(value => {
					this.refreshIndicator(this.indicators.clickableIcons, value);
					this.plugin.settings.clickableIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers();
					this.plugin.refreshBody();
				});
				this.refreshIndicator(this.indicators.clickableIcons, dropdown.getValue());
			})
		);

		// GROUP: Sidebars & tabs
		const groupSidebarsAndTabs = new SettingGroup(this.containerEl)
			.setHeading(STRINGS.settings.headingSidebarsAndTabs);

		// SETTING: Show all file icons
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.showAllFileIcons.name)
			.setDesc(STRINGS.settings.showAllFileIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showAllFileIcons)
				.onChange(value => {
					this.plugin.settings.showAllFileIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('file');
				})
			)
		);

		// SETTING: Show file type icons
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.showFileTypeIcons.name)
			.setDesc(STRINGS.settings.showFileTypeIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showFileTypeIcons)
				.onChange(value => {
					this.plugin.settings.showFileTypeIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('file', 'folder');
				})
			)
		);

		// SETTING: File type colours
		let newFileTypeExtension = '';
		let newFileTypeColor = 'green';
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.fileTypeColors.name)
			.setDesc(STRINGS.settings.fileTypeColors.desc)
			.addText(text => text
				.setPlaceholder(STRINGS.settings.fileTypeColors.extensionPlaceholder)
				.onChange(value => {
					newFileTypeExtension = value;
				})
			)
			.addColorPicker(colorPicker => colorPicker
				.setValueRgb(ColorUtils.toRgbObject(newFileTypeColor))
				.onChange(value => {
					newFileTypeColor = value;
				})
			)
			.addButton(button => button
				.setButtonText(STRINGS.settings.fileTypeColors.add)
				.setCta()
				.onClick(() => {
					const extension = this.plugin.normalizeFileTypeExtension(newFileTypeExtension);
					if (!extension) {
						new Notice(STRINGS.settings.fileTypeColors.invalidExtension);
						return;
					}
					this.plugin.settings.fileTypeColors[extension] = newFileTypeColor;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('file');
					this.display();
				})
			)
		);

		for (const [extension, color] of Object.entries(this.plugin.settings.fileTypeColors).sort()) {
			groupSidebarsAndTabs.addSetting(setting => setting
				.setName(`.${extension}`)
				.addColorPicker(colorPicker => colorPicker
					.setValueRgb(ColorUtils.toRgbObject(color))
					.onChange(value => {
						this.plugin.settings.fileTypeColors[extension] = value;
						void this.plugin.saveSettings();
						this.plugin.refreshManagers('file');
					})
				)
				.addExtraButton(button => button
					.setIcon('lucide-trash-2')
					.setTooltip(STRINGS.settings.fileTypeColors.remove)
					.onClick(() => {
						delete this.plugin.settings.fileTypeColors[extension];
						void this.plugin.saveSettings();
						this.plugin.refreshManagers('file');
						this.display();
					})
				)
			);
		}

		// SETTING: Icon colours
		groupSidebarsAndTabs.addSetting(setting => {
			let previewButton: ExtraButtonComponent;
			setting
				.setName(STRINGS.settings.iconColors.name)
				.setDesc(STRINGS.settings.iconColors.desc)
				.addExtraButton(button => {
					previewButton = button;
					this.renderIconColorPreview(button.extraSettingsEl, this.newIconColorIcon, this.newIconColorColor);
					button
						.setTooltip(STRINGS.settings.iconColors.choose)
						.onClick(() => this.openIconColorPicker(this.newIconColorIcon, this.newIconColorColor, (icon, color) => {
							this.newIconColorIcon = icon;
							this.newIconColorColor = color;
							this.display();
						}));
				})
				.addButton(button => button
					.setButtonText(STRINGS.settings.iconColors.choose)
					.onClick(() => this.openIconColorPicker(this.newIconColorIcon, this.newIconColorColor, (icon, color) => {
						this.newIconColorIcon = icon;
						this.newIconColorColor = color;
						this.display();
					}))
				)
				.addColorPicker(colorPicker => colorPicker
					.setValueRgb(ColorUtils.toRgbObject(this.newIconColorColor))
					.onChange(value => {
						this.newIconColorColor = value;
						if (previewButton) this.renderIconColorPreview(previewButton.extraSettingsEl, this.newIconColorIcon, value);
					})
				)
				.addButton(button => button
					.setButtonText(STRINGS.settings.iconColors.add)
					.setCta()
					.onClick(() => {
						if (!this.newIconColorIcon || !this.newIconColorColor) {
							new Notice(STRINGS.settings.iconColors.invalidIcon);
							return;
						}
						this.plugin.settings.iconColors[this.newIconColorIcon] = this.newIconColorColor;
						this.newIconColorIcon = null;
						this.newIconColorColor = 'green';
						void this.plugin.saveSettings();
						this.plugin.refreshManagers();
						this.display();
					})
				);
		});

		for (const [icon, color] of Object.entries(this.plugin.settings.iconColors).sort((a, b) => this.getIconLabel(a[0]).localeCompare(this.getIconLabel(b[0])))) {
			groupSidebarsAndTabs.addSetting(setting => {
				let previewButton: ExtraButtonComponent;
				setting
					.setName(this.getIconLabel(icon))
					.addExtraButton(button => {
						previewButton = button;
						this.renderIconColorPreview(button.extraSettingsEl, icon, color);
						button
							.setTooltip(STRINGS.settings.iconColors.choose)
							.onClick(() => this.openIconColorPicker(icon, color, (newIcon, newColor) => {
								if (!newIcon || !newColor) {
									new Notice(STRINGS.settings.iconColors.invalidIcon);
									return;
								}
								if (newIcon !== icon) delete this.plugin.settings.iconColors[icon];
								this.plugin.settings.iconColors[newIcon] = newColor;
								void this.plugin.saveSettings();
								this.plugin.refreshManagers();
								this.display();
							}));
					})
					.addColorPicker(colorPicker => colorPicker
						.setValueRgb(ColorUtils.toRgbObject(color))
						.onChange(value => {
							this.plugin.settings.iconColors[icon] = value;
							if (previewButton) this.renderIconColorPreview(previewButton.extraSettingsEl, icon, value);
							void this.plugin.saveSettings();
							this.plugin.refreshManagers();
						})
					)
					.addExtraButton(button => button
						.setIcon('lucide-trash-2')
						.setTooltip(STRINGS.settings.iconColors.remove)
						.onClick(() => {
							delete this.plugin.settings.iconColors[icon];
							void this.plugin.saveSettings();
							this.plugin.refreshManagers();
							this.display();
						})
					);
			});
		}

		// SETTING: Show all folder icons
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.showAllFolderIcons.name)
			.setDesc(STRINGS.settings.showAllFolderIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showAllFolderIcons)
				.onChange(value => {
					this.plugin.settings.showAllFolderIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('folder');
				})
			)
		);

		// SETTING: Minimal folder icons
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.minimalFolderIcons.name)
			.setDesc(STRINGS.settings.minimalFolderIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.minimalFolderIcons)
				.onChange(value => {
					this.plugin.settings.minimalFolderIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('folder');
				})
			)
		);

		// SETTING: Show Markdown tab icons
		groupSidebarsAndTabs.addSetting(setting => setting
			.setName(STRINGS.settings.showMarkdownTabIcons.name)
			.setDesc(STRINGS.settings.showMarkdownTabIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showMarkdownTabIcons)
				.onChange(value => {
					this.plugin.settings.showMarkdownTabIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				})
			)
		);

		// GROUP: Editor
		const groupEditor = new SettingGroup(this.containerEl)
			.setHeading(STRINGS.settings.headingEditor);

		// SETTING: Show title icons
		groupEditor.addSetting(setting => setting
			.setName(STRINGS.settings.showTitleIcons.name)
			.setDesc(STRINGS.settings.showTitleIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTitleIcons)
				.onChange(value => {
					this.plugin.settings.showTitleIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('file');
				})
			)
		);

		// SETTING: Show tag pill icons
		groupEditor.addSetting(setting => setting
			.setName(STRINGS.settings.showTagPillIcons.name)
			.setDesc(STRINGS.settings.showTagPillIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showTagPillIcons)
				.onChange(value => {
					this.plugin.settings.showTagPillIcons = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('tag');
				})
			)
		);

		// GROUP: Menus & dialogs
		const groupMenusAndDialogs = new SettingGroup(this.containerEl)
			.setHeading(STRINGS.settings.headingMenusAndDialogs);

		// SETTING: Show menu actions
		groupMenusAndDialogs.addSetting(setting => setting
			.setName(STRINGS.settings.showMenuActions.name)
			.setDesc(STRINGS.settings.showMenuActions.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showMenuActions)
				.onChange(value => {
					this.plugin.settings.showMenuActions = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers();
				})
			)
		);

		// SETTING: Show suggestion icons
		groupMenusAndDialogs.addSetting(setting => setting
			.setName(STRINGS.settings.showSuggestionIcons.name)
			.setDesc(STRINGS.settings.showSuggestionIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showSuggestionIcons)
				.onChange(value => {
					this.plugin.settings.showSuggestionIcons = value;
					void this.plugin.saveSettings();
				})
			)
		);

		// SETTING: Show quick switcher icons
		groupMenusAndDialogs.addSetting(setting => setting
			.setName(STRINGS.settings.showQuickSwitcherIcons.name)
			.setDesc(STRINGS.settings.showQuickSwitcherIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showQuickSwitcherIcons)
				.onChange(value => {
					this.plugin.settings.showQuickSwitcherIcons = value;
					void this.plugin.saveSettings();
				})
			)
		);

		// SETTING: Show "Move file" dialog icons
		groupMenusAndDialogs.addSetting(setting => setting
			.setName(STRINGS.settings.showMoveFileIcons.name)
			.setDesc(STRINGS.settings.showMoveFileIcons.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.showMoveFileIcons)
				.onChange(value => {
					this.plugin.settings.showMoveFileIcons = value;
					void this.plugin.saveSettings();
				})
			)
		);

		// GROUP: Icon picker
		const groupIconPicker = new SettingGroup(this.containerEl)
			.setHeading(STRINGS.settings.headingIconPicker);

		// SETTING: Show item name
		groupIconPicker.addSetting(setting => setting
			.setName(STRINGS.settings.showItemName.name)
			.setDesc(STRINGS.settings.showItemName.desc)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.showItemName = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('on', STRINGS.settings.values.on)
				.addOption('desktop', STRINGS.settings.values.desktop)
				.addOption('mobile', STRINGS.settings.values.mobile)
				.addOption('off', STRINGS.settings.values.off)
				.setValue(this.plugin.settings.showItemName)
				.onChange(value => {
					this.refreshIndicator(this.indicators.showItemName, value);
					this.plugin.settings.showItemName = value;
					void this.plugin.saveSettings();
				});
				this.refreshIndicator(this.indicators.showItemName, dropdown.getValue());
			})
		);

		// SETTING: Bigger search results
		groupIconPicker.addSetting(setting => setting
			.setName(STRINGS.settings.biggerSearchResults.name)
			.setDesc(STRINGS.settings.biggerSearchResults.desc)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.biggerSearchResults = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('on', STRINGS.settings.values.on)
				.addOption('desktop', STRINGS.settings.values.desktop)
				.addOption('mobile', STRINGS.settings.values.mobile)
				.addOption('off', STRINGS.settings.values.off)
				.setValue(this.plugin.settings.biggerSearchResults)
				.onChange(value => {
					this.refreshIndicator(this.indicators.biggerSearchResults, value);
					this.plugin.settings.biggerSearchResults = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				});
				this.refreshIndicator(this.indicators.biggerSearchResults, dropdown.getValue());
			})
		);

		// SETTING: Maximum search results
		groupIconPicker.addSetting(setting => setting
			.setName(STRINGS.settings.maxSearchResults.name)
			.setDesc(STRINGS.settings.maxSearchResults.desc)
			.addSlider(slider => slider
				.setLimits(10, 300, 10)
				.setValue(this.plugin.settings.maxSearchResults)
				.onChange(value => {
					this.plugin.settings.maxSearchResults = value;
					void this.plugin.saveSettings();
				})
			)
		);

		// SETTING: Main color picker
		groupIconPicker.addSetting(setting => setting
			.setName(STRINGS.settings.colorPicker1.name)
			.setDesc(Platform.isDesktop
				? STRINGS.settings.colorPicker1.descDesktop
				: STRINGS.settings.colorPicker1.descMobile
			)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.colorPicker1 = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('list', STRINGS.settings.values.list)
				.addOption('rgb', STRINGS.settings.values.rgb)
				.setValue(this.plugin.settings.colorPicker1)
				.onChange(value => {
					this.refreshIndicator(this.indicators.colorPicker1, value);
					this.plugin.settings.colorPicker1 = value;
					void this.plugin.saveSettings();
				})
				this.refreshIndicator(this.indicators.colorPicker1, dropdown.getValue());
			})
		);

		// SETTING: Second color picker
		groupIconPicker.addSetting(setting => setting
			.setName(STRINGS.settings.colorPicker2.name)
			.setDesc(Platform.isDesktop
				? STRINGS.settings.colorPicker2.descDesktop
				: STRINGS.settings.colorPicker2.descMobile
			)
			.addExtraButton(indicator => {
				indicator.extraSettingsEl.addClass('iconic-indicator');
				this.indicators.colorPicker2 = indicator;
			})
			.addDropdown(dropdown => { dropdown
				.addOption('list', STRINGS.settings.values.list)
				.addOption('rgb', STRINGS.settings.values.rgb)
				.setValue(this.plugin.settings.colorPicker2)
				.onChange(value => {
					this.refreshIndicator(this.indicators.colorPicker2, value);
					this.plugin.settings.colorPicker2 = value;
					void this.plugin.saveSettings();
				});
				this.refreshIndicator(this.indicators.colorPicker2, dropdown.getValue());
			})
		);

		// GROUP: Advanced
		const groupAdvanced = new SettingGroup(this.containerEl)
			.setHeading(STRINGS.settings.headingAdvanced);

		// SETTING: Colorless hover
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.uncolorHover.name)
			.setDesc(STRINGS.settings.uncolorHover.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.uncolorHover)
				.onChange(value => {
					this.plugin.settings.uncolorHover = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				})
			)
		);

		// SETTING: Colorless drag
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.uncolorDrag.name)
			.setDesc(STRINGS.settings.uncolorDrag.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.uncolorDrag)
				.onChange(value => {
					this.plugin.settings.uncolorDrag = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				})
			)
		);

		// SETTING: Colorless selection
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.uncolorSelect.name)
			.setDesc(STRINGS.settings.uncolorSelect.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.uncolorSelect)
				.onChange(value => {
					this.plugin.settings.uncolorSelect = value;
					void this.plugin.saveSettings();
					this.plugin.refreshBody();
				})
			)
		);

		// SETTING: Colorless ribbon button
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.uncolorQuick.name)
			.setDesc(STRINGS.settings.uncolorQuick.desc)
			.addToggle(toggle => toggle
				.setValue(this.plugin.settings.uncolorQuick)
				.onChange(value => {
					this.plugin.settings.uncolorQuick = value;
					void this.plugin.saveSettings();
					this.plugin.refreshManagers('ribbon');
				})
			)
		);

		// SETTING: View unused icons
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.viewUnusedIcons.name)
			.setDesc(STRINGS.settings.viewUnusedIcons.desc)
			.addButton(button => button
				.setButtonText(STRINGS.settings.manage)
				.onClick(async () => {
					const unusedIcons: FileItem[] = [];
					for (const fileId of Object.keys(this.plugin.settings.fileIcons)) {
						if (!await this.app.vault.adapter.exists(fileId)) {
							const file = this.plugin.getFileItem(fileId);
							unusedIcons.push(file);
						}
					}
					UsageChecker.open(this.plugin, unusedIcons);
				})
			)
		);

		// SETTING: Maximum automatic backups
		groupAdvanced.addSetting(setting => setting
			.setName(STRINGS.settings.maxBackups.name)
			.setDesc(STRINGS.settings.maxBackups.desc)
			.then(setting => {
				if (Platform.isDesktop) setting.addExtraButton(button => button
					.setIcon('lucide-folder-open')
					.setTooltip(STRINGS.settings.maxBackups.openPluginFolder)
					// @ts-expect-error (Private API)
					.onClick(() => this.app.openWithDefaultApp(this.plugin.manifest.dir ?? ''))
				)
			})
			.addDropdown(dropdown => dropdown
				.addOption('0', STRINGS.settings.values.none)
				.addOption('1', '1')
				.addOption('2', '2')
				.addOption('3', '3')
				.addOption('4', '4')
				.addOption('5', '5')
				.addOption('6', '6')
				.addOption('7', '7')
				.addOption('8', '8')
				.addOption('9', '9')
				.setValue(this.plugin.settings.maxBackups.toString())
				.onChange(value => {
					this.plugin.settings.maxBackups = Number(value) || 0;
					void this.plugin.saveSettings();
				})
			)
		);
	}

	/**
	 * Change a dropdown indicator icon.
	 */
	private refreshIndicator(indicator: ExtraButtonComponent | undefined, value: string): void {
		if (!indicator) return;
		switch (value) {
			case 'desktop': indicator.setIcon('lucide-monitor'); break;
			case 'mobile': indicator.setIcon('lucide-tablet-smartphone'); break;
			case 'list': indicator.setIcon('lucide-paint-bucket'); break;
			case 'rgb': indicator.setIcon('lucide-pipette'); break;
			default: indicator.extraSettingsEl.hide(); return;
		}
		indicator.extraSettingsEl.show();
	}

	private openIconColorPicker(icon: string | null, color: string | null, callback: (icon: string | null, color: string | null) => void): void {
		const item: Item = {
			id: 'icon-color-rule',
			name: STRINGS.settings.iconColors.name,
			category: 'rule',
			icon,
			color,
			iconDefault: 'lucide-image',
		};
		IconPicker.openSingle(this.plugin, item, callback);
	}

	private renderIconColorPreview(iconEl: HTMLElement, icon: string | null, color: string | null): void {
		iconEl.empty();
		iconEl.removeClass('iconic-invisible');
		if (!icon) {
			setIcon(iconEl, 'lucide-image');
			return;
		}

		if (this.plugin.renderPackIcon(iconEl, icon, color)) return;
		if (EMOJIS.has(icon)) {
			const emojiEl = iconEl.createDiv({ cls: 'iconic-emoji', text: icon });
			if (color) IconicSettingTab.colorFilter(emojiEl, color);
			return;
		}

		setIcon(iconEl, icon);
		const svgEl = iconEl.find('.svg-icon');
		if (svgEl && color) svgEl.style.setProperty('color', ColorUtils.toRgb(color));
	}

	private getIconLabel(icon: string): string {
		return ICONS.get(icon) ?? EMOJIS.get(icon) ?? icon.replace(/^nicons:/, '').replace(/^lucide-/, '').replaceAll('-', ' ');
	}

	private static colorFilter(element: HTMLElement, color: string): void {
		const [h, s] = ColorUtils.toHslArray(color);
		element.style.filter = `grayscale() sepia() hue-rotate(${h - 50}deg) saturate(${s * 5}%)`;
	}
}
