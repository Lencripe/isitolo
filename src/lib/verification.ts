import nacl from 'tweetnacl'
import { PublicKey } from '@solana/web3.js'
import type { ProductPassportCertificate } from '../types/passport'
import { SOLANA_CONFIG } from '../config/solana'

export interface VerificationResult {
  verified: boolean
  reason?: 'missing_signature' | 'invalid_signature' | 'signature_mismatch'
}

export function buildVerificationMessage(certificateId: string, metadataHash: string): string {
  return `ISTOLO_DPP_V1|${certificateId}|${metadataHash}`
}

export function encodeBase64(bytes: Uint8Array): string {
  let binary = ''
  bytes.forEach((value) => {
    binary += String.fromCharCode(value)
  })
  return btoa(binary)
}

export function decodeBase64(value: string): Uint8Array | null {
  try {
    const binary = atob(value)
    const bytes = new Uint8Array(binary.length)
    for (let index = 0; index < binary.length; index += 1) {
      bytes[index] = binary.charCodeAt(index)
    }
    return bytes
  } catch {
    return null
  }
}

export function verifyPassportSignature(
  certificateId: string,
  metadataHash: string,
  issuerPublicKey?: string,
  issuerSignature?: string
): VerificationResult {
  if (!issuerPublicKey || !issuerSignature) {
    return { verified: false, reason: 'missing_signature' }
  }

  const signatureBytes = decodeBase64(issuerSignature)
  if (!signatureBytes) {
    return { verified: false, reason: 'invalid_signature' }
  }

  const messageBytes = new TextEncoder().encode(
    buildVerificationMessage(certificateId, metadataHash)
  )

  try {
    const publicKeyBytes = new PublicKey(issuerPublicKey).toBytes()
    const verified = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes)
    return verified ? { verified: true } : { verified: false, reason: 'signature_mismatch' }
  } catch {
    return { verified: false, reason: 'invalid_signature' }
  }
}

export function buildPassportVerificationUrl(certificate: ProductPassportCertificate): string {
  const baseUrl = SOLANA_CONFIG.PASSPORT.PUBLIC_APP_URL.replace(/\/+$/, '')
  const params = new URLSearchParams({
    certificateId: certificate.certificateId,
    metadataHash: certificate.metadataHash,
    metadataUri: certificate.metadataUri,
  })

  if (certificate.verification?.issuerPublicKey) {
    params.set('issuer', certificate.verification.issuerPublicKey)
  }

  if (certificate.verification?.issuerSignature) {
    params.set('signature', certificate.verification.issuerSignature)
  }

  return `${baseUrl}/verify?${params.toString()}`
}

export function buildQrCodeUrl(data: string, size = 220): string {
  const encoded = encodeURIComponent(data)
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}`
}
