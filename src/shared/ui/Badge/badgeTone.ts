export const badgeTone = {
  solid: 'solid',
  outline: 'outline',
} as const

export type BadgeTone = (typeof badgeTone)[keyof typeof badgeTone]
