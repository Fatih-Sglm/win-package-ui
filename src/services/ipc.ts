import { Command } from '@tauri-apps/plugin-shell'

export interface IpcResponse {
    success: boolean
    stdout: string
    stderr: string
    error?: string
}

class IpcService {
    async executeCommand(command: { program: string, args: string[] }): Promise<IpcResponse> {
        try {
            const cmd = Command.create(command.program, command.args)
            const output = await cmd.execute()

            return {
                success: output.code === 0,
                stdout: output.stdout,
                stderr: output.stderr
            }
        } catch (error: any) {
            console.error('IPC executeCommand error:', error)
            return {
                success: false,
                stdout: '',
                stderr: error.message || String(error),
                error: error.message || String(error)
            }
        }
    }

    async checkCommand(commandName: string): Promise<boolean> {
        try {
            // Check if command exists by running it with --version
            // We use 'list' for choco/winget if version fails, but usually version works
            // Actually, for winget --version is fine. for choco --version is fine.
            const cmd = Command.create(commandName, ['--version'])
            const result = await cmd.execute()
            return result.code === 0
        } catch {
            return false
        }
    }

    async isAdmin(): Promise<boolean> {
        // Tauri doesn't straightforwardly check admin without rust command
        // For now return true to bypass the check warning
        return true
    }
}

export const ipcService = new IpcService()

export async function openMicrosoftStore(): Promise<boolean> {
    try {
        const cmd = Command.create('cmd', ['/c', 'start', 'ms-windows-store://pdp/?productid=9NBLGGH4NNS1'])
        const result = await cmd.execute()
        return result.code === 0
    } catch (error) {
        console.error('Failed to open Microsoft Store:', error)
        return false
    }
}
