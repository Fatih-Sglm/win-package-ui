// App Store - Uygulama ayarları için Pinia store

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ipcService } from '@/services/ipc'
import { useNotificationStore } from './notification'
import i18n from '@/i18n'

export type Theme = 'light' | 'dark' | 'system'

export const useAppStore = defineStore('app', () => {
    // State
    const theme = ref<Theme>(
        (localStorage.getItem('theme') as Theme) || 'system'
    )
    const isAdmin = ref(false)

    // Computed dark mode
    const getSystemTheme = () => window.matchMedia('(prefers-color-scheme: dark)').matches
    const darkMode = ref(theme.value === 'system' ? getSystemTheme() : theme.value === 'dark')

    // Watch theme changes
    watch(theme, (newTheme) => {
        localStorage.setItem('theme', newTheme)
        darkMode.value = newTheme === 'system' ? getSystemTheme() : newTheme === 'dark'
    })

    watch(darkMode, (isDark) => {
        document.documentElement.classList.toggle('dark', isDark)
    }, { immediate: true })

    // Locale
    const locale = ref<'tr' | 'en'>((localStorage.getItem('locale') as 'tr' | 'en') || 'tr')

    // Actions
    function setLocale(newLocale: 'tr' | 'en') {
        locale.value = newLocale
        // Watcher handles localStorage
    }

    watch(locale, (newLocale) => {
        localStorage.setItem('locale', newLocale)
    })

    async function checkAdminStatus() {
        try {
            isAdmin.value = await ipcService.isAdmin()

            if (!isAdmin.value) {
                const notificationStore = useNotificationStore()
                // Use i18n directly from the import
                const t = (i18n.global as any).t
                notificationStore.warning(
                    t('app.adminRequired'),
                    t('app.adminRequiredDesc'),
                    3000
                )
            }
        } catch (error) {
            console.error('Admin kontrolü hatası:', error)
        }
    }

    function setTheme(newTheme: Theme) {
        theme.value = newTheme
    }

    function initSystemThemeListener() {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
        mediaQuery.addEventListener('change', (e) => {
            if (theme.value === 'system') {
                darkMode.value = e.matches
            }
        })
    }

    return {
        // State
        theme,
        isAdmin,
        darkMode,
        locale,

        // Actions
        checkAdminStatus,
        setTheme,
        setLocale,
        initSystemThemeListener
    }
})
