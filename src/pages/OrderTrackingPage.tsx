import { useLocation, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'

export function OrderTrackingPage() {
  const location = useLocation()
  const navigate = useNavigate()
  
  const signature = location.state?.signature as string
  const total = location.state?.total as number

  if (!signature) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">No order found</h2>
          <Button onClick={() => navigate('/shop')}>Go to Shop</Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-4xl font-bold mb-2">Order Confirmed!</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Your payment has been processed successfully
            </p>
          </div>

          <Card>
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-xl font-bold mb-2">Payment Details</h2>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Amount Paid:</span>
                    <span className="font-bold">{total} USDC</span>
                  </div>
                  <div className="flex justify-between py-2 border-b dark:border-gray-700">
                    <span className="text-gray-600 dark:text-gray-400">Network:</span>
                    <span className="font-semibold">Solana Devnet</span>
                  </div>
                  <div className="py-2">
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">
                      Transaction ID:
                    </span>
                    {signature.startsWith('demo_') ? (
                      <span className="font-mono text-sm text-purple-600 dark:text-purple-400 break-all">
                        {signature} (Demo Mode)
                      </span>
                    ) : (
                      <a
                        href={`https://explorer.solana.com/tx/${signature}?cluster=devnet`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-sm text-purple-600 dark:text-purple-400 break-all hover:underline"
                      >
                        {signature}
                      </a>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-800 dark:text-green-200">
                  ✅ Your USDC payment has been confirmed and is now on the blockchain!
                </p>
              </div>

              <div className="flex gap-4">
                <Button onClick={() => navigate('/shop')} className="flex-1">
                  Continue Shopping
                </Button>
                <Button
                  onClick={() => window.open(`https://explorer.solana.com/tx/${signature}?cluster=devnet`, '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  View on Explorer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
