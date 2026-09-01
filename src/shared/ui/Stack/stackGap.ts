export const stackGap = {
  sm: 'sm',
  md: 'md',
  lg: 'lg',
  xl: 'xl',
} as const

export type StackGap = (typeof stackGap)[keyof typeof stackGap]
