export const minVisibleMs = 900

export function waitRemaining(
  startedAt: number,
  minimumMs: number,
): Promise<void> {
  const remaining = minimumMs - (Date.now() - startedAt)

  if (remaining <= 0) {
    return Promise.resolve()
  }

  return new Promise((resolve) => {
    window.setTimeout(resolve, remaining)
  })
}
