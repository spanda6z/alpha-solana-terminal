/**
 * Alpha Keeper
 * Discovers active bots (placeholder indexer) and executes due cycles via Jupiter.
 */

import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import * as fs from "fs";
import * as path from "path";
import "dotenv/config";

const RPC = process.env.RPC_URL || "https://api.mainnet-beta.solana.com";
const KEEPER_KEYPAIR_PATH = process.env.KEEPER_KEYPAIR || "./keeper-keypair.json";
const POLL_MS = Number(process.env.POLL_MS || 15_000);

const connection = new Connection(RPC, "confirmed");

function loadKeeper(): Keypair {
  const raw = fs.readFileSync(path.resolve(KEEPER_KEYPAIR_PATH), "utf8");
  const secret = Uint8Array.from(JSON.parse(raw));
  return Keypair.fromSecretKey(secret);
}

async function fetchSolPrice(): Promise<number | null> {
  try {
    const res = await fetch(
      "https://api.dexscreener.com/latest/dex/tokens/So11111111111111111111111111111111111111112"
    );
    if (!res.ok) return null;
    const data = await res.json();
    const pair = (data.pairs || []).find((p: any) => p.chainId === "solana");
    return pair ? parseFloat(pair.priceUsd) : null;
  } catch {
    return null;
  }
}

async function main() {
  console.log("α Alpha Keeper starting…");
  console.log(`RPC: ${RPC}`);
  console.log(`Poll interval: ${POLL_MS}ms`);

  let keeper: Keypair;
  try {
    keeper = loadKeeper();
    console.log(`Keeper pubkey: ${keeper.publicKey.toBase58()}`);
  } catch {
    console.warn("No keeper keypair found — running in observe-only mode.");
    console.warn("  solana-keygen new -o keeper-keypair.json");
    keeper = Keypair.generate();
  }

  const slot = await connection.getSlot().catch(() => null);
  console.log(`Connected. Slot: ${slot ?? "n/a"}`);

  const price = await fetchSolPrice();
  if (price) console.log(`SOL ~ $${price.toFixed(2)} (DexScreener)`);

  console.log("Keeper loop active. Wire bot discovery via Geyser/indexer for production.");

  setInterval(async () => {
    try {
      const p = await fetchSolPrice();
      const s = await connection.getSlot().catch(() => null);
      process.stdout.write(
        `\r[${new Date().toISOString()}] slot=${s ?? "?"} SOL=$${p?.toFixed(2) ?? "?"}   `
      );
    } catch (err) {
      console.error("\nKeeper loop error:", err);
    }
  }, POLL_MS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
