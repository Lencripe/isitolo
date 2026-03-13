# Istolo (Work In Progress👷🏾‍♂️)

Your one-stop shop for creation, verification and distribution of phygitals/goods on the Solana Blockchain

## Features

✨ **Implemented Features**

- **Solana Integration**: Payments and wallet connection with Solana Web3.js
- **USDC Payments**: Accept USDC at checkout via SPL token transfers
- **Shopping Cart**: Persistent cart with localStorage, quantity management and checkout flow
- **Digital Product Passport (DPP)**: Issue digital certificates with detailed metadata (materials, certifications, repairability score, country of origin) stored via configurable pipeline (mock, Arweave, on-chain pointer, or hybrid)
- **NFT Minting**: Mint DPP certificates as on-chain NFTs using Metaplex token metadata; supports direct mint and Candy Machine strategies
- **Passport Verification**: Cryptographic signature verification of DPP certificates with QR code generation for easy sharing
- **Merch Drop / Creator Collections**: Creators can list items as NFT collections; supports on-chain storage via an Anchor program with local fallback
- **Rewards / Loyalty Points**: Earn points per USDC spent and redeem them for discounts at checkout
- **Escrow Payment Protection**: Orders are held in escrow with configurable auto-release timeout, buyer confirmation, dispute opening, and admin refund flows
- **Dark / Light Mode**: Theme toggle with system preference support

🔮 **Future Features**

- **NFC Support**: Read/write DPP certificates to NFC tags for physical product authentication
- **Seller flow**: Allow users to create and manage their own product listings and sales
- **Setup privy.io**: Use this to manage wallet infrastructure

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 with shadcn components
- **Blockchain**: Solana Web3.js with wallet adapters
- **NFT Metadata**: Metaplex Token Metadata program
- **Wallets Supported**: 
  - Phantom
  - Backpack
  - Solflare
- **UI**: Built with shadcn components and Lucide icons
  
## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── CartSummary.tsx
│   ├── CheckoutForm.tsx
│   ├── CtaSection.tsx
│   ├── FeaturesSection.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── HeroSection.tsx
│   ├── OrderDetails.tsx
│   ├── ProductPassportCard.tsx
│   ├── ProductShowcase.tsx
│   ├── ProductsSection.tsx
│   ├── ThemeToggle.tsx
│   ├── WalletButton.tsx
│   └── index.ts
├── config/             # App configuration
│   └── solana.ts
├── context/            # React context providers
│   ├── OrderContext.tsx
│   └── SolanaProvider.tsx
├── lib/                # Utility functions & business logic
│   ├── cart.ts
│   ├── constants.ts
│   ├── creator-collections.ts
│   ├── dpp-storage.ts
│   ├── drop-mint-stats.ts
│   ├── escrow-api.ts
│   ├── escrow.ts
│   ├── home-products.ts
│   ├── passport-metadata.ts
│   ├── passport-mint.ts
│   ├── payment-utils.ts
│   ├── rewards.ts
│   ├── shop-products.ts
│   ├── usdc-transfer.ts
│   ├── utils.ts
│   └── verification.ts
├── pages/              # Page components
│   └── LandingPage.tsx
├── types/              # TypeScript type definitions
│   ├── escrow.ts
│   ├── index.ts
│   └── passport.ts
├── App.tsx             # Main app component
├── App.css             # Tailwind styles
├── index.css           # Global styles
├── main.tsx            # Entry point
└── providers.tsx       # Global providers wrapper
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

### Digital Product Passport Mode Quick Examples
This is still currently a work in progress, but you can configure the DPP storage pipeline with different modes:
- **Local/dev fallback only**: set `VITE_DPP_STORAGE_MODE=mock`
- **Arweave only**: set `VITE_DPP_STORAGE_MODE=arweave` and `VITE_ARWEAVE_UPLOAD_ENDPOINT`
- **On-chain pointer only**: set `VITE_DPP_STORAGE_MODE=onchain` and `VITE_DPP_POINTER_ENDPOINT`
- **Hybrid**: set `VITE_DPP_STORAGE_MODE=hybrid` with both upload and pointer endpoints


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

# Escrow
VITE_ESCROW_API_BASE_URL=
VITE_ESCROW_VAULT_WALLET=
VITE_ESCROW_ADMIN_WALLET=
VITE_ESCROW_RELEASE_TIMEOUT_HOURS=72
VITE_ESCROW_DISPUTE_WINDOW_HOURS=168

# Creator Collections on-chain program (optional)
VITE_COLLECTIONS_PROGRAM_ID=
VITE_COLLECTIONS_ONCHAIN_ENABLED=true
VITE_COLLECTIONS_FALLBACK_TO_LOCAL=true
```




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
  