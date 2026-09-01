export type CategoryId =
  | 'architecture'
  | 'interiors'
  | 'legal'
  | 'photography'
  | 'brand'
  | 'film'

export type ServiceCategory = {
  id: CategoryId
  name: string
  brief: string
}

export const categories: readonly ServiceCategory[] = [
  { id: 'architecture', name: 'Architecture', brief: 'Buildings, sites, and spatial work' },
  { id: 'interiors', name: 'Interiors', brief: 'Rooms, materials, and atmosphere' },
  { id: 'legal', name: 'Legal', brief: 'Contracts, counsel, and filings' },
  { id: 'photography', name: 'Photography', brief: 'Still work for people and places' },
  { id: 'brand', name: 'Brand', brief: 'Identity, language, and systems' },
  { id: 'film', name: 'Film', brief: 'Moving image and production' },
]

const categoriesById = new Map(
  categories.map((category) => [category.id, category]),
)

export function getCategory(categoryId: string): ServiceCategory {
  const category = categoriesById.get(categoryId as CategoryId)

  if (!category) {
    throw new Error(`Unknown service category: ${categoryId}`)
  }

  return category
}

export function isCategoryId(value: string): value is CategoryId {
  return categoriesById.has(value as CategoryId)
}
