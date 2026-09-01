function readRequiredEnv(name: keyof ImportMetaEnv): string {
  const value = import.meta.env[name]

  if (typeof value !== 'string' || value.trim() === '') {
    throw new Error(
      `Missing required environment variable: ${name}. Copy .env.example to .env in this app and set it.`,
    )
  }

  return value.trim()
}

export const env = {
  appName: readRequiredEnv('VITE_APP_NAME'),
  appTagline: readRequiredEnv('VITE_APP_TAGLINE'),
  apiUrl: readRequiredEnv('VITE_API_URL'),
} as const
