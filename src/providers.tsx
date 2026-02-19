import { SolanaProvider } from '@solana/react-hooks'
import type { PropsWithChildren } from 'react'
import { autoDiscover, createClient } from '@solana/client'

// Create Solana client with devnet endpoint and auto-discover wallets
const client = createClient({
  endpoint: 'https://api.devnet.solana.com',
  walletConnectors: autoDiscover(),
})

export function Providers({ children }: PropsWithChildren) {
  return <SolanaProvider client={client}>{children}</SolanaProvider>
}
