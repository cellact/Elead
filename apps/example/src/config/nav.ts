import { routes } from '@/config/routes'
import type { NavItem } from '@/shared/config/site'

export const exampleNav: readonly NavItem[] = [
  { to: routes.home, label: 'Home', end: true },
]
