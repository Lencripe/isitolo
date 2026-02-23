import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { LandingPage } from './pages/LandingPage'
import { ShopPage } from './pages/ShopPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderTrackingPage } from './pages/OrderTrackingPage'
import { CreatorCollectionPage } from './pages/CreatorCollectionPage'
import { PassportVerifyPage } from './pages/PassportVerifyPage'
import { Header } from './components/Header'

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/creator/collections" element={<CreatorCollectionPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-tracking" element={<OrderTrackingPage />} />
        <Route path="/verify" element={<PassportVerifyPage />} />
      </Routes>
    </Router>
  )
}

export default App
