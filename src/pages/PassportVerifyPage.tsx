import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { hashMetadataJson } from '../lib/passport-metadata'
import { verifyPassportSignature } from '../lib/verification'

interface VerificationState {
  status: 'loading' | 'valid' | 'invalid' | 'unverified' | 'error'
  message: string
  metadataName?: string
  productName?: string
}

export function PassportVerifyPage() {
  const [params] = useSearchParams()
  const [state, setState] = useState<VerificationState>({
    status: 'loading',
    message: 'Checking passport data...',
  })

  const certificateId = params.get('certificateId') || ''
  const metadataHash = params.get('metadataHash') || ''
  const metadataUri = params.get('metadataUri') || ''
  const issuer = params.get('issuer') || undefined
  const signature = params.get('signature') || undefined

  useEffect(() => {
    const verify = async () => {
      if (!certificateId || !metadataHash || !metadataUri) {
        setState({
          status: 'error',
          message: 'Missing verification details. Check the link or QR code.',
        })
        return
      }

      try {
        const response = await fetch(metadataUri)
        if (!response.ok) {
          throw new Error(`Metadata fetch failed: ${response.status}`)
        }

        const metadataJson = await response.text()
        const computedHash = await hashMetadataJson(metadataJson)

        let metadataName: string | undefined
        let productName: string | undefined
        try {
          const parsed = JSON.parse(metadataJson) as {
            name?: string
            properties?: { dpp?: { productName?: string } }
          }
          metadataName = parsed.name
          productName = parsed.properties?.dpp?.productName
        } catch {
          // Ignore parse failures, hash verification is still valid
        }

        if (computedHash !== metadataHash) {
          setState({
            status: 'invalid',
            message: 'Metadata hash mismatch. This passport may be tampered with.',
            metadataName,
            productName,
          })
          return
        }

        const signatureCheck = verifyPassportSignature(
          certificateId,
          metadataHash,
          issuer,
          signature
        )

        if (!signatureCheck.verified) {
          setState({
            status: 'unverified',
            message: 'Metadata matches, but issuer signature is missing or invalid.',
            metadataName,
            productName,
          })
          return
        }

        setState({
          status: 'valid',
          message: 'Passport verified. Metadata hash and issuer signature match.',
          metadataName,
          productName,
        })
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unable to verify this passport right now.'
        setState({
          status: 'error',
          message,
        })
      }
    }

    verify()
  }, [certificateId, metadataHash, metadataUri, issuer, signature])

  const statusColor =
    state.status === 'valid'
      ? 'text-emerald-300'
      : state.status === 'invalid'
        ? 'text-rose-300'
        : state.status === 'unverified'
          ? 'text-amber-300'
          : 'text-muted-foreground'

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <Card>
            <div className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold">Passport Verification</h1>
                <p className={`mt-2 text-sm ${statusColor}`}>{state.message}</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">Certificate ID:</span>
                  <span className="font-semibold text-right ml-4 break-all">{certificateId || '—'}</span>
                </div>
                <div className="flex justify-between border-b border-border py-2">
                  <span className="text-muted-foreground">Metadata Hash:</span>
                  <span className="font-mono text-xs text-right ml-4 break-all">{metadataHash || '—'}</span>
                </div>
                {state.metadataName ? (
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Metadata Name:</span>
                    <span className="font-semibold text-right ml-4 break-all">{state.metadataName}</span>
                  </div>
                ) : null}
                {state.productName ? (
                  <div className="flex justify-between border-b border-border py-2">
                    <span className="text-muted-foreground">Product:</span>
                    <span className="font-semibold text-right ml-4 break-all">{state.productName}</span>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button onClick={() => window.location.reload()} variant="outline">
                  Re-check
                </Button>
                <Button onClick={() => window.history.back()}>Back</Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
