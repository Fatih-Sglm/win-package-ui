# System Patterns

Architecture overview:
- Frontend: Vue 3 + TypeScript + Vite
- State: Pinia stores (`packages`, `ui`, `app`, `memory`)
- IPC/OS interactions: Tauri / plugin-shell (`ipcService`) invoking external commands (winget, choco)
- Services: `package-providers` implement per-source parsing and unify results
- UI: Component-based (shadcn-vue-like primitives) with modals for install/details

Key patterns:
- Command execution through `ipcService.executeCommand({ program, args })` to centralize parsing/error handling.
- Caching: memory bank caches popular lists and package metadata to avoid repeated shell calls.
- Theme tokens: store theme variables in memory bank and apply to CSS variables at runtime.
- Extensions: extension/theme store modeled as simple JSON packages that can be registered into memory bank.

Component relationships:
- `App.vue` orchestrates main layout and search filter state via `usePackagesStore`.
- `InstallModal.vue` handles external searches, install/remove flows through `ipcService`.
- `PackageCard` displays package summary; package-details modal shows versions/actions.
