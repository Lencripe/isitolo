# Istolo (Work In Progress👷🏾‍♂️)

Your one-stop shop for creation, verification and distribution of phygitals/goods on the Solana Blockchain

## Features

✨ **Implemented Features**

- **Solana Integration**: USDC payments and wallet connection via Solana Web3.js and `@solana/react-hooks`
- **Shopping Cart**: Persistent cart backed by `localStorage`; add, update, and remove items across sessions
- **Multi-page App**: React Router with animated page transitions powered by Framer Motion
- **Shop Page**: Browse a full product catalog sourced from both home drops and additional shop listings
- **Product Detail Pages**: Individual product pages with image galleries, descriptions, and add-to-cart
- **Checkout Flow**: USDC SPL-token payment at checkout, with real-time balance checks and transaction signing
- **Digital Product Passport (DPP) Minting**: On-chain NFT certificate issued after purchase with full traceability metadata (SKU, batch ID, materials, certifications, recycled content %)
- **DPP Verification Page** (`/verify`): Public URL to cryptographically verify a passport certificate's signature and metadata hash
- **Order Tracking Page**: Post-purchase page showing transaction signature, DPP certificate card, and escrow order status
- **Creator Studio** (`/creator/collections`): Wallet-gated UI to create and manage on-chain NFT product collections with per-item supply caps and royalty settings
- **Escrow Order Management**: Orders held in escrow until buyer confirms receipt; supports auto-release after timeout and dispute flow
- **Rewards System**: Earn points per USDC spent; redeem points for discounts at checkout (10 pts/USDC earned, $0.01/pt redeemed)
- **Drop Mint Stats**: Tracks minted count and remaining supply per collection item, stored in `localStorage` with custom events for live updates
- **Theme Toggle**: Persistent dark/light mode switch stored in `localStorage`
- **DPP Storage Pipeline**: Pluggable storage backend for passport metadata — mock, Arweave, on-chain pointer, or hybrid

🔮 **Future Features**

- **NFC Support**: Read/write DPP certificates to NFC tags for physical product authentication
- **Seller Flow**: Allow users to create and manage their own product listings and sales
- **Privy.io Wallet Infrastructure**: Managed wallet solution for smoother onboarding
- **Arweave Permanent Storage**: Move DPP metadata to Arweave for permanent, decentralised storage
- **Mainnet Deployment**: Graduate from Devnet to mainnet-beta

## Tech Stack

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS 3 with shadcn components and Lucide icons
- **Routing**: React Router v7 with animated page transitions (Framer Motion)
- **Blockchain**: Solana Web3.js with `@solana/wallet-adapter` and `@solana/react-hooks`
- **Wallets Supported**:
  - Phantom
  - Backpack
- **Cryptography**: tweetnacl for ed25519 DPP signature verification
- **Analytics**: Vercel Analytics and Speed Insights

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
├── config/             # App-wide configuration
│   └── solana.ts       # Solana network, wallet, escrow, passport settings
├── context/            # React context providers
│   ├── OrderContext.tsx # Cart / order state
│   └── SolanaProvider.tsx
├── lib/                # Utility & business-logic modules
│   ├── cart.ts               # localStorage cart persistence
│   ├── constants.ts          # Product list and SPL token constants
│   ├── creator-collections.ts # On-chain + local collection management
│   ├── dpp-storage.ts        # Pluggable DPP metadata storage
│   ├── drop-mint-stats.ts    # Per-item mint count tracking
│   ├── escrow.ts             # Escrow order state machine (local + API)
│   ├── escrow-api.ts         # Escrow REST API client
│   ├── home-products.ts      # Featured home-page product catalogue
│   ├── passport-metadata.ts  # DPP metadata builder & SHA-256 hashing
│   ├── passport-mint.ts      # On-chain NFT minting for DPP certificates
│   ├── payment-utils.ts      # USDC amount helpers
│   ├── rewards.ts            # Rewards earn / redeem logic
│   ├── shop-products.ts      # Full shop product catalogue
│   ├── usdc-transfer.ts      # SPL USDC transfer transaction helpers
│   ├── utils.ts              # General utilities (cn, etc.)
│   └── verification.ts       # DPP signature verification & QR-code URL builder
├── pages/              # Page-level components (React Router routes)
│   ├── CheckoutPage.tsx
│   ├── CreatorCollectionPage.tsx
│   ├── LandingPage.tsx
│   ├── OrderTrackingPage.tsx
│   ├── PassportVerifyPage.tsx
│   ├── ProductDetailPage.tsx
│   └── ShopPage.tsx
├── types/              # Shared TypeScript type definitions
│   ├── escrow.ts
│   ├── index.ts
│   └── passport.ts
├── App.tsx             # Root component with routing & animated transitions
├── App.css             # Tailwind entry styles
├── index.css           # Global styles
├── main.tsx            # App entry point
└── providers.tsx       # App-level provider composition
services/
└── escrow-api/         # Phase 2 escrow backend (Node/Express scaffold)
programs/
└── escrow-anchor/      # Phase 2 Anchor Solana program scaffold
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
- Users connect their wallet via the `WalletButton` component using `@solana/react-hooks`
- Supports multiple wallet providers (Phantom, Backpack) through the `SolanaProvider` context

### Configuration
- Network: Devnet (configurable in `src/config/solana.ts`)
- RPC Endpoint: Default Solana Devnet RPC
- Merchant wallet and USDC mint address configured in `src/config/solana.ts`

### Digital Product Passport Storage Modes
Configure the DPP metadata pipeline via `VITE_DPP_STORAGE_MODE`:
- **Local/dev fallback only**: set `VITE_DPP_STORAGE_MODE=mock`
- **Arweave only**: set `VITE_DPP_STORAGE_MODE=arweave` and `VITE_ARWEAVE_UPLOAD_ENDPOINT`
- **On-chain pointer only**: set `VITE_DPP_STORAGE_MODE=onchain` and `VITE_DPP_POINTER_ENDPOINT`
- **Hybrid**: set `VITE_DPP_STORAGE_MODE=hybrid` with both upload and pointer endpoints


## Customization

### Colors & Theming
Edit `tailwind.config.js` to customize colors, typography, and spacing.

### Product Catalogue
Update product data in:
- `src/lib/home-products.ts` — Featured home-page drops
- `src/lib/shop-products.ts` — Full shop catalogue
- `src/components/HeroSection.tsx` — Hero content and CTAs
- `src/components/FeaturesSection.tsx` — "How it works" steps

### Merchant & Network Configuration
All Solana settings (merchant wallet, USDC mint, escrow, passport defaults) are centralised in `src/config/solana.ts`.

### Wallet Configuration
Modify `src/context/SolanaProvider.tsx` to:
- Change network (Mainnet, Testnet, Devnet)
- Add/remove wallet connectors
- Configure provider behaviour

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

# Escrow service (Phase 2)
VITE_ESCROW_API_BASE_URL=          # e.g. http://localhost:8787
VITE_ESCROW_VAULT_WALLET=          # Vault wallet that holds escrow funds
VITE_ESCROW_ADMIN_WALLET=          # Admin authority wallet for dispute resolution
VITE_ESCROW_RELEASE_TIMEOUT_HOURS= # Hours before auto-release (default: 72)
VITE_ESCROW_DISPUTE_WINDOW_HOURS=  # Hours buyer can open a dispute (default: 168)

# Creator Collections on-chain program
VITE_COLLECTIONS_ONCHAIN_ENABLED=true   # Set to `false` to skip on-chain calls
VITE_COLLECTIONS_PROGRAM_ID=           # Deployed program ID (leave blank for local fallback)
VITE_COLLECTIONS_FALLBACK_TO_LOCAL=true # Fall back to localStorage when program ID is blank or on-chain call fails
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

