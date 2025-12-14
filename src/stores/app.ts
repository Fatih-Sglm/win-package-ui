// App Store - Uygulama ayarları için Pinia store

import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { ipcService } from '@/services/ipc'
import { useNotificationStore } from './notification'

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
        localStorage.setItem('locale', newLocale)
        // i18n'i burada import edip kullanmak cycle yaratabilir, bu yüzden App.vue içinde watcher kullanacağız 
        // veya i18n importunu store dışında yapacağız.
    }

    async function checkAdminStatus() {
        try {
            isAdmin.value = await ipcService.isAdmin()

            if (!isAdmin.value) {
                const notificationStore = useNotificationStore()
                notificationStore.warning(
                    'Yönetici Modu Gerekli', // Bu stringler de localize edilmeli store içinde
                    'Uygulama yönetici modunda çalışmıyor. Chocolatey ve bazı işlemler başarısız olabilir.',
                    8000
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
