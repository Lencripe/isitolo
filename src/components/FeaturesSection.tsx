
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card'
import { Zap, Shield, Palette, Truck } from 'lucide-react'

const features = [
  {
    Icon: Palette,
    title: 'Premium Quality',
    description: 'High-resolution metal and paper prints that stand out. Perfect color accuracy and vibrant finishes.',
  },
  {
    Icon: Zap,
    title: 'Instant Processing',
    description: 'Solana payments process in seconds. Your orders are printed and shipped immediately.',
  },
  {
    Icon: Shield,
    title: 'Secure & Transparent',
    description: 'Blockchain-verified transactions. Full transparency on costs, production, and shipping.',
  },
  {
    Icon: Truck,
    title: 'Worldwide Shipping',
    description: 'We ship to 150+ countries. Fast, reliable delivery with tracking for every order.',
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 md:py-28 border-t border-border">
      <div className="container max-w-7xl px-4 mx-auto">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
            Why Choose Istolo
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Everything you need to turn your creative vision into reality
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, idx) => (
            <Card key={idx} className="relative">
              <CardHeader>
                <feature.Icon className="w-8 h-8 mb-2 text-primary" />
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
