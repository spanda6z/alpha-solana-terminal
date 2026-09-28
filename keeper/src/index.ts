/**
 * Alpha Keeper
 *
 * Watches active bots and executes their cycles when conditions are met.
 * In production this should run as a reliable service (PM2 / systemd / Fly / Railway).
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

async function main() {
  console.log("α Alpha Keeper starting…");
  console.log(`RPC: ${RPC}`);
  console.log(`Poll interval: ${POLL_MS}ms`);

  let keeper: Keypair;
  try {
    keeper = loadKeeper();
    console.log(`Keeper pubkey: ${keeper.publicKey.toBase58()}`);
  } catch (e) {
    console.error("Could not load keeper keypair. Create one with:");
    console.error("  solana-keygen new -o keeper-keypair.json");
    console.error("Then set KEEPER_KEYPAIR=./keeper-keypair.json");
    process.exit(1);
  }

  console.log("Keeper is running. Waiting for bots…");
  console.log("(Wire an indexer or Geyser plugin to discover active bots)");

  setInterval(async () => {
    try {
      process.stdout.write(".");
    } catch (err) {
      console.error("\nKeeper loop error:", err);
    }
  }, POLL_MS);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
