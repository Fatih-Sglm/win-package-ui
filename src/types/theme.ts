export interface ThemeTokens {
  // Colors
  'color-bg': string
  'color-surface': string
  'color-muted': string
  'color-text': string
  'color-primary': string
  'color-primary-foreground': string
  'color-secondary': string
  'color-success': string
  'color-warning': string
  'color-danger': string

  // Semantic tokens
  'radius-sm'?: string
  'radius-md'?: string
  'radius-lg'?: string

  // Additional custom tokens
  [key: string]: string | undefined
}

export interface Theme {
  id: string // unique id, e.g. 'light', 'dark', 'blue-1'
  name: string
  author?: string
  version?: string
  description?: string
  tokens: ThemeTokens
}

export interface ThemePackage {
  packageId: string
  theme: Theme
}

export const DEFAULT_LIGHT_THEME: Theme = {
  id: 'light',
  name: 'Light',
  version: '1.0.0',
  tokens: {
    'color-bg': '#ffffff',
    'color-surface': '#f8fafc',
    'color-muted': '#6b7280',
    'color-text': '#0f172a',
    'color-primary': '#2563eb',
    'color-primary-foreground': '#ffffff',
    'color-secondary': '#64748b',
    'color-success': '#16a34a',
    'color-warning': '#f59e0b',
    'color-danger': '#dc2626',
    'radius-sm': '4px',
    'radius-md': '8px'
  }
}

export const DEFAULT_DARK_THEME: Theme = {
  id: 'dark',
  name: 'Dark',
  version: '1.0.0',
  tokens: {
    'color-bg': '#0b1220',
    'color-surface': '#071025',
    'color-muted': '#9ca3af',
    'color-text': '#e6eef8',
    'color-primary': '#3b82f6',
    'color-primary-foreground': '#0b1220',
    'color-secondary': '#94a3b8',
    'color-success': '#16a34a',
    'color-warning': '#f59e0b',
    'color-danger': '#ef4444',
    'radius-sm': '4px',
    'radius-md': '8px'
  }
}
