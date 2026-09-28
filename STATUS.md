# Alpha — Build Status

**Date:** 2026-09-28  
**Goal:** Full Solana-native clone of The Desk (nlyra.xyz/desk)

## Completed

### On-chain (Anchor)
- [x] fee_router — fee collection + referral split + pause/authority
- [x] bot_core — shared bot header + non-custodial vault + deposit/withdraw/close
- [x] dca_bot
- [x] grid_bot (classic + infinity)
- [x] shadow_bot (copy trading)
- [x] ladder_bot
- [x] martingale_bot
- [x] shared types, errors, constants
- [x] Real program keypairs generated and wired into Anchor.toml + declare_id!
- [x] Keypairs copied to target/deploy/ (gitignored)

### Frontend (Next.js)
- [x] Dark terminal layout matching Desk aesthetic
- [x] Market board with filters and mock data
- [x] Token detail panel with live Jupiter swap (buy path)
- [x] Bot strategy gallery
- [x] Wallet adapter (Phantom + Solflare)
- [x] useSwap hook + Jupiter quote/swap helpers
- [x] Instruction builder stubs

### Infrastructure
- [x] Keeper service skeleton (Node.js)
- [x] Deploy script
- [x] IDL copy script
- [x] .env.example
- [x] Comprehensive README

## Remaining (to reach production)

1. **Anchor build** — run on a machine with working cargo mirrors:
   ```bash
   avm install 0.30.1 && avm use 0.30.1
   anchor build
   ```
2. Replace placeholder instruction discriminators with real IDL-generated clients.
3. Wire full Jupiter CPI (or keep hybrid: keeper does the swap, then calls strategy `execute` ix).
4. Real token data layer (Helius DAS + Birdeye or custom Geyser indexer).
5. Keeper: discover active bots + execute cycles end-to-end.
6. Sell path + balance checks in the UI.
7. Professional audit.
8. Mainnet deploy + fee treasury setup.

## Program IDs (already generated)

```
fee_router:     DDAspZPbRaaJKNXPuVtuQLiDEHGyJ3ASMUcMigLNvdxW
bot_core:       4Ao2LU3FdW2j2wkJAktPLxhAkPAgCpv1hZwnpTRJm9DC
dca_bot:        Au1TvdD1sS6Tb1HsGebz8KRqMXqBK5N7tkREBWBkUDid
grid_bot:       GU843f7sYg6oBofypdvbSdFFXhWR7fQucq3DRtbcWy6Z
shadow_bot:     2qJXqHk8QkRr85FXqStz3g67KvDi2CnVeUkK2v6ZwZ2e
ladder_bot:     2GZGjRr7SarumQX3n6BeAw3rBsfcrjkwPjJzoRui3fYg
martingale_bot: 5ERrEkhCCJtVY2USYDBTfYvG4RtZJXxAxnSMHkTGE5m7
```

This is the complete foundation. The remaining work is integration, data, and hardening — not architecture.
