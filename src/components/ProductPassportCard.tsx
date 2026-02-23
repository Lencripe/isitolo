import { Card } from './Card'
import type { ProductPassportCertificate } from '../types/passport'
import { buildPassportExplorerUrl } from '../lib/passport-metadata'
import { buildPassportVerificationUrl, buildQrCodeUrl } from '../lib/verification'

interface ProductPassportCardProps {
  certificate: ProductPassportCertificate
}

export function ProductPassportCard({ certificate }: ProductPassportCardProps) {
  const explorerUrl = buildPassportExplorerUrl(certificate)
  const verificationUrl = buildPassportVerificationUrl(certificate)
  const qrCodeUrl = buildQrCodeUrl(verificationUrl)

  return (
    <Card>
      <div className="p-8">
        <h2 className="text-xl font-bold mb-2">Digital Product Passport</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Certificate issued as NFT-compatible metadata for this purchase.
        </p>

        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Certificate ID:</span>
            <span className="font-semibold text-right ml-4">{certificate.certificateId}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Status:</span>
            <span className="font-semibold capitalize">{certificate.status}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Product:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.productName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Batch ID:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.batchId}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Origin:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.countryOfOrigin}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Repairability:</span>
            <span className="font-semibold text-right ml-4">{certificate.dpp.repairabilityScore}/10</span>
          </div>
          <div className="py-2 border-b border-border">
            <span className="text-muted-foreground block mb-2">Materials:</span>
            <span className="font-semibold text-sm">
              {certificate.dpp.materials.join(', ')}
            </span>
          </div>
          <div className="py-2 border-b border-border">
            <span className="text-muted-foreground block mb-2">Certifications:</span>
            <span className="font-semibold text-sm">
              {certificate.dpp.certifications.join(', ')}
            </span>
          </div>
          <div className="py-2 border-b border-border">
            <span className="text-muted-foreground block mb-2">Metadata URI:</span>
            <span className="font-mono text-xs break-all">{certificate.metadataUri}</span>
          </div>
          <div className="py-2 border-b border-border">
            <span className="text-muted-foreground block mb-2">Metadata Hash (SHA-256):</span>
            <span className="font-mono text-xs break-all">{certificate.metadataHash}</span>
          </div>

          {certificate.verification?.issuerPublicKey ? (
            <div className="py-2 border-b border-border">
              <span className="text-muted-foreground block mb-2">Issuer Public Key:</span>
              <span className="font-mono text-xs break-all">
                {certificate.verification.issuerPublicKey}
              </span>
            </div>
          ) : null}

          {certificate.rewards ? (
            <div className="py-2 border-b border-border">
              <span className="text-muted-foreground block mb-2">Rewards Earned:</span>
              <span className="font-semibold text-sm">
                +{certificate.rewards.pointsEarned} pts (Balance: {certificate.rewards.balanceAfter} pts)
              </span>
            </div>
          ) : null}

          {certificate.mintAddress ? (
            <div className="py-2 border-b border-border">
              <span className="text-muted-foreground block mb-2">Mint Address:</span>
              <span className="font-mono text-xs break-all">{certificate.mintAddress}</span>
            </div>
          ) : null}
        </div>

        {explorerUrl ? (
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-6 text-sm text-primary hover:underline"
          >
            View Passport Mint on Explorer
          </a>
        ) : null}

        <div className="mt-6 rounded-lg border border-border/60 bg-muted/40 p-4">
          <p className="text-sm font-semibold mb-2">Verify this passport</p>
          <div className="flex flex-col items-center gap-3">
            <img src={qrCodeUrl} alt="Passport verification QR" className="h-44 w-44" />
            <a
              href={verificationUrl}
              className="text-xs text-primary break-all hover:underline"
            >
              {verificationUrl}
            </a>
          </div>
        </div>
      </div>
    </Card>
  )
}
