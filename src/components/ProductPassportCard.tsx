import { Card } from './Card'
import type { ProductPassportCertificate } from '../types/passport'
import { buildPassportExplorerUrl } from '../lib/passport-metadata'

interface ProductPassportCardProps {
  certificate: ProductPassportCertificate
}

export function ProductPassportCard({ certificate }: ProductPassportCardProps) {
  const explorerUrl = buildPassportExplorerUrl(certificate)

  return (
    <Card>
      <div className="p-8">
        <h2 className="text-xl font-bold mb-2">Digital Product Passport</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Certificate issued as NFT-compatible metadata for this purchase.
        </p>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Certificate ID:</span>
            <span className="font-semibold text-right ml-4">{certificate.certificateId}</span>
          </div>
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Status:</span>
            <span className="font-semibold capitalize">{certificate.status}</span>
          </div>
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Product:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.productName}</span>
          </div>
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Batch ID:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.batchId}</span>
          </div>
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Origin:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.countryOfOrigin}</span>
          </div>
          <div className="flex justify-between py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Repairability:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.repairabilityScore}/10</span>
          </div>
          <div className="py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 block mb-2">Materials:</span>
            <span className="font-semibold text-sm">
              {certificate.dpp.materials.join(', ')}
            </span>
          </div>
          <div className="py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 block mb-2">Certifications:</span>
            <span className="font-semibold text-sm">
              {certificate.dpp.certifications.join(', ')}
            </span>
          </div>
          <div className="py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 block mb-2">Metadata URI:</span>
            <span className="font-mono text-xs break-all">{certificate.metadataUri}</span>
          </div>
          <div className="py-2 border-b dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400 block mb-2">Metadata Hash (SHA-256):</span>
            <span className="font-mono text-xs break-all">{certificate.metadataHash}</span>
          </div>

          {certificate.mintAddress ? (
            <div className="py-2 border-b dark:border-gray-700">
              <span className="text-gray-600 dark:text-gray-400 block mb-2">Mint Address:</span>
              <span className="font-mono text-xs break-all">{certificate.mintAddress}</span>
            </div>
          ) : null}
        </div>

        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 text-sm text-purple-600 dark:text-purple-400 hover:underline"
          >
            View Passport Mint on Explorer
          </a>
        ) : null}
      </div>
    </Card>
  )
}
