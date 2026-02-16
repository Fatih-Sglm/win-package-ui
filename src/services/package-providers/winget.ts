// Winget Package Provider implementation

import { ipcService } from '../ipc'
import { PackageSource } from '@/models'
import type { Package, UpdateResult } from '@/models'
import type { PackageProvider } from './types'
import { detectCategory } from './types'
import { CommandBuilder } from '@/services/command-builder'

export class WingetProvider implements PackageProvider {
    readonly name = PackageSource.Winget
    readonly icon = '�️'

    async isInstalled(): Promise<boolean> {
        try {
            // Winget check - some environments might return non-zero for --version but still work
            // Or just check if the command exists/responds
            const result = await ipcService.executeCommand({ program: 'winget', args: ['--version'] })
            return result.success || result.stdout.length > 0
        } catch {
            return false
        }
    }

    async getPackages(onlyUpdates: boolean): Promise<Package[]> {
        const isInstalled = await this.isInstalled()
        if (!isInstalled) return []

        try {
            const command = onlyUpdates
                ? CommandBuilder.build('winget.upgrade.list')
                : CommandBuilder.build('winget.list')
            const result = await ipcService.executeCommand(command)
            return onlyUpdates ? this.parseUpgradeOutput(result.stdout) : this.parseListOutput(result.stdout)
        } catch (error) {
            console.error('WingetProvider getPackages error:', error)
            return []
        }
    }

    async updatePackage(id: string, interactive: boolean): Promise<UpdateResult> {
        return this.handlePackageAction('winget.upgrade', id, interactive)
    }

    async installPackage(id: string, interactive: boolean, version?: string): Promise<UpdateResult> {
        if (version) {
            return this.handlePackageActionWithVersion('winget.install.version', id, version)
        }
        return this.handlePackageAction('winget.install', id, interactive)
    }

    async uninstallPackage(id: string): Promise<UpdateResult> {
        return this.handlePackageAction('winget.uninstall', id, false)
    }

    private async handlePackageAction(cmdKey: string, id: string, interactive: boolean): Promise<UpdateResult> {
        try {
            const command = CommandBuilder.build(cmdKey as any, { id })
            if (interactive) {
                // Not implemented for background commands yet, but winget usually handles it
            }
            const result = await ipcService.executeCommand(command)
            const packageId = id
            const output = result.stdout + result.stderr

            if (result.success) {
                return { success: true, output, packageId }
            }

            // check for common winget errors
            let errorMessage = result.error || 'İşlem başarısız'
            if (output.includes('0x80070005')) errorMessage = 'Erişim engellendi (Yönetici hakları gerekebilir)'
            if (output.includes('0x8a150006')) errorMessage = 'Paket bulunamadı'

            return { success: false, output, packageId, error: errorMessage }
        } catch (error: any) {
            return {
                success: false,
                output: '',
                packageId: id,
                error: error.message || String(error)
            }
        }
    }

    private async handlePackageActionWithVersion(cmdKey: string, id: string, version: string): Promise<UpdateResult> {
        try {
            const command = CommandBuilder.build(cmdKey as any, { id, version })
            const result = await ipcService.executeCommand(command)
            const output = result.stdout + result.stderr

            if (result.success) {
                return { success: true, output, packageId: id }
            }

            let errorMessage = result.error || 'İşlem başarısız'
            if (output.includes('0x80070005')) errorMessage = 'Erişim engellendi (Yönetici hakları gerekebilir)'
            if (output.includes('0x8a150006')) errorMessage = 'Paket bulunamadı'

            return { success: false, output, packageId: id, error: errorMessage }
        } catch (error: any) {
            return {
                success: false,
                output: '',
                packageId: id,
                error: error.message || String(error)
            }
        }
    }

    async getVersions(id: string, limit: number = 5): Promise<string[]> {
        try {
            const command = CommandBuilder.build('winget.show.versions', { id })
            const result = await ipcService.executeCommand(command)
            if (!result.success && !result.stdout) return []
            return this.parseVersionsOutput(result.stdout, limit)
        } catch {
            return []
        }
    }

    private parseVersionsOutput(stdout: string, limit: number): string[] {
        const lines = stdout.split('\n')
        const versions: string[] = []
        let pastHeader = false

        for (const line of lines) {
            const trimmed = line.trim()
            if (trimmed.includes('---')) {
                pastHeader = true
                continue
            }
            if (!pastHeader) continue
            if (!trimmed || trimmed.length < 1) continue

            versions.push(trimmed)
            if (versions.length >= limit) break
        }

        return versions
    }

    async showPackage(id: string): Promise<Package | null> {
        try {
            const command = CommandBuilder.build('winget.show', { id })
            const result = await ipcService.executeCommand(command)
            if (!result.success && !result.stdout) return null
            return this.parseShowOutput(result.stdout, id)
        } catch {
            return null
        }
    }

    private parseShowOutput(stdout: string, fallbackId: string): Package | null {
        const lines = stdout.split('\n')
        const data: Record<string, string> = {}

        // First line: "Found <Name> [<Id>]" or Turkish: "Bulundu <Name> [<Id>]"
        const foundMatch = stdout.match(/(?:Found|Bulundu)\s+(.+?)\s+\[(.+?)\]/)
        if (foundMatch) {
            data['name'] = foundMatch[1].trim()
            data['id'] = foundMatch[2].trim()
        }

        // Key mappings: English + Turkish
        const keyMap: Record<string, string> = {
            'version': 'version', 'sürüm': 'version',
            'publisher': 'publisher', 'yayımcı': 'publisher', 'yayimci': 'publisher',
            'description': 'description', 'açıklama': 'description', 'aciklama': 'description',
            'author': 'author', 'yazar': 'author',
            'homepage': 'homepage', 'ana sayfa': 'homepage',
        }

        for (const line of lines) {
            const match = line.match(/^\s*([^:]+):\s*(.+)$/)
            if (match) {
                const rawKey = match[1].trim().toLowerCase()
                const value = match[2].trim()
                const mappedKey = keyMap[rawKey]
                if (mappedKey) {
                    data[mappedKey] = value
                }
            }
        }

        const id = data['id'] || fallbackId
        const name = data['name'] || id.split('.').pop() || id

        return {
            id,
            name,
            currentVersion: data['version'] || '',
            availableVersion: data['version'] || '',
            source: PackageSource.Winget,
            hasUpdate: false,
            category: detectCategory(name, id),
            publisher: data['publisher'] || data['author'],
            description: data['description']
        }
    }

    async searchPackages(query: string): Promise<Package[]> {
        try {
            const command = CommandBuilder.build('winget.search', { query })
            const result = await ipcService.executeCommand(command)
            // Limit to top 5 results for clarity
            return this.parseSearchOutput(result.stdout).slice(0, 5)
        } catch {
            return []
        }
    }

    private static readonly HEADER_PATTERN = /^\s*-?\s*(Name|Id|Version|Available|Source|Ad|Kimlik|S\u00fcr\u00fcm|Mevcut|Kaynak)/i
    private static readonly NOISE_PATTERN = /upgrade|yükseltme|güncelle|mevcut\.|available\.|installed|no .* found|bulunamadı|paket yüklü/i
    private static readonly HEADER_COMBO_PATTERN = /\bName\b.*\bId\b.*\bVersion\b|\bAd\b.*\bKimlik\b.*\bS\u00fcr\u00fcm\b/i

    private isNoiseLine(trimmed: string): boolean {
        if (trimmed.length < 5) return true
        if (trimmed.includes('---')) return true
        if (trimmed.match(/^[-\\|/\s]+$/)) return true
        if (WingetProvider.HEADER_PATTERN.test(trimmed)) return true
        if (WingetProvider.NOISE_PATTERN.test(trimmed)) return true
        if (WingetProvider.HEADER_COMBO_PATTERN.test(trimmed)) return true
        return false
    }

    private parseUpgradeOutput(stdout: string): Package[] {
        const packages: Package[] = []
        for (const line of stdout.split('\n')) {
            if (this.isNoiseLine(line.trim())) continue
            try {
                const pkg = this.parsePackageLine(line, { isUpgrade: true, isSearch: false })
                if (pkg) packages.push(pkg)
            } catch { continue }
        }
        return packages
    }

    private parseListOutput(stdout: string): Package[] {
        const packages: Package[] = []
        for (const line of stdout.split('\n')) {
            if (this.isNoiseLine(line.trim())) continue
            try {
                const pkg = this.parsePackageLine(line, { isUpgrade: false, isSearch: false })
                if (pkg) packages.push(pkg)
            } catch { continue }
        }
        return packages
    }

    private parseSearchOutput(stdout: string): Package[] {
        const packages: Package[] = []
        for (const line of stdout.split('\n')) {
            if (this.isNoiseLine(line.trim())) continue
            try {
                const pkg = this.parsePackageLine(line, { isUpgrade: false, isSearch: true })
                if (pkg) packages.push(pkg)
            } catch { continue }
        }
        return packages
    }

    private isValidPackageId(id: string): boolean {
        // A valid winget package ID typically contains a dot (e.g., Mozilla.Firefox)
        // or is a 12-char alphanumeric MS Store ID (e.g., 9NBLGGH4NNS1)
        if (!id || id.length < 2) return false
        return id.includes('.') || /^[A-Z0-9]{9,14}$/.test(id)
    }

    private parsePackageLine(line: string, options: { isUpgrade: boolean, isSearch: boolean }): Package | null {
        line = line.trim()
        if (!line) return null

        // 1. First, try to split by 2 or more spaces (The standard WinGet Table separator)
        const parts = line.split(/\s{2,}/).map(p => p.trim()).filter(p => p)

        if (parts.length >= 3) {
            const name = parts[0]
            const id = parts[1]

            if (!this.isValidPackageId(id)) return null

            const versionOrCurrent = parts[2]
            const availableOrSource = parts[3]
            const sourceInfo = parts[parts.length - 1]

            const currentVersion = versionOrCurrent || 'Unknown'
            const availableVersion = options.isUpgrade ? (availableOrSource || currentVersion) : currentVersion
            const pkgSource = (sourceInfo && sourceInfo.toLowerCase() === 'msstore') ? PackageSource.MsStore : PackageSource.Winget

            return {
                name, id, currentVersion, availableVersion,
                source: pkgSource, hasUpdate: options.isUpgrade, category: detectCategory(name, id)
            }
        }

        // 2. Fallback: Intelligent Token Splitting for 1-space gaps
        const tokens = line.split(/\s+/).filter(t => t)
        if (tokens.length < 3) return null

        // ID detection: dots or MSStore patterns
        let idIndex = -1
        for (let i = 1; i < tokens.length - 1; i++) {
            const t = tokens[i]
            if (t.includes('.') || /^[A-Z0-9]{12}$/.test(t) || (t.length > 5 && /[A-Z]/.test(t) && /[a-z]/.test(t))) {
                idIndex = i
                break
            }
        }

        if (idIndex === -1) idIndex = 1

        const name = tokens.slice(0, idIndex).join(' ')
        const id = tokens[idIndex]

        if (!this.isValidPackageId(id)) return null

        const version = tokens[idIndex + 1] || 'Unknown'
        const sourceName = tokens[tokens.length - 1]

        return {
            name, id, currentVersion: version, availableVersion: version,
            source: sourceName.toLowerCase() === 'msstore' ? PackageSource.MsStore : PackageSource.Winget,
            hasUpdate: options.isUpgrade, category: detectCategory(name, id)
        }
    }
}

export const wingetProvider = new WingetProvider()
