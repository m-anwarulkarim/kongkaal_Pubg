export interface StoreProduct {
  id: string
  title: string
  category: 'UC_TOPUP' | 'ROYALE_PASS' | 'GAMING_GEAR' | 'SKINS'
  priceBDT: number
  originalPriceBDT?: number
  image: string
  rating: number
  stock: number
  inStock: boolean
  badge?: string
}
