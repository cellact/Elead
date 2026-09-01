import { isCategoryId } from '@/shared/data/catalog'
import type { NewRequestInput, ProviderProfile } from '@/shared/data/types'
import { ValidationError } from '@/shared/lib/errors'

function requireText(value: string, field: string, min = 2): string {
  const trimmed = value.trim()

  if (trimmed.length < min) {
    throw new ValidationError({
      [field]: `${field} must be at least ${min} characters.`,
    })
  }

  return trimmed
}

export function validateNewRequest(input: NewRequestInput): NewRequestInput {
  const fieldErrors: Record<string, string> = {}

  if (!isCategoryId(input.categoryId)) {
    fieldErrors.categoryId = 'Choose a category.'
  }

  try {
    requireText(input.title, 'title', 4)
  } catch {
    fieldErrors.title = 'Title must be at least 4 characters.'
  }

  try {
    requireText(input.details, 'details', 16)
  } catch {
    fieldErrors.details = 'Details must be at least 16 characters.'
  }

  try {
    requireText(input.location, 'location')
  } catch {
    fieldErrors.location = 'Location is required.'
  }

  try {
    requireText(input.budget, 'budget')
  } catch {
    fieldErrors.budget = 'Budget is required.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors)
  }

  return {
    categoryId: input.categoryId,
    title: input.title.trim(),
    details: input.details.trim(),
    location: input.location.trim(),
    budget: input.budget.trim(),
  }
}

export function validateProfile(input: ProviderProfile): ProviderProfile {
  const fieldErrors: Record<string, string> = {}

  if (!isCategoryId(input.trade)) {
    fieldErrors.trade = 'Choose a trade.'
  }

  try {
    requireText(input.name, 'name')
  } catch {
    fieldErrors.name = 'Name is required.'
  }

  try {
    requireText(input.city, 'city')
  } catch {
    fieldErrors.city = 'City is required.'
  }

  try {
    requireText(input.bio, 'bio', 16)
  } catch {
    fieldErrors.bio = 'Bio must be at least 16 characters.'
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ValidationError(fieldErrors)
  }

  return {
    name: input.name.trim(),
    trade: input.trade,
    city: input.city.trim(),
    bio: input.bio.trim(),
  }
}
