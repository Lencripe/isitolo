# Istolo 

Your one-stop shop for creation, verification and distribution of phygitals/goods on the Solana Blockchain

## Features

✨ **Core Features**
- **Metal & Paper Prints**: High-quality photo printing on multiple surfaces
- **Solana Integration**: Blockchain-powered payments via Solana wallet
- **Fast Checkout**: Payments process in seconds with Solana
- **Merchandise**: T-shirts, hoodies, and custom apparel
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **Modern UI**: Built with shadcn components and Lucide icons

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 with shadcn components
- **Blockchain**: Solana Web3.js with wallet adapters
- **Wallets Supported**: 
  - Phantom
  - Solflare
  - Torus

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── FeaturesSection.tsx
│   ├── ProductsSection.tsx
│   ├── CtaSection.tsx
│   ├── Footer.tsx
│   └── index.ts
├── pages/              # Page components
│   └── LandingPage.tsx
├── context/            # React context providers
│   └── SolanaProvider.tsx
├── lib/                # Utility functions
│   └── utils.ts
├── App.tsx             # Main app component
├── App.css             # Tailwind styles
├── index.css           # Global styles
└── main.tsx            # Entry point
```

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- A Solana wallet (Phantom, Solflare, or Torus)

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build the project
npm run build

# Preview production build locally
npm run preview
```

## Solana Integration

The application uses Solana on Devnet by default for testing. Key components:

### Wallet Connection
- Users connect their wallet using `WalletMultiButton` from `@solana/wallet-adapter-react-ui`
- Supports multiple wallet providers through the `SolanaProvider` context

### Configuration
- Network: Devnet (configurable in `src/context/SolanaProvider.tsx`)
- RPC Endpoint: Default Solana cluster RPC
- Auto-connect: Enabled for returning users

### Payment Processing
Ready for Solana Pay integration for quick checkouts:
- SPL Token payments
- Direct SOL transfers
- Invoice system support

## Digital Product Passport (DPP) MVP

The checkout flow now issues a digital product passport certificate after a successful payment and displays it on the order tracking page.

### Current MVP Behavior
- Certificate payload includes expanded DPP fields (materials, origin, certifications, repairability, recycled content, and payment reference).
- Metadata is generated as JSON, hashed with SHA-256, and exposed as a URI.
- Certificate is persisted locally for recovery if route state is lost.
- On-chain minting toggle exists in `src/config/solana.ts` under `SOLANA_CONFIG.PASSPORT.ENABLE_ONCHAIN_MINT`.

### NFC (Deferred) Implementation Blueprint

NFC read/write is intentionally deferred for this phase. Use this blueprint for the next phase:

1. **Target platform**
  - Launch support: Android Chromium browsers with Web NFC (`NDEFReader`).
  - Non-supported devices (iOS/desktop): fallback to QR with the same payload URL.

2. **NFC payload format**
  - Prefer a compact URL containing certificate reference:
    - `https://your-app-domain/passport/{certificateId}`
  - Optional advanced payload fields:
    - `mintAddress`, `metadataUri`, `metadataHash`, `version`.

3. **Write flow (initial provisioning)**
  - Mint/issue passport certificate after payment.
  - Operator taps “Write NFC Tag”.
  - Browser prompts NFC permission.
  - Write NDEF text/URL record with the certificate link.
  - Save write timestamp + tag UID hash in backend audit log.

4. **Read flow (verification)**
  - Tap “Scan NFC Tag”.
  - Decode NDEF record and open passport verification route.
  - Validate hash, payment signature, and mint/explorer references.

5. **Files to add in next phase**
  - `src/lib/nfc.ts` for Web NFC wrappers.
  - `src/components/NfcPassportPanel.tsx` for read/write UI.
  - `src/pages/PassportVerifyPage.tsx` for verification rendering.

6. **Security and compliance notes**
  - Never store secrets/private keys on NFC tags.
  - Store references only; fetch full data from trusted endpoint.
  - Version schema and keep immutable audit fields for DPP traceability.

## Customization

### Colors & Theming
Edit `tailwind.config.js` to customize colors, typography, and spacing.

### Product Information
Update product data in:
- `src/components/ProductsSection.tsx` - Product listings
- `src/components/HeroSection.tsx` - Hero content
- `src/components/FeaturesSection.tsx` - Features list

### Wallet Configuration
Modify `src/context/SolanaProvider.tsx` to:
- Change network (Mainnet, Testnet, Devnet)
- Add/remove wallet adapters
- Configure auto-connect behavior

## Environment Variables

Create a `.env` file (optional):

```env
# Solana
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com

# App URL used in generated metadata links
VITE_PUBLIC_APP_URL=https://istolo.store

# DPP storage pipeline: mock | arweave | onchain | hybrid
VITE_DPP_STORAGE_MODE=mock

# If true, storage failures throw and block issuance; if false, fallback is allowed
VITE_DPP_STORAGE_STRICT=false

# Arweave upload API (required for arweave/hybrid mode)
VITE_ARWEAVE_UPLOAD_ENDPOINT=

# Optional on-chain pointer API + target wallet/program address
# Used for onchain/hybrid mode
VITE_DPP_POINTER_ENDPOINT=
VITE_DPP_POINTER_WALLET=
```

### DPP Mode Quick Examples

- **Local/dev fallback only**: set `VITE_DPP_STORAGE_MODE=mock`
- **Arweave only**: set `VITE_DPP_STORAGE_MODE=arweave` and `VITE_ARWEAVE_UPLOAD_ENDPOINT`
- **On-chain pointer only**: set `VITE_DPP_STORAGE_MODE=onchain` and `VITE_DPP_POINTER_ENDPOINT`
- **Hybrid**: set `VITE_DPP_STORAGE_MODE=hybrid` with both upload and pointer endpoints

## Next Steps

1. **Backend Setup**: Create API endpoints for:
   - Product management
   - Order processing
   - Payment verification
   - Shipping integration

2. **Database**: Set up PostgreSQL/MongoDB for:
   - User profiles
   - Order history
   - Product catalog
   - Artwork metadata

3. **Web3 Features**:
   - Program-based payment escrow
   - NFT creation for purchases
   - DAO governance for platform decisions

4. **Smart Contracts**: Develop Solana programs for:
   - Payment processing
   - Order verification
   - NFT minting

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Run ESLint
```

## Phase 2 Escrow Scaffolds

### Escrow API

```bash
cd services/escrow-api
npm install
npm run dev
```

### Anchor Scaffold Path Notes

- Anchor workspace root: `programs/escrow-anchor`
- Anchor config: `programs/escrow-anchor/Anchor.toml`
- Program crate: `programs/escrow-anchor/programs/istolo_escrow`
- Program source entry: `programs/escrow-anchor/programs/istolo_escrow/src/lib.rs`

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Other Platforms
- **Netlify**: Connect GitHub repo, build command: `npm run build`
- **GitHub Pages**: Configure in repository settings
- **AWS Amplify**: Connect repo and configure build settings

## Resources

- [Solana Documentation](https://docs.solana.com)
- [Web3.js API Reference](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

## License

MIT

## Support

For issues and questions:
- GitHub Issues
- Discord Community
- Email: support@istolo.com
