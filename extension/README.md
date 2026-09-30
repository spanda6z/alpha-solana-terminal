# SOLBIT Chrome Extension

Solana market intelligence on social pages.

## Features

- **Token cards next to CA** — hover a highlighted contract address for price, MC, liq, vol
- **One-click CA copy** — click the highlighted address
- **Open Desk** — jump into SOLBIT terminal for that mint
- **Solana only** — multi-chain (Ink) and trade presets stay in other products; this extension is discovery + CA tooling

## Install (developer mode)

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. **Load unpacked** → select this `extension/` folder
4. Visit x.com — Solana CAs in posts should highlight blue

## Privacy

- Reads page text only to find base58 addresses
- Fetches market data via SOLBIT API / DexScreener
- No wallet keys, no private data stored
