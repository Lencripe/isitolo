export type CreatorCollectionCategory = 'clothing' | 'printable_artworks'

export interface CreatorCollectionItem {
  id: string
  title: string
  sku: string
  basePriceUsdc: number
  maxSupply: number
}

export interface CreatorCollection {
  id: string
  name: string
  category: CreatorCollectionCategory
  description: string
  coverImageUrl: string
  royaltyBps: number
  createdAt: string
  items: CreatorCollectionItem[]
}

export const CREATOR_COLLECTIONS_STORAGE_KEY = 'istolo:creatorCollections'

export function loadCreatorCollections(): CreatorCollection[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = window.localStorage.getItem(CREATOR_COLLECTIONS_STORAGE_KEY)
  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as CreatorCollection[]
  } catch {
    return []
  }
}

export function saveCreatorCollections(collections: CreatorCollection[]): void {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(CREATOR_COLLECTIONS_STORAGE_KEY, JSON.stringify(collections))
}
