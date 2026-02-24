# Istolo Escrow API (Phase 2 Scaffold)

This service provides the canonical escrow order state machine and admin mutation endpoints.

## Quick Start

1. Install dependencies
   - `cd services/escrow-api`
   - `npm install`
2. Start dev server
   - `npm run dev`
3. Configure frontend
   - Set `VITE_ESCROW_API_BASE_URL=http://localhost:8787` in root `.env.local`

## Environment Variables

- `PORT` (default: `8787`)
- `ESCROW_MERCHANT_WALLET`
- `ESCROW_VAULT_WALLET`
- `ESCROW_RELEASE_TIMEOUT_HOURS` (default: `72`)
- `ESCROW_DISPUTE_WINDOW_HOURS` (default: `168`)

## Notes

- Current storage is in-memory (`Map`) for scaffolding only.
- Replace with Postgres + transaction audit log before production.
- On-chain release/refund execution should be added as a separate worker/client using escrow program instructions.

## Available Endpoints

- `GET /health`
- `POST /escrow/orders`
- `GET /escrow/orders/:orderId`
- `POST /escrow/orders/:orderId/fund`
- `POST /escrow/orders/:orderId/confirm-receipt`
- `POST /escrow/orders/:orderId/dispute`
- `POST /escrow/orders/:orderId/auto-release`
- `POST /escrow/orders/:orderId/admin-refund`
