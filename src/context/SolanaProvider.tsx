import { type ReactNode, useMemo } from 'react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import '@solana/wallet-adapter-react-ui/styles.css'

interface SolanaProviderProps {
  children: ReactNode
}

/**
 * Wraps children with Solana connection and wallet providers configured for Devnet.
 *
 * @param children - The React nodes to render inside the Solana providers
 * @returns A React element that provides a ConnectionProvider (Devnet endpoint), a WalletProvider with memoized wallet adapters and `autoConnect`, and a WalletModalProvider around `children`
 */
export function SolanaProvider({ children }: SolanaProviderProps) {
  // Network configuration - set to Devnet for testing
  const network = WalletAdapterNetwork.Devnet
  const endpoint = useMemo(() => clusterApiUrl(network), [network])

  // Wallet adapters - must be memoized to avoid creating new instances on
  // every render, which would cause all connected wallets to be dropped and
  // re-initialised (reconnection loop).
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
    ],
    []
  )

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
