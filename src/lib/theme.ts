import { reactive, watch } from 'vue'
import { useStorage } from '@vueuse/core'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
}

export interface Theme {
  id: string
  name: string
  type: 'light' | 'dark'
  colors: ThemeColors
}

// Default Dark Theme (Zinc-based)
const MOONLIGHT_THEME: Theme = {
  id: 'moonlight',
  name: 'Moonlight (Default)',
  type: 'dark',
  colors: {
    background: '240 10% 3.9%',
    foreground: '0 0% 98%',
    card: '240 10% 6%', // Slightly lighter than bg
    'card-foreground': '0 0% 98%',
    popover: '240 10% 3.9%',
    'popover-foreground': '0 0% 98%',
    primary: '210 100% 50%', // Blue
    'primary-foreground': '0 0% 100%',
    secondary: '240 3.7% 15.9%',
    'secondary-foreground': '0 0% 98%',
    muted: '240 3.7% 15.9%',
    'muted-foreground': '240 5% 64.9%',
    accent: '240 3.7% 15.9%',
    'accent-foreground': '0 0% 98%',
    destructive: '0 62.8% 30.6%',
    'destructive-foreground': '0 0% 98%',
    border: '240 3.7% 15.9%',
    input: '240 3.7% 15.9%',
    ring: '240 4.9% 83.9%',
  }
}

// Default Light Theme
const SUNLIGHT_THEME: Theme = {
  id: 'sunlight',
  name: 'Sunlight',
  type: 'light',
  colors: {
    background: '0 0% 100%',
    foreground: '240 10% 3.9%',
    card: '0 0% 100%',
    'card-foreground': '240 10% 3.9%',
    popover: '0 0% 100%',
    'popover-foreground': '240 10% 3.9%',
    primary: '210 100% 50%',
    'primary-foreground': '0 0% 100%',
    secondary: '240 4.8% 95.9%',
    'secondary-foreground': '240 5.9% 10%',
    muted: '240 4.8% 95.9%',
    'muted-foreground': '240 3.8% 46.1%',
    accent: '240 4.8% 95.9%',
    'accent-foreground': '240 5.9% 10%',
    destructive: '0 84.2% 60.2%',
    'destructive-foreground': '0 0% 98%',
    border: '240 5.9% 90%',
    input: '240 5.9% 90%',
    ring: '240 10% 3.9%',
  }
}

export const useTheme = () => {
  const activeThemeId = useStorage('app-theme-id', 'moonlight')
  const customThemes = useStorage<Theme[]>('app-custom-themes', [])

  const availableThemes = reactive<Theme[]>([
    MOONLIGHT_THEME,
    SUNLIGHT_THEME,
    ...customThemes.value
  ])

  const currentTheme = reactive<Theme>({ ...MOONLIGHT_THEME })

  function applyTheme(theme: Theme) {
    const root = document.documentElement

    // Set class for Tailwind dark mode
    if (theme.type === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })

    // Update local state
    Object.assign(currentTheme, theme)
    activeThemeId.value = theme.id
  }

  function setTheme(id: string) {
    const theme = availableThemes.find(t => t.id === id)
    if (theme) {
      applyTheme(theme)
    }
  }

  function registerTheme(theme: Theme) {
    // Basic validation
    if (!theme.id || !theme.colors) return

    // Override if exists in custom, or add new
    const existingIndex = customThemes.value.findIndex(t => t.id === theme.id)
    if (existingIndex >= 0) {
      customThemes.value[existingIndex] = theme
    } else {
      customThemes.value.push(theme)
    }

    // Refresh available
    availableThemes.splice(0, availableThemes.length, MOONLIGHT_THEME, SUNLIGHT_THEME, ...customThemes.value)
  }

  // Init
  watch(activeThemeId, (id) => {
    setTheme(id)
  }, { immediate: true })

  return {
    activeThemeId,
    currentTheme,
    availableThemes,
    setTheme,
    registerTheme
  }
}

/** Legacy Compatibility Shim */
export function applyThemeVars(vars: Record<string, string>, themeId?: string) {
  const root = document.documentElement
  Object.entries(vars).forEach(([key, value]) => {
    // If it's one of the new HSL values, we just pass it
    // If it's an old hex value, it might not work perfectly with shadcn components
    // but at least it won't crash the store.
    root.style.setProperty(`--${key}`, value)
  })
}
