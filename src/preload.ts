import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electron', {
  executeCommand: (command: string) => ipcRenderer.invoke('execute-command', command),
  checkCommand: (command: string) => ipcRenderer.invoke('check-command', command),
  isAdmin: () => ipcRenderer.invoke('is-admin')
})
