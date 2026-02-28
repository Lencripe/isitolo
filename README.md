# Istolo (Working In Progress👷🏾‍♂️)

Your one-stop shop for creation, verification and distribution of phygitals/goods on the Solana Blockchain

## Features

✨ **Implemented Features**

- **Solana Integration**: Payments and wallet connection with Solana Web3.js 
-**Minting DPP certificates**: Generate digital product passports with detailed metadata(which will be stored on arweave soon) after purchase.
-**Merch Drop**: Allows creators to list items as NFT collections
-**Setup privy.io**:Use this to manage wallet infrastucture.


🔮 **Future Features**
- **Digital Product Passport (DPP)**: Issue digital certificates with product details and payment proof stored on arweave or on-chain.
- **NFC Support**: Read/write DPP certificates to NFC tags for physical product authentication
- **Seller flow**: Allow users to create and manage their own product listings and sales.
- 
## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 with shadcn components
- **Blockchain**: Solana Web3.js with wallet adapters
- **Wallets Supported**: 
  - Phantom
  - Backpack
- **UI**:Built with shadcn components and Lucide icons
  
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
- A Solana wallet (Phantom, Solflare, or Backpack) for testing payments and minting

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

### Digital Product Passport Mode Quick Examples
This is still currently a work in progress, but you can configure the DPP storage pipeline with different modes:
- **Local/dev fallback only**: set `VITE_DPP_STORAGE_MODE=mock`
- **Arweave only**: set `VITE_DPP_STORAGE_MODE=arweave` and `VITE_ARWEAVE_UPLOAD_ENDPOINT`
- **On-chain pointer only**: set `VITE_DPP_STORAGE_MODE=onchain` and `VITE_DPP_POINTER_ENDPOINT`
- **Hybrid**: set `VITE_DPP_STORAGE_MODE=hybrid` with both upload and pointer endpoints



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


## Resources

- [Solana Documentation](https://docs.solana.com)
- [Web3.js API Reference](https://solana-labs.github.io/solana-web3.js/)
- [Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Tailwind CSS](https://tailwindcss.com)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [Solana Skill](https://solana.com/SKILL.md)

