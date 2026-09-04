function fromMeta(name: keyof ImportMetaEnv, fallback: string): string {
  const value = import.meta.env[name]
  if (typeof value === 'string' && value.trim() !== '') {
    return value.trim()
  }
  return fallback
}

export const site = {
  name: fromMeta('VITE_APP_NAME', 'Aegis'),
  tagline: fromMeta('VITE_APP_TAGLINE', 'Protect your users.'),
} as const

export type NavItem = {
  to: string
  label: string
  end?: boolean
}
