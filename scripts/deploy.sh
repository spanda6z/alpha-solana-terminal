#!/usr/bin/env bash
set -euo pipefail

# Alpha deploy helper
# Usage: ./scripts/deploy.sh [localnet|devnet|mainnet]

CLUSTER="${1:-devnet}"
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"

echo "=== Alpha Deploy → $CLUSTER ==="

case "$CLUSTER" in
  localnet)
    solana config set --url localhost
    ;;
  devnet)
    solana config set --url https://api.devnet.solana.com
    ;;
  mainnet)
    solana config set --url https://api.mainnet-beta.solana.com
    echo "WARNING: You are about to deploy to mainnet. Ctrl+C now if this is a mistake."
    sleep 3
    ;;
  *)
    echo "Unknown cluster: $CLUSTER"
    exit 1
    ;;
esac

echo "Current config:"
solana config get

echo ""
echo "Building…"
anchor build

echo ""
echo "Deploying all programs…"
anchor deploy --provider.cluster "$CLUSTER"

echo ""
echo "Done. Program IDs are in Anchor.toml and target/deploy/"
echo "Verify with: solana program show <PROGRAM_ID>"
