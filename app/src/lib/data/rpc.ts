import { Connection, PublicKey } from "@solana/web3.js";
import { getMint, TOKEN_PROGRAM_ID, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import type { NormalizedEvent } from "./types";

const rpcUrl = () => process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";

async function inspect(mint: string): Promise<NormalizedEvent | null> {
  try {
    const connection = new Connection(rpcUrl(), "confirmed");
    const key = new PublicKey(mint);
    let info;
    let tokenProgram = TOKEN_PROGRAM_ID;
    try {
      info = await getMint(connection, key, "confirmed", TOKEN_PROGRAM_ID);
    } catch {
      tokenProgram = TOKEN_2022_PROGRAM_ID;
      info = await getMint(connection, key, "confirmed", TOKEN_2022_PROGRAM_ID);
    }

    const mintAuthority = info.mintAuthority?.toBase58() ?? null;
    const freezeAuthority = info.freezeAuthority?.toBase58() ?? null;
    return {
      id: `authority:${mint}`,
      kind: "AUTHORITY",
      source: "solana-rpc",
      timestamp: Date.now(),
      mint,
      metadata: {
        mintAuthority,
        freezeAuthority,
        mintAuthorityRevoked: mintAuthority === null,
        freezeAuthorityRevoked: freezeAuthority === null,
        decimals: info.decimals,
        supply: info.supply.toString(),
        tokenProgram: tokenProgram.toBase58(),
      },
    };
  } catch {
    return null;
  }
}

export async function fetchAuthorityEvents(mints: string[]): Promise<NormalizedEvent[]> {
  if (!(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL)) return [];
  const results = await Promise.all(mints.slice(0, 12).map(inspect));
  return results.filter(Boolean) as NormalizedEvent[];
}

type HolderRow = { owner: string; amount: number; decimals: number; tokenAccount: string };

async function fetchProgramHolders(connection: Connection, mint: PublicKey, programId: PublicKey): Promise<HolderRow[]> {
  const accounts = await connection.getParsedProgramAccounts(programId, {
    commitment: "confirmed",
    filters: [{ memcmp: { offset: 0, bytes: mint.toBase58() } }],
  });
  const rows: HolderRow[] = [];
  for (const item of accounts) {
    const parsed = (item.account.data as any)?.parsed;
    const info = parsed?.info;
    const owner = info?.owner;
    const tokenAmount = info?.tokenAmount;
    const amount = Number(tokenAmount?.uiAmount ?? 0);
    if (owner && Number.isFinite(amount) && amount > 0) rows.push({ owner, amount, decimals: Number(tokenAmount?.decimals ?? 0), tokenAccount: item.pubkey.toBase58() });
  }
  return rows;
}

export async function fetchHolderSnapshot(mint: string): Promise<{
  holderCount: number;
  topHolders: Array<{ owner: string; amount: number; sharePct: number }>;
  totalAmount: number;
  source: "solana-rpc";
  indexedAt: number;
} | null> {
  if (!(process.env.SOLANA_RPC_URL || process.env.NEXT_PUBLIC_SOLANA_RPC_URL || process.env.NEXT_PUBLIC_RPC_URL)) return null;
  try {
    const connection = new Connection(rpcUrl(), "confirmed");
    const key = new PublicKey(mint);
    const [classic, token2022] = await Promise.all([
      fetchProgramHolders(connection, key, TOKEN_PROGRAM_ID),
      fetchProgramHolders(connection, key, TOKEN_2022_PROGRAM_ID),
    ]);
    const byOwner = new Map<string, number>();
    for (const row of [...classic, ...token2022]) byOwner.set(row.owner, (byOwner.get(row.owner) ?? 0) + row.amount);
    const sorted = [...byOwner.entries()].filter(([, amount]) => amount > 0).sort((a,b) => b[1]-a[1]);
    const totalAmount = sorted.reduce((sum, [, amount]) => sum + amount, 0);
    return {
      holderCount: sorted.length,
      totalAmount,
      topHolders: sorted.slice(0, 20).map(([owner, amount]) => ({ owner, amount, sharePct: totalAmount ? (amount / totalAmount) * 100 : 0 })),
      source: "solana-rpc",
      indexedAt: Date.now(),
    };
  } catch {
    return null;
  }
}
