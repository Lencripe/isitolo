
import { Link } from 'react-router-dom'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { Button } from './Button'

const products = [
  {
    id: 1,
    name: 'Metal Prints',
    description: 'Vibrant metal prints with a modern, sleek finish',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8e12a7c6?w=400&h=400&fit=crop',
    colors: ['Silver', 'Gold', 'Rose Gold'],
    price: 'From $29',
  },
  {
    id: 2,
    name: 'Paper Prints',
    description: 'Premium art prints on museum-quality paper',
    image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=400&fit=crop',
    colors: ['Matte', 'Glossy', 'Fine Art'],
    price: 'From $15',
  },
  {
    id: 3,
    name: 'Canvas Prints',
    description: 'Professional canvas prints with gallery wrapping',
    image: 'https://images.unsplash.com/photo-1551886287-f40a50c58a5d?w=400&h=400&fit=crop',
    colors: ['Portrait', 'Landscape', 'Square'],
    price: 'From $45',
  },
  {
    id: 4,
    name: 'Merchandise',
    description: 'T-shirts, hoodies, and apparel with your designs',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    colors: ['White', 'Black', 'Colors'],
    price: 'From $8',
  },
]

export function ProductsSection() {
  return (
    <section id="products" className="py-20 md:py-28 border-t border-border bg-muted/30">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Our Products
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Choose from premium print options to bring your vision to life
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col">
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
              </div>
              <CardHeader>
                <CardTitle className="text-lg">{product.name}</CardTitle>
                <CardDescription>{product.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-semibold">
                    Options
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.colors.map((color) => (
                      <span 
                        key={color}
                        className="text-xs bg-muted px-2 py-1 rounded"
                      >
                        {color}
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-lg font-semibold text-primary">
                  {product.price}
                </p>
                <Link to="/shop" className="block">
                  <Button className="w-full">Shop Now</Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
