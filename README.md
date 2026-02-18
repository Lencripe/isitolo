# Istolo - On-Demand Printing with Solana Blockchain

A modern, full-featured web application for on-demand printing services (metal prints, paper prints, canvas, and merchandise) powered by the Solana blockchain for fast, transparent payments.

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
VITE_SOLANA_NETWORK=devnet
VITE_RPC_ENDPOINT=https://api.devnet.solana.com
```

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
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
