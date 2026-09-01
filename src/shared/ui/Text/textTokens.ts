export const textSize = {
  md: 'md',
  lg: 'lg',
} as const

export const textTone = {
  ink: 'ink',
  mute: 'mute',
} as const

export type TextSize = (typeof textSize)[keyof typeof textSize]
export type TextTone = (typeof textTone)[keyof typeof textTone]
