import { ValidationError } from '@/shared/lib/errors'

export function requireDomain(value: string): string {
  const domain = value.trim().toLowerCase()

  if (domain.length < 2) {
    throw new ValidationError({
      domain: 'Enter a domain name of at least 2 characters.',
    })
  }

  if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(domain)) {
    throw new ValidationError({
      domain:
        'Use letters, numbers, and hyphens only. Do not include a dot or spaces.',
    })
  }

  return domain
}

export function requirePurchaseCount(value: string): number {
  const count = Number(value.trim())

  if (!Number.isInteger(count) || count < 1) {
    throw new ValidationError({
      count: 'Enter how many identities to buy. At least 1.',
    })
  }

  return count
}
