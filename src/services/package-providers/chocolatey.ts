// Chocolatey Package Provider

import { ipcService } from '../ipc'
import { PackageSource } from '@/models'
import type { Package, UpdateResult } from '@/models'
import type { PackageProvider } from './types'
import { detectCategory } from './types'

export class ChocolateyProvider implements PackageProvider {
    readonly name = PackageSource.Chocolatey
    readonly icon = '🍫'

    async isInstalled(): Promise<boolean> {
        try {
            return await ipcService.checkCommand('choco')
        } catch {
            return false
        }
    }

    async getPackages(onlyUpdates: boolean): Promise<Package[]> {
        const isInstalled = await this.isInstalled()
        if (!isInstalled) return []

        try {
            const command = onlyUpdates ? 'choco outdated -r' : 'choco list -lo -r'
            const result = await ipcService.executeCommand(command)
            return this.parseOutput(result.stdout, onlyUpdates)
        } catch (error) {
            console.error('ChocolateyProvider getPackages error:', error)
            return []
        }
    }

    async updatePackage(id: string, _interactive: boolean): Promise<UpdateResult> {
        try {
            const command = `choco upgrade ${id} -y`
            const result = await ipcService.executeCommand(command)
            const output = result.stdout + result.stderr

            return {
                success: result.success,
                output,
                packageId: id,
                error: result.success ? undefined : (result.error || 'Güncelleme başarısız')
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                packageId: id,
                error: (error as Error).message
            }
        }
    }

    async installPackage(id: string, _interactive: boolean): Promise<UpdateResult> {
        try {
            const command = `choco install ${id} -y`
            const result = await ipcService.executeCommand(command)
            const output = result.stdout + result.stderr

            return {
                success: result.success,
                output,
                packageId: id,
                error: result.success ? undefined : (result.error || 'Yükleme başarısız')
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                packageId: id,
                error: (error as Error).message
            }
        }
    }

    async uninstallPackage(id: string): Promise<UpdateResult> {
        try {
            const command = `choco uninstall ${id} -y`
            const result = await ipcService.executeCommand(command)
            const output = result.stdout + result.stderr

            return {
                success: result.success,
                output,
                packageId: id,
                error: result.success ? undefined : (result.error || 'Kaldırma başarısız')
            }
        } catch (error) {
            return {
                success: false,
                output: '',
                packageId: id,
                error: (error as Error).message
            }
        }
    }

    async searchPackages(query: string): Promise<Package[]> {
        try {
            const result = await ipcService.executeCommand(`choco search ${query} -r`)
            return this.parseSearchOutput(result.stdout)
        } catch {
            return []
        }
    }

    private parseOutput(stdout: string, onlyUpdates: boolean): Package[] {
        const packages: Package[] = []
        const lines = stdout.split('\n')

        for (const line of lines) {
            if (!line.trim() || !line.includes('|')) continue

            const parts = line.split('|')

            if (onlyUpdates && parts.length >= 3) {
                const pkgName = parts[0].trim()
                packages.push({
                    name: pkgName,
                    id: pkgName,
                    currentVersion: parts[1].trim(),
                    availableVersion: parts[2].trim(),
                    source: PackageSource.Chocolatey,
                    hasUpdate: true,
                    category: detectCategory(pkgName, pkgName)
                })
            } else if (!onlyUpdates && parts.length >= 2) {
                const pkgName = parts[0].trim()
                const version = parts[1].trim()
                packages.push({
                    name: pkgName,
                    id: pkgName,
                    currentVersion: version,
                    availableVersion: version,
                    source: PackageSource.Chocolatey,
                    hasUpdate: false,
                    category: detectCategory(pkgName, pkgName)
                })
            }
        }

        return packages
    }

    private parseSearchOutput(stdout: string): Package[] {
        const packages: Package[] = []
        const lines = stdout.split('\n')

        for (const line of lines) {
            if (!line.trim() || !line.includes('|')) continue

            const parts = line.split('|')
            if (parts.length >= 2) {
                const pkgName = parts[0].trim()
                const version = parts[1].trim()
                packages.push({
                    name: pkgName,
                    id: pkgName,
                    currentVersion: version,
                    availableVersion: version,
                    source: PackageSource.Chocolatey,
                    hasUpdate: false,
                    category: detectCategory(pkgName, pkgName)
                })
            }
        }

        return packages
    }
}

export const chocolateyProvider = new ChocolateyProvider()
