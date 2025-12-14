// Enums for Package Management

/**
 * Paket kaynakları enum
 */
export enum PackageSource {
    Winget = 'winget',
    Chocolatey = 'chocolatey',
    MsStore = 'msstore'
}

/**
 * Paket kategorileri enum
 */
export enum CategoryType {
    Developer = 'Geliştirici',
    Media = 'Medya',
    Gaming = 'Oyun',
    Communication = 'İletişim',
    Browser = 'Tarayıcı',
    Productivity = 'Üretkenlik',
    Tools = 'Araçlar',
    Other = 'Diğer'
}
