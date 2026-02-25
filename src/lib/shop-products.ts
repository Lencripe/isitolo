import { HOME_PRODUCTS } from './home-products'

export interface ShopCatalogProduct {
  id: string
  name: string
  description: string
  price: number
  image: string
}

function parsePriceUsd(value: string): number {
  const numeric = Number(value.replace(/[^\d.]/g, ''))
  return Number.isFinite(numeric) ? numeric : 0
}

const HOME_PRODUCTS_FOR_SHOP: ShopCatalogProduct[] = HOME_PRODUCTS.map((product) => ({
  id: product.id,
  name: product.name,
  description: product.description,
  price: parsePriceUsd(product.price),
  image: product.image,
}))

const ADDITIONAL_SHOP_PRODUCTS: ShopCatalogProduct[] = [
  {
    id: 'premium-tshirt',
    name: 'Premium T-Shirt',
    description: 'High-quality cotton t-shirt with custom design',
    price: 25,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800',
  },
  {
    id: 'everyday-hoodie',
    name: 'Everyday Hoodie',
    description: 'Comfortable hoodie built for daily wear',
    price: 45,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800',
  },
  {
    id: 'shadow-cap-classic',
    name: 'Shadow Cap Classic',
    description: 'Street-ready cap with stitched branding',
    price: 15,
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=800',
  },
  {
    id: 'metro-backpack',
    name: 'Metro Backpack',
    description: 'Durable backpack with multiple compartments',
    price: 60,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800',
  },
  {
    id: 'tech-fleece-jacket',
    name: 'Tech Fleece Jacket',
    description: 'Lightweight insulated jacket with matte finish',
    price: 72,
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=800',
  },
  {
    id: 'vintage-wash-tee',
    name: 'Vintage Wash Tee',
    description: 'Soft feel tee with washed texture and drop shoulders',
    price: 28,
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=800',
  },
  {
    id: 'essential-joggers',
    name: 'Essential Joggers',
    description: 'Tapered joggers with breathable stretch fabric',
    price: 38,
    image: 'https://images.unsplash.com/photo-1506629905607-d9f2f38b4b2d?w=800',
  },
  {
    id: 'nfc-denim-jacket',
    name: 'NFC Denim Jacket',
    description: 'Oversized denim jacket with sewn NFC verification tag',
    price: 95,
    image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?w=800',
  },
  {
    id: 'relic-cargo-pants',
    name: 'Relic Cargo Pants',
    description: 'Utility cargo pants with modular pocket layout',
    price: 52,
    image: 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=800',
  },
  {
    id: 'capsule-zip-hoodie',
    name: 'Capsule Zip Hoodie',
    description: 'Full-zip hoodie with brushed interior and clean lines',
    price: 58,
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800',
  },
  {
    id: 'mono-longsleeve',
    name: 'Mono Longsleeve',
    description: 'Midweight long sleeve with subtle reflective print',
    price: 33,
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
  },
  {
    id: 'artisan-knit-beanie',
    name: 'Artisan Knit Beanie',
    description: 'Warm knit beanie with folded rib cuff',
    price: 18,
    image: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800',
  },
  {
    id: 'street-coach-jacket',
    name: 'Street Coach Jacket',
    description: 'Water-resistant coach jacket with snap front',
    price: 64,
    image: 'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=800',
  },
  {
    id: 'drift-shorts',
    name: 'Drift Shorts',
    description: 'Relaxed summer shorts with adjustable drawcord waist',
    price: 27,
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800',
  },
  {
    id: 'signature-tote',
    name: 'Signature Tote',
    description: 'Heavy-canvas tote bag with reinforced handles',
    price: 22,
    image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=800',
  },
  {
    id: 'elevate-overshirt',
    name: 'Elevate Overshirt',
    description: 'Layer-ready overshirt with snap chest pockets',
    price: 48,
    image: 'https://images.unsplash.com/photo-1490114538077-0a7f8cb49891?w=800',
  },
]

export const SHOP_PRODUCTS: ShopCatalogProduct[] = [
  ...HOME_PRODUCTS_FOR_SHOP,
  ...ADDITIONAL_SHOP_PRODUCTS,
]
