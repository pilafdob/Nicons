# Changelog

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
