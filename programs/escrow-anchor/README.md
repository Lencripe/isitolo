# Istolo Escrow Anchor Scaffold

This directory contains the Phase 2 Anchor scaffold for the Istolo escrow program.

## Paths

- Anchor workspace root: `programs/escrow-anchor`
- Program crate: `programs/escrow-anchor/programs/istolo_escrow`
- Program source: `programs/escrow-anchor/programs/istolo_escrow/src/lib.rs`

## Notes

- Current program exposes a minimal `initialize` instruction and `EscrowConfig` account.
- Program id is scaffold-only and should be replaced for deployed environments.
- Expand this scaffold with escrow instructions (`create`, `fund`, `release`, `refund`, `dispute`) in the next phase.
