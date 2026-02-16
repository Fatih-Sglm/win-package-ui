# Progress

What works:
- Core UI scaffold (Vue + components) is present.
- `useMemoryStore` Pinia store implemented for theme and cache.
- `InstallModal.vue` uses `ipcService` for searching and install flows.

Known issues:
- Tauri/Rust build fails on this machine until MSVC/Windows SDK is available in PATH (use Developer PowerShell or install C++ workload).
- `package-lock.json` remained; need to switch fully to `pnpm-lock.yaml` after installing with pnpm.

What's next (high level):
1. Define theme schema and theme store integration.
2. Implement runtime CSS variable application and ThemeSwitcher.
3. Seed popular apps and wire Explore page to `memory.popular`.
4. Implement package-details page with Install/Remove/Change version actions.
5. Add extension store concept for theme packages.

Manual test checklist:
- Search functionality (winget / choco) — verify outputs parsed correctly.
- Install/Uninstall flows — progress reporting and result handling.
- Theme switching persists across reloads.
