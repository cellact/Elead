import { env } from '@/shared/lib/env'

export const site = {
  name: env.appName,
  tagline: env.appTagline,
} as const

export type NavItem = {
  to: string
  label: string
  end?: boolean
}
