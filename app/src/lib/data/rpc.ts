import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type { NormalizedEvent } from "./types";

const rpcUrl = () => process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

async function inspect(mint: string): Promise<NormalizedEvent | null> {
  try {
    const connection = new Connection(rpcUrl(), "confirmed");
    const key = new PublicKey(mint);
    let info;
    try { info = await getMint(connection, key, "confirmed", TOKEN_PROGRAM_ID); }
    catch { info = await getMint(connection, key, "confirmed", TOKEN_2022_PROGRAM_ID); }

    const mintAuthority = info.mintAuthority?.toBase58() ?? null;
    const freezeAuthority = info.freezeAuthority?.toBase58() ?? null;
    return {
      id: `authority:${mint}`, kind: "AUTHORITY", source: "solana-rpc",
      timestamp: Date.now(), mint,
      metadata: {
        mintAuthority, freezeAuthority,
        mintAuthorityRevoked: mintAuthority === null,
        freezeAuthorityRevoked: freezeAuthority === null,
        decimals: info.decimals, supply: info.supply.toString(),
        tokenProgram: info.programId.toBase58(),
      },
    };
  } catch { return null; }
}

export async function fetchAuthorityEvents(mints: string[]): Promise<NormalizedEvent[]> {
  if (!(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL)) return [];
  const results = await Promise.all(mints.slice(0, 12).map(inspect));
  return results.filter(Boolean) as NormalizedEvent[];
}
