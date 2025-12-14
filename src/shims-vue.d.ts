declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  electron: {
    executeCommand: (command: string) => Promise<{ success: boolean; stdout: string; stderr: string; error?: string }>;
    checkCommand: (command: string) => Promise<boolean>;
    isAdmin: () => Promise<boolean>;
  }
}
