# Deploy Alpha programs (phone OK via Codespaces)

## 1. Open Codespace (from phone browser)

1. Go to https://github.com/spanda6z/alpha-solana-terminal
2. Tap **Code** → **Codespaces** → **Create codespace on main**
3. Wait 2–5 min for the environment

## 2. In the Codespace terminal, paste:

```bash
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

# Install Solana (if needed)
sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.26/install)"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

# Install Anchor
cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked --force
anchor --version

# Wallet + devnet SOL
solana config set --url devnet
solana-keygen new --no-bip39-passphrase -o ~/.config/solana/id.json --force
solana airdrop 2
solana balance

# Build + deploy
anchor build
anchor deploy --provider.cluster devnet

# Print program IDs
solana address -k target/deploy/fee_router-keypair.json
solana address -k target/deploy/bot_core-keypair.json
solana address -k target/deploy/dca_bot-keypair.json
solana address -k target/deploy/grid_bot-keypair.json
solana address -k target/deploy/shadow_bot-keypair.json
solana address -k target/deploy/ladder_bot-keypair.json
solana address -k target/deploy/martingale_bot-keypair.json
```

## 3. Copy the 7 addresses

Send them in chat. We will wire them into the live UI.

## Notes

- Airdrop can fail on busy devnet — retry `solana airdrop 2` or use https://faucet.solana.com
- Keypairs in `keys/` are already generated; Anchor.toml has matching program IDs
- Do **not** commit funded keypairs to public repos
