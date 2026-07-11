# Nicons

Nicons is an Obsidian plugin for customizing icons across the Obsidian interface. It is a standalone plugin built on Iconic's icon-management foundation, with Phosphor Icons as the default icon pack.

The bundled Phosphor SVGs are embedded into the built plugin and work on desktop, Android, and iOS. Users can also choose an SVG icon pack stored inside their vault. Emojis are available in the picker as a built-in secondary option.

## Features

- Set custom icons and colors for files, folders, tabs, ribbon actions, tags, properties, bookmarks, and supported Obsidian UI items.
- Use bundled Phosphor Icons by default, including regular, thin, light, bold, duotone, and fill styles.
- Choose another SVG icon pack from a vault folder.
- Search icons with semantic aliases, so searches such as `gym`, `bills`, or `math` can find related Phosphor icons.
- Show default icons for notes, open and closed folders, PDFs, Office and iWork documents, images, audio, video, archives, code files, and other common file types.
- Keep tab icons matched to the current file's custom or default icon.

## Usage

After enabling Nicons, right-click a supported item and choose **Change icon**. Pick an icon or emoji, optionally set a color, and save.

Open **Settings -> Community plugins -> Nicons** to configure:

- the active icon pack;
- the Phosphor style or local-pack variant;
- icon size;
- whether file-type default icons are shown;
- which Obsidian surfaces should show icons.

Enter a vault-relative folder such as `Assets/icons` in Nicons settings to use a different SVG pack. Nicons supports flat SVG folders and variant folders such as `regular`, `bold`, `thin`, `fill`, or similar names on desktop and mobile.

## Privacy and vault access

Nicons works locally and does not make network requests. A custom icon pack is read only from the vault-relative folder selected in Nicons settings. To apply file and folder icons and evaluate icon rules, Nicons enumerates loaded vault entries and uses their paths and metadata; it does not upload vault content.

## Development

Install dependencies, then build:

```sh
npm install
npm run build
```

For manual testing, copy `main.js`, `manifest.json`, and `styles.css` into:

```text
<vault>/.obsidian/plugins/nicons/
```

## Legal

Nicons is licensed under the MIT License. It includes source derived from Iconic under MIT No Attribution and embeds Phosphor Icons under MIT; see `THIRD_PARTY_NOTICES.md` and `vendor/phosphor-icons/LICENSE`.

## Credits

Developed by the bltrsh(c) team, @pilafdob.

Visit us at https://bubbletrash.com.
