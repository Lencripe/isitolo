
import { Header } from '../components/Header'
import { HeroSection } from '../components/HeroSection'
import { FeaturesSection } from '../components/FeaturesSection'
import { ProductsSection } from '../components/ProductsSection'
import { CtaSection } from '../components/CtaSection'
import { Footer } from '../components/Footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ProductsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  )
}
