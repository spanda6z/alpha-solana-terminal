# Alpha — Solana Trading Terminal

Solana-native version of The Desk (nlyra.xyz/desk).

Non-custodial memecoin trading terminal with live board, security verdicts, one-click Jupiter swaps, limit orders, and a full suite of on-chain bots.

## Live Program IDs (generated)

| Program          | Address                                      |
|------------------|----------------------------------------------|
| fee_router       | `DDAspZPbRaaJKNXPuVtuQLiDEHGyJ3ASMUcMigLNvdxW` |
| bot_core         | `4Ao2LU3FdW2j2wkJAktPLxhAkPAgCpv1hZwnpTRJm9DC` |
| dca_bot          | `Au1TvdD1sS6Tb1HsGebz8KRqMXqBK5N7tkREBWBkUDid` |
| grid_bot         | `GU843f7sYg6oBofypdvbSdFFXhWR7fQucq3DRtbcWy6Z` |
| shadow_bot       | `2qJXqHk8QkRr85FXqStz3g67KvDi2CnVeUkK2v6ZwZ2e` |
| ladder_bot       | `2GZGjRr7SarumQX3n6BeAw3rBsfcrjkwPjJzoRui3fYg` |
| martingale_bot   | `5ERrEkhCCJtVY2USYDBTfYvG4RtZJXxAxnSMHkTGE5m7` |

Keypairs live in `keys/` (gitignored). **Keep them safe.**

## Strategies

| ID | Name           | Description                                      |
|----|----------------|--------------------------------------------------|
| 0  | DCA            | Fixed amount on a time interval                  |
| 1  | Grid           | Classic buy/sell grid across a price range       |
| 2  | Infinity Grid  | Self-centering grid                              |
| 3  | Shadow         | Copy a smart-money wallet                        |
| 4  | Ladder         | Multiple buy rungs below current price           |
| 5  | Martingale     | Double down after dips (high risk)               |

## Architecture

```
User Wallet
    │
    ├─► Market buy/sell ──► Jupiter ──► fee_router (1% + referral)
    │
    ├─► Create Bot ──► bot_core (header + vault PDA)
    │         │
    │         ├─► strategy program (dca / grid / shadow / ladder / martingale)
    │         │
    │         └─► Keeper executes cycles via Jupiter + fee_router
    │
    └─► Withdraw & Close ──► bot_core (full refund)
```

All vaults are non-custodial. Owner can always withdraw even if the frontend or keeper disappears.

## Project layout

```
alpha/
├── programs/           # 7 Anchor programs
├── shared/             # common types & errors
├── keys/               # program keypairs (gitignored)
├── target/deploy/      # Anchor expects keypairs here
├── app/                # Next.js terminal UI
├── keeper/             # Off-chain bot executor
├── scripts/
├── Anchor.toml
├── Cargo.toml
└── README.md
```

## Quick start

### On-chain

```bash
# Install tools
sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force
avm install 0.30.1 && avm use 0.30.1

cd alpha
anchor build
anchor test          # local validator
# or
anchor deploy --provider.cluster devnet
```

### Frontend

```bash
cd app
npm install
npm run dev
# open http://localhost:3000
```

### Keeper

```bash
cd keeper
npm install
solana-keygen new -o keeper-keypair.json
npm run dev
```

## Safety

- Programs are designed to be **immutable** after deploy (no upgrade authority recommended).
- Always verify the program IDs on-chain before sending funds.
- Real Jupiter CPI + full inventory accounting still need completion in the strategy execute instructions.
- Get a professional audit before any significant TVL.

## License

MIT
