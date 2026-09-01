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
