import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { SolanaProvider } from './context/SolanaProvider'
import { OrderProvider } from './context/OrderContext'
import { LandingPage } from './pages/LandingPage'
import { ShopPage } from './pages/ShopPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { OrderTrackingPage } from './pages/OrderTrackingPage'

function App() {
  return (
    <Router>
      <SolanaProvider>
        <OrderProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order/:orderId" element={<OrderTrackingPage />} />
          </Routes>
        </OrderProvider>
      </SolanaProvider>
    </Router>
  )
}

export default App
