import { env } from '@/shared/lib/env'
import { routes } from '@/shared/config/routes'

export const site = {
  name: env.appName,
  tagline: 'Leave a lead. Remain anonymous.',
} as const

export type NavItem = {
  to: string
  label: string
  end?: boolean
}

export const marketingNav: readonly NavItem[] = [
  { to: routes.user.root, label: 'Clients' },
  { to: routes.provider.root, label: 'Providers' },
]

export const userNav: readonly NavItem[] = [
  { to: routes.user.root, label: 'Studio', end: true },
  { to: routes.user.contact, label: 'Contact us' },
]

export const providerNav: readonly NavItem[] = [
  { to: routes.provider.root, label: 'Studio', end: true },
  { to: routes.provider.leads, label: 'Leads' },
  { to: routes.provider.profile, label: 'Profile' },
]
