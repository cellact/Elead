import { routes } from '@/config/routes'
import type { NavItem } from '@/shared/config/site'

export const consoleNav: readonly NavItem[] = [
  { to: routes.studio, label: 'Inboxes', end: true },
  { to: routes.manage, label: 'Identities' },
]
