# Changelog

## 1.4.2

- Fixed emojis appearing blank in icon-picker search results.
- Improved the phone icon picker with a responsive, touch-friendly results grid.
- Made icon assignments persist immediately and serialized overlapping settings writes so rapid changes are not dropped.

## 1.4.1

- Fixed icons flickering when expanding or collapsing folders.

## 1.4.0

- Added Android and iOS support and marked the plugin as mobile-compatible.
- Replaced Node-only bundled-icon decompression with the web-standard `DecompressionStream` API.
- Made custom SVG icon packs cross-platform by loading vault-relative folders through Obsidian's data adapter.
- Kept the bundled Phosphor pack compressed while removing Node, Electron, and desktop-filesystem dependencies from mobile startup.
- Strengthened internal suggestion and settings types while preserving existing icon behaviour.

## 1.3.1

- Addressed Obsidian community review warnings for async saves, cross-window DOM checks, timer APIs, deprecated slider calls, switch fallthroughs, and CSS compatibility.
- Removed unused vendored Iconic reference source and unused Phosphor font CSS files from the source repo while keeping license attribution.
- Added configurable default colours for selected icons.
- Fixed single-file context menu icon changes in the file explorer.

## 1.3.0

- Raised the minimum app version to match the settings APIs inherited from Iconic.
- Treated iWork package directories like `.pages`, `.numbers`, and `.key` as file items instead of folders.
- Added configurable fallback colours for file-type default icons.
- Kept file explorer folder open/closed icon handling limited to real folders.

## 1.2.0

- Improved file-extension icon matching for icon packs with exact file-type icons.
- Added aliases for common Office, iWork, source-code, and document extensions.
- Kept unknown files on the pack's default file icon when available.

## 1.0.2

- Removed redundant wording from the manifest description.
- Raised the minimum app version to match the APIs used by the plugin.
- Compressed bundled Phosphor icon data to keep the release bundle under 5 MB.
- Fixed source-review style and popout-compatibility warnings.
- Restored release asset attestations without blocking release creation.

## 1.0.1

- Fixed the GitHub release workflow so release assets are published correctly.

## 1.0.0

- Ported Iconic's icon-management foundation into Nicons.
- Embedded Phosphor Icons as the default icon pack.
- Added local SVG icon pack selection, style selection, icon scaling, and synonym-expanded picker search.
- Added file-type defaults for notes, folders, PDFs, Office/iWork documents, media, code files, and archives.
- Matched tab icons to the current file's resolved default or custom icon.
- Added Iconic and Phosphor attribution in docs and notices.
