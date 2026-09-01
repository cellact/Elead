export function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message)
  }
}

export function unreachable(value: never, message = 'Unreachable state'): never {
  throw new Error(`${message}: ${String(value)}`)
}
