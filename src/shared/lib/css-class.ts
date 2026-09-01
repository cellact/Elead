export function requireCssClass(
  classes: Record<string, string | undefined>,
  name: string,
): string {
  const value = classes[name]

  if (!value) {
    throw new Error(`Missing CSS module class: ${name}`)
  }

  return value
}
