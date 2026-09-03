export class ValidationError extends Error {
  readonly fieldErrors: Readonly<Record<string, string>>

  constructor(fieldErrors: Record<string, string>) {
    const fields = Object.keys(fieldErrors).join(', ')
    super(`Validation failed: ${fields}`)
    this.name = 'ValidationError'
    this.fieldErrors = fieldErrors
  }
}

export function isValidationError(error: unknown): error is ValidationError {
  return error instanceof ValidationError
}

export function formatUnknownError(cause: unknown): string {
  if (cause instanceof Error) {
    const text = cause.message.trim()
    if (text && text !== '[object Object]') {
      return text
    }
    if (cause.cause !== undefined) {
      return formatUnknownError(cause.cause)
    }
  }
  if (typeof cause === 'string' && cause.trim() !== '') {
    return cause
  }
  if (cause && typeof cause === 'object') {
    const rec = cause as Record<string, unknown>
    if (typeof rec.message === 'string' && rec.message.trim() !== '') {
      return rec.message
    }
    if (typeof rec.reason === 'string' && rec.reason.trim() !== '') {
      return rec.reason
    }
    const nested = rec.error
    if (nested && nested !== cause) {
      return formatUnknownError(nested)
    }
    try {
      return JSON.stringify(cause)
    } catch {
      return 'Request failed'
    }
  }
  return 'Request failed'
}
