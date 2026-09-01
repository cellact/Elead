export const routes = {
  home: '/',
  user: {
    root: '/user',
    contact: '/user/contact',
  },
  provider: {
    root: '/provider',
    manage: '/provider/manage',
  },
} as const

export type AppPath =
  | typeof routes.home
  | (typeof routes.user)[keyof typeof routes.user]
  | (typeof routes.provider)[keyof typeof routes.provider]
