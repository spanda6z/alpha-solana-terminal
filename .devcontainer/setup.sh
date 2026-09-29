#!/usr/bin/env bash
set -e
export PATH="$HOME/.local/share/solana/install/active_release/bin:$HOME/.cargo/bin:$PATH"

if ! command -v solana &>/dev/null; then
  sh -c "$(curl -sSfL https://release.anza.xyz/v1.18.26/install)"
fi
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 avm --locked --force || true
avm install 0.30.1 || true
avm use 0.30.1 || true

solana config set --url devnet
if [ ! -f ~/.config/solana/id.json ]; then
  solana-keygen new --no-bip39-passphrase -o ~/.config/solana/id.json
fi

echo "=== setup done ==="
solana --version
anchor --version || echo "Install: cargo install --git https://github.com/coral-xyz/anchor --tag v0.30.1 anchor-cli --locked"
