# Obsidian community plugin submission

Obsidian community plugin submissions go through the Community directory, not pull requests to `obsidianmd/obsidian-releases`.

## Submission URL

Go to:

```text
https://community.obsidian.md
```

Then:

1. Sign in with an Obsidian account.
2. Link the GitHub account `pilafdob` to the Obsidian profile.
3. Open **Plugins** in the sidebar.
4. Select **New plugin**.
5. Submit the Nicons repository URL.

## Release assets

The public GitHub release for the submitted version must include:

- `main.js`
- `manifest.json`
- `styles.css`

Do not rely on `vendor/phosphor-icons/` being installed as a release asset; bundled Phosphor SVGs are embedded into `main.js` during build.

## Before selecting Submit

- Read and agree to the developer policies shown in the community directory.
- Confirm that the plugin will continue to be supported.
- Confirm that the release assets are present on GitHub.
- Confirm that Iconic and Phosphor Icons are attributed in `README.md`, `LICENSE`, and `THIRD_PARTY_NOTICES.md`.
