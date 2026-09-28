# Alpha — Build Status

**Updated:** 2026-09-29

## Shipped
- [x] 7 Anchor programs (fee_router, bot_core, dca, grid, shadow, ladder, martingale)
- [x] Live DexScreener market board (trending + filters + verdicts)
- [x] Jupiter buy **and sell** path
- [x] Bot create UI for all 6 strategies
- [x] Smart-money leaders tab (mock → live later)
- [x] Keeper scaffold (slot + SOL price)
- [x] GitHub: https://github.com/spanda6z/alpha-solana-terminal

## Run
```bash
git clone https://github.com/spanda6z/alpha-solana-terminal.git
cd alpha-solana-terminal/app
npm install --legacy-peer-deps
npm run dev
```

## You still do locally
1. `anchor build && anchor deploy --provider.cluster devnet`
2. Copy IDLs into `app/src/idl/` and regenerate clients
3. Wire `buildCreateBotIx` in BotPanel after deploy
4. Keeper keypair + Geyser for bot discovery
5. Mainnet only after audit
