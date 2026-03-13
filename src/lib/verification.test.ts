// @vitest-environment node
import { Keypair } from '@solana/web3.js'
import nacl from 'tweetnacl'
import { describe, expect, it } from 'vitest'

import {
  buildPassportVerificationUrl,
  buildQrCodeUrl,
  buildVerificationMessage,
  decodeBase64,
  encodeBase64,
  verifyPassportSignature,
} from './verification'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function generateKeypair() {
  // Use @solana/web3.js Keypair for correct Ed25519 key generation and base58
  // encoding — avoids writing a custom base58 encoder in tests.
  return Keypair.generate()
}

function signMessage(message: string, keypair: ReturnType<typeof Keypair.generate>): string {
  // Use Buffer (Node.js native Uint8Array subclass) to avoid jsdom realm mismatch.
  const msgBytes = new Uint8Array(Buffer.from(message, 'utf-8'))
  const sig = nacl.sign.detached(msgBytes, new Uint8Array(keypair.secretKey))
  return encodeBase64(sig)
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('buildVerificationMessage', () => {
  it('produces a deterministic pipe-delimited string', () => {
    const msg = buildVerificationMessage('cert-1', 'hash-abc')
    expect(msg).toBe('ISTOLO_DPP_V1|cert-1|hash-abc')
  })
})

describe('encodeBase64 / decodeBase64', () => {
  it('encodes and decodes a round-trip correctly', () => {
    const original = new Uint8Array([1, 2, 3, 200, 255])
    const encoded = encodeBase64(original)
    const decoded = decodeBase64(encoded)

    expect(decoded).toEqual(original)
  })

  it('returns null for invalid base64', () => {
    expect(decodeBase64('!!!not-base64!!!')).toBeNull()
  })
})

describe('verifyPassportSignature', () => {
  it('returns missing_signature when fields are absent', () => {
    const result = verifyPassportSignature('cert-1', 'hash-1')

    expect(result.verified).toBe(false)
    expect(result.reason).toBe('missing_signature')
  })

  it('returns invalid_signature when base64 is malformed', () => {
    const result = verifyPassportSignature('cert-1', 'hash-1', 'FciDCLGLaCDaFfYyf3jwH4hRbkNQsF1HrroNUVuR2EEH', '!!!bad!!!')

    expect(result.verified).toBe(false)
    expect(result.reason).toBe('invalid_signature')
  })

  it('returns invalid_signature when the public key is invalid', () => {
    // A valid base64 string that is not a valid signature for this public key
    const fakeSig = encodeBase64(new Uint8Array(64).fill(0))
    const result = verifyPassportSignature('cert-1', 'hash-1', 'not-a-valid-pubkey', fakeSig)

    expect(result.verified).toBe(false)
    expect(result.reason).toBe('invalid_signature')
  })

  it('verifies a correctly-signed certificate', () => {
    const keypair = generateKeypair()
    const certId = 'cert-valid-1'
    const metaHash = 'sha256-abc123'
    const message = buildVerificationMessage(certId, metaHash)
    const signature = signMessage(message, keypair)
    const publicKeyB58 = keypair.publicKey.toBase58()

    const result = verifyPassportSignature(certId, metaHash, publicKeyB58, signature)

    expect(result.verified).toBe(true)
    expect(result.reason).toBeUndefined()
  })

  it('rejects a signature for a different message', () => {
    const keypair = generateKeypair()
    const signature = signMessage('some-other-message', keypair)
    const publicKeyB58 = keypair.publicKey.toBase58()

    const result = verifyPassportSignature('cert-1', 'hash-1', publicKeyB58, signature)

    expect(result.verified).toBe(false)
    expect(result.reason).toBe('signature_mismatch')
  })
})

describe('buildPassportVerificationUrl', () => {
  it('includes core certificate fields as query params', () => {
    const cert = makeCert()
    const url = buildPassportVerificationUrl(cert)

    const params = new URLSearchParams(url.split('?')[1])

    expect(params.get('certificateId')).toBe(cert.certificateId)
    expect(params.get('metadataHash')).toBe(cert.metadataHash)
    expect(params.get('metadataUri')).toBe(cert.metadataUri)
  })

  it('appends issuer and signature when present', () => {
    const cert = makeCert({
      verification: { issuerPublicKey: 'pub-key', issuerSignature: 'sig-value' },
    })
    const url = buildPassportVerificationUrl(cert)
    const params = new URLSearchParams(url.split('?')[1])

    expect(params.get('issuer')).toBe('pub-key')
    expect(params.get('signature')).toBe('sig-value')
  })
})

describe('buildQrCodeUrl', () => {
  it('returns a URL pointing to the QR service with the encoded data', () => {
    const url = buildQrCodeUrl('hello world', 300)

    expect(url).toContain('api.qrserver.com')
    expect(url).toContain('300x300')
    expect(url).toContain(encodeURIComponent('hello world'))
  })
})

// ---------------------------------------------------------------------------
// Local helpers
// ---------------------------------------------------------------------------

type CertOverride = Partial<import('../types/passport').ProductPassportCertificate>

function makeCert(override: CertOverride = {}): import('../types/passport').ProductPassportCertificate {
  return {
    certificateId: 'cert-test',
    status: 'issued',
    ownerAddress: 'owner-addr',
    metadataUri: 'https://arweave.net/test',
    metadataHash: 'hash-test',
    paymentSignature: 'sig-pay',
    network: 'devnet',
    issuedAt: '2026-01-01T00:00:00Z',
    issuanceMethod: 'direct',
    dppStorage: {
      mode: 'mock',
      metadataUri: 'https://arweave.net/test',
      metadataHash: 'hash-test',
    },
    dpp: {
      schemaVersion: '1.0.0',
      productId: 'prod-1',
      productName: 'Istolo Tee',
      sku: 'SKU-001',
      batchId: 'batch-1',
      manufacturerName: 'Istolo Printing',
      countryOfOrigin: 'EU',
      materials: [],
      certifications: [],
      repairabilityScore: 8,
      recycledContentPercent: 35,
      productionDate: '2026-01-01',
      paymentSignature: 'sig-pay',
      issuedAt: '2026-01-01T00:00:00Z',
    },
    ...override,
  }
}
