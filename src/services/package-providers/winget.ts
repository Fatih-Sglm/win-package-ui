// WinGet Package Provider

import { ipcService } from '../ipc'
import { PackageSource, CategoryType } from '@/models'
import type { Package, UpdateResult } from '@/models'
import type { PackageProvider } from './types'
import { detectCategory } from './types'

export class WingetProvider implements PackageProvider {
    readonly name = PackageSource.Winget
    readonly icon = '📦'

    async isInstalled(): Promise<boolean> {
        try {
            return await ipcService.checkCommand('winget')
        } catch {
            return false
        }
    }

    async getPackages(onlyUpdates: boolean): Promise<Package[]> {
        const isInstalled = await this.isInstalled()
        if (!isInstalled) return []

        try {
            if (onlyUpdates) {
                const result = await ipcService.executeCommand('winget upgrade --accept-source-agreements')
                return this.parseUpgradeOutput(result.stdout)
            } else {
                const result = await ipcService.executeCommand('winget list --accept-source-agreements')
                return this.parseListOutput(result.stdout)
            }
        } catch (error) {
            console.error('WingetProvider getPackages error:', error)
            return []
        }
    }

    async updatePackage(id: string, interactive: boolean): Promise<UpdateResult> {
        try {
            const command = interactive
                ? `winget install ${id} --interactive`
                : `winget upgrade --id ${id} --accept-source-agreements --accept-package-agreements`

            const result = await ipcService.executeCommand(command)
            const output = result.stdout + result.stderr

            const errorResult = this.checkForErrors(output, id)
            if (errorResult) return errorResult

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

    async installPackage(id: string, interactive: boolean): Promise<UpdateResult> {
        try {
            const command = interactive
                ? `winget install ${id} --interactive`
                : `winget install ${id} --accept-source-agreements --accept-package-agreements`

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
            const command = `winget uninstall --id ${id} --accept-source-agreements`
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
            const result = await ipcService.executeCommand(`winget search "${query}" --accept-source-agreements`)
            return this.parseSearchOutput(result.stdout)
        } catch {
            return []
        }
    }

    private checkForErrors(output: string, packageId: string): UpdateResult | null {
        const installerFailedMatch = output.match(/Installer failed with exit code: (\d+)/)
        if (installerFailedMatch) {
            const exitCode = installerFailedMatch[1]
            let errorMessage = `Yükleyici hata kodu ile sonlandı: ${exitCode}`

            if (exitCode === '3221226505' || exitCode === '-1073740791') {
                errorMessage += '\n\nBu genellikle yükleyicinin beklenmedik şekilde sonlandığını gösterir.'
            } else if (exitCode === '1603') {
                errorMessage += '\n\nYükleme sırasında kritik hata oluştu. Lütfen yönetici olarak çalıştırmayı deneyin.'
            } else if (exitCode === '1618') {
                errorMessage += '\n\nBaşka bir yükleme devam ediyor. Lütfen bekleyip tekrar deneyin.'
            }

            return { success: false, output, packageId, error: errorMessage }
        }
        return null
    }

    private parseUpgradeOutput(stdout: string): Package[] {
        const packages: Package[] = []
        const lines = stdout.split('\n')
        let dataStarted = false

        for (const line of lines) {
            if (line.includes('Name') && line.includes('Id')) continue
            if (line.includes('---')) { dataStarted = true; continue }

            if (dataStarted && line.trim() && line.length > 10) {
                if (line.toLowerCase().includes('upgrade') && line.toLowerCase().includes('available')) break
                if (line.toLowerCase().includes('no applicable upgrade')) continue
                if (line.trim().match(/^[-\\|/]$/)) continue

                try {
                    const pkg = this.parsePackageLine(line, true)
                    if (pkg) packages.push(pkg)
                } catch { continue }
            }
        }

        return packages
    }

    private parseListOutput(stdout: string): Package[] {
        const packages: Package[] = []
        const lines = stdout.split('\n')
        let dataStarted = false

        for (const line of lines) {
            if (line.includes('Name') && line.includes('Id')) continue
            if (line.includes('---')) { dataStarted = true; continue }

            if (dataStarted && line.trim() && line.length > 10) {
                if (line.toLowerCase().includes('package') && line.toLowerCase().includes('found')) break
                if (line.trim().match(/^[-\\|/]$/)) continue

                try {
                    const parts = line.split(/\s{2,}/)
                    if (parts.length < 3) continue

                    const name = parts[0].trim()
                    const id = parts[1].trim()
                    const currentVersion = parts[2].trim()
                    let availableVersion = currentVersion
                    let source = 'winget'
                    let hasUpdate = false

                    if (parts.length >= 4) {
                        const lastPart = parts[parts.length - 1].trim()
                        if (lastPart && /^[a-z]+$/i.test(lastPart) && lastPart.length < 15) {
                            source = lastPart
                            if (parts.length >= 5 && parts[3].trim()) {
                                availableVersion = parts[3].trim()
                                hasUpdate = true
                            }
                        } else if (parts[3].trim()) {
                            availableVersion = parts[3].trim()
                            hasUpdate = true
                        }
                    }

                    if (!name || !id || !currentVersion || currentVersion.includes('Unknown')) continue

                    const isMsStoreId = /^[A-Z0-9]{10,}$/.test(id)
                    const pkgSource = source.toLowerCase() === 'msstore' || isMsStoreId
                        ? PackageSource.MsStore
                        : PackageSource.Winget

                    packages.push({
                        name, id, currentVersion, availableVersion,
                        source: pkgSource, hasUpdate, category: detectCategory(name, id)
                    })
                } catch { continue }
            }
        }

        return packages
    }

    private parseSearchOutput(stdout: string): Package[] {
        const packages: Package[] = []
        const lines = stdout.split('\n')
        let dataStarted = false

        for (const line of lines) {
            if (line.includes('Name') && line.includes('Id')) continue
            if (line.includes('---')) { dataStarted = true; continue }

            if (dataStarted && line.trim() && line.length > 10) {
                try {
                    const parts = line.split(/\s{2,}/)
                    if (parts.length < 3) continue

                    const name = parts[0].trim()
                    const id = parts[1].trim()
                    const version = parts[2]?.trim() || 'Unknown'

                    if (!name || !id) continue

                    packages.push({
                        name, id, currentVersion: version, availableVersion: version,
                        source: PackageSource.Winget, hasUpdate: false, category: detectCategory(name, id)
                    })
                } catch { continue }
            }
        }

        return packages
    }

    private parsePackageLine(line: string, isUpgrade: boolean): Package | null {
        const tokens = line.split(/\s+/).filter(t => t.trim())
        if (tokens.length < 4) return null

        let source = 'winget'
        let availableVersion = ''
        let currentVersion = ''
        let nameAndIdTokens: string[] = []

        const lastToken = tokens[tokens.length - 1]
        if (lastToken && /^[a-z]+$/i.test(lastToken) && lastToken.length < 15) {
            source = lastToken
            availableVersion = tokens[tokens.length - 2]
            currentVersion = tokens[tokens.length - 3]
            nameAndIdTokens = tokens.slice(0, tokens.length - 3)
        } else {
            availableVersion = tokens[tokens.length - 1]
            currentVersion = tokens[tokens.length - 2]
            nameAndIdTokens = tokens.slice(0, tokens.length - 2)
        }

        if (nameAndIdTokens.length < 2) return null

        let name = ''
        let id = ''
        let idIndex = -1

        for (let j = 1; j < nameAndIdTokens.length; j++) {
            const token = nameAndIdTokens[j]
            if (token.includes('.') || /^[A-Z]/.test(token)) {
                idIndex = j
                break
            }
        }

        if (idIndex > 0) {
            name = nameAndIdTokens.slice(0, idIndex).join(' ')
            id = nameAndIdTokens.slice(idIndex).join(' ')
        } else {
            name = nameAndIdTokens[0]
            id = nameAndIdTokens.slice(1).join('.')
        }

        if (!name || !id || !currentVersion || !availableVersion) return null
        if (currentVersion.includes('Unknown') || availableVersion.includes('Unknown')) return null

        const isMsStoreId = /^[A-Z0-9]{10,}$/.test(id)
        const pkgSource = source.toLowerCase() === 'msstore' || isMsStoreId
            ? PackageSource.MsStore
            : PackageSource.Winget

        if (pkgSource === PackageSource.MsStore) return null

        return {
            name, id, currentVersion, availableVersion,
            source: pkgSource, hasUpdate: isUpgrade, category: detectCategory(name, id)
        }
    }
}

export const wingetProvider = new WingetProvider()
