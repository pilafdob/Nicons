# Release Checklist

- Run `npm install`.
- Run `npm run build`.
- Confirm `manifest.json`, `versions.json`, and `package.json` use the same version.
- Confirm `versions.json` maps the current manifest version to `minAppVersion`.
- Confirm the GitHub release tag matches `manifest.json` version exactly, or uses `v` plus the version.
- Confirm `LICENSE`, `THIRD_PARTY_NOTICES.md`, `vendor/phosphor-icons/LICENSE`, and `vendor/iconic-main/LICENSE` are present in the source repo.
- Confirm the release assets are `main.js`, `manifest.json`, and `styles.css`.
- Test the release assets in a clean vault under `.obsidian/plugins/nicons/`.
- Submit through `https://community.obsidian.md`; do not use the old `obsidianmd/obsidian-releases` pull-request flow.
