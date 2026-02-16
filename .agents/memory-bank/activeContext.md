# Active Context

Current focus:
- Create a Memory Bank (persistent documentation + config store) to drive features like theming, popular lists, and cached package metadata.
- Implement parametric theme architecture so additional themes can be added via an "extension" flow.

Recent changes:
- Added `useMemoryStore` Pinia store (theme/currentTheme, favorites, popular, cache).
- Reworked `InstallModal.vue` to use `ipcService` for command execution parsing.

Next steps:
1. Define a theme schema and TypeScript types (`src/types/theme.ts`).
2. Expand `useMemoryStore` with theme registration, list, and install/uninstall methods.
3. Create runtime helper to apply theme variables to `:root` CSS variables.
4. Seed default themes and wire ThemeSwitcher UI.

Decisions & patterns:
- Memory Bank is the authoritative source of project state for this session.
- Keep theme variables lightweight (CSS custom properties) so they can work with Tailwind utility overrides.
