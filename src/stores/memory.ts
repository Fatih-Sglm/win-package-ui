// Memory store - caches user preferences, themes, popular list and package metadata
import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import type { Theme, ThemePackage } from '@/types/theme'
import { DEFAULT_DARK_THEME, DEFAULT_LIGHT_THEME } from '@/types/theme'
import { applyThemeVars } from '@/lib/theme'

export const useMemoryStore = defineStore('memory', () => {
  const currentTheme = ref<string>(localStorage.getItem('memory.theme') || DEFAULT_LIGHT_THEME.id)

  // theme registry stores Theme objects keyed by id
  const themeRegistry = ref<Record<string, Theme>>(
    JSON.parse(localStorage.getItem('memory.themeRegistry') || '{}')
  )

  // ensure defaults exist
  if (!themeRegistry.value[DEFAULT_LIGHT_THEME.id]) themeRegistry.value[DEFAULT_LIGHT_THEME.id] = DEFAULT_LIGHT_THEME
  if (!themeRegistry.value[DEFAULT_DARK_THEME.id]) themeRegistry.value[DEFAULT_DARK_THEME.id] = DEFAULT_DARK_THEME

  const themes = ref<string[]>(Object.keys(themeRegistry.value))

  const themeVars = ref<Record<string, string>>(JSON.parse(localStorage.getItem('memory.themeVars') || '{}'))

  // Centralized settings object (UI and preferences)
  const settings = ref({
    language: localStorage.getItem('memory.settings.language') || 'tr',
    appTitle: localStorage.getItem('memory.settings.appTitle') || 'Paket Yöneticisi',
    defaultSource: (localStorage.getItem('memory.settings.defaultSource') as string) || 'all',
    preferInteractive: localStorage.getItem('memory.settings.preferInteractive') !== 'false',
    showOnlyUpdates: localStorage.getItem('memory.settings.showOnlyUpdates') !== 'false'
  })

  // sync settings to localStorage
  watch(settings, (v) => {
    try {
      localStorage.setItem('memory.settings.language', v.language)
      localStorage.setItem('memory.settings.appTitle', v.appTitle)
      localStorage.setItem('memory.settings.defaultSource', v.defaultSource)
      localStorage.setItem('memory.settings.preferInteractive', String(v.preferInteractive))
      localStorage.setItem('memory.settings.showOnlyUpdates', String(v.showOnlyUpdates))
    } catch (e) { /* ignore */ }
  }, { deep: true })

  const favorites = ref<string[]>(JSON.parse(localStorage.getItem('memory.favorites') || '[]'))

  // cached popular packages (seeded or fetched from remote)
  const popular = ref<any[]>(JSON.parse(localStorage.getItem('memory.popular') || '[]'))

  // generic package metadata cache keyed by package id+source
  const cache = ref<Record<string, any>>(JSON.parse(localStorage.getItem('memory.cache') || '{}'))

  // persist watches
  watch(currentTheme, (v) => localStorage.setItem('memory.theme', v))
  watch(themeVars, (v) => localStorage.setItem('memory.themeVars', JSON.stringify(v)))
  watch(themeRegistry, (v) => localStorage.setItem('memory.themeRegistry', JSON.stringify(v)))
  watch(favorites, (v) => localStorage.setItem('memory.favorites', JSON.stringify(v)))
  watch(popular, (v) => localStorage.setItem('memory.popular', JSON.stringify(v)))
  watch(cache, (v) => localStorage.setItem('memory.cache', JSON.stringify(v)))

  // apply theme tokens when themeVars or currentTheme changes
  watch(themeVars, (v) => {
    try { applyThemeVars(v, currentTheme.value) } catch (e) { /* ignore */ }
  }, { immediate: true })

  watch(currentTheme, (v) => {
    const th = themeRegistry.value[v]
    if (th && th.tokens) {
      try { applyThemeVars(th.tokens as Record<string,string>, v) } catch (e) { /* ignore */ }
    }
  }, { immediate: true })

  function setTheme(name: string) {
    if (!themeRegistry.value[name]) return
    if (!themes.value.includes(name)) themes.value.push(name)
    currentTheme.value = name
    // apply theme tokens to themeVars for runtime usage
    const th = themeRegistry.value[name]
    if (th && th.tokens) setThemeVars(th.tokens as Record<string, string>)
  }

  function setThemeVars(vars: Record<string, string>) {
    themeVars.value = { ...themeVars.value, ...vars }
  }

  function registerTheme(theme: Theme) {
    if (!theme || !theme.id) return
    themeRegistry.value = { ...themeRegistry.value, [theme.id]: theme }
    if (!themes.value.includes(theme.id)) themes.value.push(theme.id)
  }

  // Settings helpers
  function setLanguage(lang: string) {
    settings.value.language = lang
  }

  function setAppTitle(title: string) {
    settings.value.appTitle = title
  }

  function setDefaultSource(src: string) {
    settings.value.defaultSource = src
  }

  function setPreference(key: keyof typeof settings.value, value: any) {
    // @ts-ignore
    settings.value[key] = value
  }

  function unregisterTheme(themeId: string) {
    if (!themeRegistry.value[themeId]) return
    const copy = { ...themeRegistry.value }
    delete copy[themeId]
    themeRegistry.value = copy
    themes.value = Object.keys(themeRegistry.value)
    if (currentTheme.value === themeId) setTheme(DEFAULT_LIGHT_THEME.id)
  }

  function listThemes(): Theme[] {
    return Object.values(themeRegistry.value)
  }

  function installThemePackage(pkg: ThemePackage) {
    if (!pkg || !pkg.theme) return
    registerTheme(pkg.theme)
  }

  function addFavorite(pkgKey: string) {
    if (!favorites.value.includes(pkgKey)) favorites.value.push(pkgKey)
  }

  function removeFavorite(pkgKey: string) {
    favorites.value = favorites.value.filter(p => p !== pkgKey)
  }

  function setPopular(list: any[]) {
    popular.value = list
  }

  function cachePackage(key: string, meta: any) {
    cache.value = { ...cache.value, [key]: meta }
  }

  function getCached(key: string) {
    return cache.value[key]
  }

  function clearCache() {
    cache.value = {}
  }

  return {
    currentTheme,
    themes,
    themeVars,
    themeRegistry,
    favorites,
    popular,
    cache,
    settings,
    setTheme,
    setThemeVars,
    registerTheme,
    unregisterTheme,
    listThemes,
    installThemePackage,
    addFavorite,
    removeFavorite,
    setPopular,
    cachePackage,
    getCached,
    clearCache
  }
})
