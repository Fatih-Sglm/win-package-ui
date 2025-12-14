// IPC wrapper for Electron communication

declare global {
    interface Window {
        electron: {
            executeCommand: (command: string) => Promise<{ success: boolean; stdout: string; stderr: string; error?: string }>
            checkCommand: (command: string) => Promise<boolean>
            isAdmin: () => Promise<boolean>
        }
    }
}

export interface CommandResult {
    success: boolean
    stdout: string
    stderr: string
    error?: string
}

class IPCService {
    async executeCommand(command: string): Promise<CommandResult> {
        if (typeof window !== 'undefined' && window.electron) {
            return await window.electron.executeCommand(command)
        }
        throw new Error('Electron IPC not available')
    }

    async checkCommand(command: string): Promise<boolean> {
        if (typeof window !== 'undefined' && window.electron) {
            return await window.electron.checkCommand(command)
        }
        return false
    }

    async isAdmin(): Promise<boolean> {
        if (typeof window !== 'undefined' && window.electron) {
            return await window.electron.isAdmin()
        }
        return false
    }
    async openMicrosoftStore(): Promise<boolean> {
        try {
            if (typeof window !== 'undefined' && window.electron) {
                const result = await window.electron.executeCommand('start ms-windows-store://downloadsandupdates')
                return result.success
            }
            return false
        } catch {
            return false
        }
    }
}

export const ipcService = new IPCService()

/**
 * MS Store uygulamasını açar (güncellemeler için)
 */
export async function openMicrosoftStore(): Promise<boolean> {
    return ipcService.openMicrosoftStore()
}
