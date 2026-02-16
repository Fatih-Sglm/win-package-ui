# Project Tasks

This file tracks the high-level tasks for the WinPackage UI project (memory bank canonical task list).

Priority order (start at top):

1) Memory Bank files — completed
   - Files: `projectbrief.md`, `productContext.md`, `activeContext.md`, `systemPatterns.md`, `techContext.md`, `progress.md`

2) Add Memory Store — completed
   - `useMemoryStore` implemented (theme/currentTheme, themeVars, favorites, popular, cache)

3) Theme schema & types (next)
   - Create `src/types/theme.ts` with `Theme` interface (tokens: colors, surface, accent, text, muted, primary, secondary, success, warning, danger, radius, spacing, typography)`
   - Provide JSON example for `light`, `dark`, `blue` themes

4) Memory store: theme API
   - Add `registerTheme`, `unregisterTheme`, `listThemes`, `setActiveTheme`, `installThemePackage`
   - Ensure persistence to `localStorage` under `memory.themes` / `memory.themeVars`

5) Runtime CSS variables
   - Implement helper `applyThemeVars(vars)` to set `document.documentElement.style.setProperty('--token', value)` for each token
   - Hook `useMemoryStore.currentTheme` to call helper on change

6) Seed default themes
   - Add built-in themes and load them on first run; allow user to restore defaults

7) Theme Switcher component
   - UI to preview themes, install from extension store, edit primary colors, and apply

8) Extension Store (themes)
   - Simple schema for theme packages (name, author, version, tokens)
   - UI to browse/install/uninstall theme packages (store can be local JSON or remote URL)

9) Explore page wiring
   - Populate `Discover`/Explore page using `memory.popular` cache
   - Add logic to refresh popular list from a remote seed or curated JSON

10) My Packages (Installed) view
    - Use `package-providers` `getAllPackages` to show installed packages
    - Add filters, sort, and bulk actions

11) Package details & actions
    - Detail modal with Install / Remove / Change Version buttons
    - Use `ipcService` to run install/uninstall and `winget show` to fetch versions

12) Caching & performance
    - Cache package metadata in `memory.cache` with TTL; provide cache invalidation

13) Docs & Tests
    - `docs/THEMES.md`, update `README.md` with pnpm usage, and create manual test checklist

14) Integration & polish
    - Accessibility checks, keyboard navigation, small UI polish, telemetry (opt-in) if needed

Notes:
- Triage tasks into small PR-sized issues when implementing.
- Prefer incremental delivery: theme schema + switcher first, then Explore page, then Package flows.
