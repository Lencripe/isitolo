export interface HomeProduct {
  id: string
  slug: string
  name: string
  brand: string
  price: string
  image: string
  gallery: string[]
  tags: string[]
  description: string
}

export const HOME_PRODUCTS: HomeProduct[] = [
  {
    id: 'dammed-saint-black-tee',
    slug: 'dammed-saint-black-tee',
    name: 'Dammed Saint Black Tee',
    brand: 'Dammed Saint',
    price: '$5',
    image: '/Front_Black.png',
    gallery: ['/Front_Black.png', '/Back_Black.png'],
    tags: ['NFT', 'NFC'],
    description:
      'Signature Dammed Saint black tee with front and back artwork. Includes digital passport support for ownership verification and rewards.',
  },
  {
    id: 'void-walker-hoodie',
    slug: 'void-walker-hoodie',
    name: 'Void Walker Hoodie',
    brand: 'Dammed Saint',
    price: '$180',
    image: 'https://images.unsplash.com/photo-1649962843028-54905316eb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    gallery: ['https://images.unsplash.com/photo-1649962843028-54905316eb21?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
    tags: ['NFT', 'NFC'],
    description: 'Heavyweight hoodie designed for limited drops with embedded digital ownership.',
  },
  {
    id: 'origin-oversized-tee',
    slug: 'origin-oversized-tee',
    name: 'Origin Oversized Tee',
    brand: 'Dammed Saint',
    price: '$85',
    image: 'https://images.unsplash.com/photo-1562135291-7728cc647783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    gallery: ['https://images.unsplash.com/photo-1562135291-7728cc647783?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
    tags: ['NFT'],
    description: 'Relaxed-fit tee built for creator collections and merch verification.',
  },
  {
    id: 'shadow-cap',
    slug: 'shadow-cap',
    name: 'Shadow Cap',
    brand: 'Dammed Saint',
    price: '$60',
    image: 'https://images.unsplash.com/photo-1742473716872-ff82599f90db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    gallery: ['https://images.unsplash.com/photo-1742473716872-ff82599f90db?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080'],
    tags: ['NFC'],
    description: 'Minimal cap featuring NFC-ready product identity support.',
  },
]
