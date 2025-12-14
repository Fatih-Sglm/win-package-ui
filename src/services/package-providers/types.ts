// Package provider types and interfaces
// Models'dan import ediliyor

import { PackageSource, CategoryType } from '@/models'
import type { Package, UpdateResult, PackageListResult, BulkUpdateResult } from '@/models'

// Re-export from models
export { PackageSource, CategoryType }
export type { Package, UpdateResult, PackageListResult, BulkUpdateResult }

/**
 * Paket isminden veya ID'sinden kategori belirle
 */
export function detectCategory(name: string, id: string): CategoryType {
    const searchText = (name + ' ' + id).toLowerCase()

    if (searchText.match(/visual studio|vscode|code|rider|datagrip|intellij|pycharm|webstorm|phpstorm|android studio|git|docker|kubernetes|python|node|java|dotnet|typescript|npm|yarn|postman|insomnia|terminal|powershell|vim|sublime|atom|brackets|notepad\+\+/)) {
        return CategoryType.Developer
    }

    if (searchText.match(/spotify|vlc|media player|itunes|music|video|obs|audacity|handbrake|kodi|plex|netflix|youtube|discord|zoom|teams|skype|slack|telegram/)) {
        return CategoryType.Media
    }

    if (searchText.match(/steam|epic|origin|uplay|gog|nvidia geforce|amd|game|gaming|minecraft|roblox|ea app|battle\.net|riot/)) {
        return CategoryType.Gaming
    }

    if (searchText.match(/whatsapp|telegram|signal|discord|slack|teams|zoom|skype|messenger/)) {
        return CategoryType.Communication
    }

    if (searchText.match(/chrome|firefox|edge|brave|opera|vivaldi|safari|browser|floorp|librewolf|waterfox|pale moon|seamonkey|basilisk|tor browser|chromium/)) {
        return CategoryType.Browser
    }

    if (searchText.match(/office|word|excel|powerpoint|outlook|onenote|notion|evernote|trello|asana|todoist|wps office|libreoffice|openoffice|adobe|photoshop|illustrator|premiere/)) {
        return CategoryType.Productivity
    }

    if (searchText.match(/winrar|7zip|ccleaner|malwarebytes|antivirus|vpn|wireshark|putty|filezilla|qbittorrent|utorrent|logitech|mouse|keyboard|driver|utility|everythingtoolbar|treesize|warp|cursor/)) {
        return CategoryType.Tools
    }

    return CategoryType.Other
}

/**
 * Package Provider Interface
 * İleride yeni paket yöneticileri eklemek için bu interface'i implement edin
 */
export interface PackageProvider {
    /** Provider adı */
    readonly name: PackageSource

    /** Provider ikonu */
    readonly icon: string

    /** Provider yüklü mü kontrol et */
    isInstalled(): Promise<boolean>

    /** Paket listesini al */
    getPackages(onlyUpdates: boolean): Promise<Package[]>

    /** Paketi güncelle */
    updatePackage(id: string, interactive: boolean): Promise<UpdateResult>

    /** Paketi yükle */
    installPackage(id: string, interactive: boolean): Promise<UpdateResult>

    /** Paketi kaldır */
    uninstallPackage(id: string): Promise<UpdateResult>

    /** Paket ara */
    searchPackages?(query: string): Promise<Package[]>
}
