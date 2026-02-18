import { SolanaProvider } from './context/SolanaProvider'
import { LandingPage } from './pages/LandingPage'

function App() {
  return (
    <SolanaProvider>
      <LandingPage />
    </SolanaProvider>
  )
}

export default App
