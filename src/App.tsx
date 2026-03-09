import { AnimatePresence, motion } from 'framer-motion'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { LandingPage } from './pages/LandingPage'
import { ShopPage } from './pages/ShopPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderTrackingPage } from './pages/OrderTrackingPage'
import { CreatorCollectionPage } from './pages/CreatorCollectionPage'
import { PassportVerifyPage } from './pages/PassportVerifyPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { Header } from './components/Header'

function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.26, ease: 'easeOut' }}
      >
        <Routes location={location}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/products/:slug" element={<ProductDetailPage />} />
          <Route path="/creator/collections" element={<CreatorCollectionPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order-tracking" element={<OrderTrackingPage />} />
          <Route path="/verify" element={<PassportVerifyPage />} />
        </Routes>
      </motion.main>
    </AnimatePresence>
  )
}

function App() {
  return (
    <Router>
      <Header />
      <AnimatedRoutes />
      <Analytics />
      <SpeedInsights />
    </Router>
  )
}

export default App
