import { useWalletConnection } from '@solana/react-hooks'
import { useState } from 'react'
import { Button } from './Button'

export function WalletButton() {
  const { connectors, connect, disconnect, wallet, status } = useWalletConnection()
  const [showWallets, setShowWallets] = useState(false)

  const handleConnect = async (connectorId: string) => {
    await connect(connectorId)
    setShowWallets(false)
  }

  const handleDisconnect = async () => {
    await disconnect()
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  const isConnecting = status === 'connecting'
  const isConnected = status === 'connected' && wallet

  if (isConnected && wallet) {
    return (
      <Button
        onClick={handleDisconnect}
        variant="outline"
        size="sm"
      >
        {formatAddress(wallet.account.address.toString())}
      </Button>
    )
  }

  return (
    <div className="relative">
      <Button
        onClick={() => setShowWallets(!showWallets)}
        disabled={isConnecting}
        variant="default"
        size="sm"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </Button>

      {showWallets && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            {connectors.length > 0 ? (
              connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector.id)}
                  className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {connector.name}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No wallets detected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
