// Category Model - Name ve Icon ile

import { CategoryType } from './enums'

export interface CategoryInfo {
    type: CategoryType
    name: string
    icon: string
}

/**
 * Tüm kategoriler için bilgi sağlar
 */
export const Categories: Record<CategoryType, CategoryInfo> = {
    [CategoryType.Developer]: {
        type: CategoryType.Developer,
        name: 'Geliştirici',
        icon: '💻'
    },
    [CategoryType.Media]: {
        type: CategoryType.Media,
        name: 'Medya',
        icon: '🎵'
    },
    [CategoryType.Gaming]: {
        type: CategoryType.Gaming,
        name: 'Oyun',
        icon: '🎮'
    },
    [CategoryType.Communication]: {
        type: CategoryType.Communication,
        name: 'İletişim',
        icon: '💬'
    },
    [CategoryType.Browser]: {
        type: CategoryType.Browser,
        name: 'Tarayıcı',
        icon: '🌐'
    },
    [CategoryType.Productivity]: {
        type: CategoryType.Productivity,
        name: 'Üretkenlik',
        icon: '📊'
    },
    [CategoryType.Tools]: {
        type: CategoryType.Tools,
        name: 'Araçlar',
        icon: '🔧'
    },
    [CategoryType.Other]: {
        type: CategoryType.Other,
        name: 'Diğer',
        icon: '📦'
    }
}

/**
 * Kategori bilgisini al
 */
export function getCategoryInfo(type: CategoryType): CategoryInfo {
    return Categories[type]
}

/**
 * Kategorinin ikonunu al
 */
export function getCategoryIcon(type: CategoryType): string {
    return Categories[type].icon
}

/**
 * Tüm kategorileri listele
 */
export function getAllCategories(): CategoryInfo[] {
    return Object.values(Categories)
}
