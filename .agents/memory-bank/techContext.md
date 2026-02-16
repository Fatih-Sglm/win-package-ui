# Tech Context

Languages & frameworks:
- TypeScript + Vue 3 + Vite
- Pinia for state management
- Tauri (Rust) for native shell/IPC

Dev environment:
- Node.js (18+ recommended)
- pnpm or npm (pnpm preferred)
- Rust toolchain (MSVC toolchain on Windows for Tauri with `Desktop development with C++` workload)

Key dependencies (high level):
- `@tauri-apps/cli`, `@tauri-apps/api` — desktop integration
- `vite`, `vue`, `vue-tsc` — builder and types
- `esbuild` — preload build

Notes for contributors:
- Use Developer PowerShell / Native Tools Command Prompt when building Tauri apps on Windows so MSVC tools (cl.exe) are on PATH.
- Persisted memory bank files are in `.agents/memory-bank/` for documentation; runtime memory store is `useMemoryStore`.
