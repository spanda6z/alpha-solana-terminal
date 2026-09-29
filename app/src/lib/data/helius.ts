import type { NormalizedEvent } from "./types";

type HeliusTx = {
  signature?: string; slot?: number; timestamp?: number; type?: string; description?: string; source?: string;
  nativeTransfers?: Array<{ fromUserAccount?: string; toUserAccount?: string; amount?: number }>;
  tokenTransfers?: Array<{ fromUserAccount?: string; toUserAccount?: string; tokenAmount?: number; mint?: string }>;
};

const API = "https://api.helius.xyz/v0/addresses";

function side(tx: HeliusTx): "BUY" | "SELL" | "UNKNOWN" {
  const d = (tx.description ?? "").toLowerCase();
  if (d.includes("bought") || d.includes("buy")) return "BUY";
  if (d.includes("sold") || d.includes("sell")) return "SELL";
  return "UNKNOWN";
}

function normalize(tx: HeliusTx, address: string): NormalizedEvent | null {
  if (tx.type !== "SWAP" || !tx.signature) return null;
  const transfer = tx.tokenTransfers?.find((t) => t.mint && t.mint !== address) ?? tx.tokenTransfers?.[0];
  return {
    id: `swap:${tx.signature}`, kind: "SWAP", source: "helius",
    timestamp: (tx.timestamp ?? Math.floor(Date.now() / 1000)) * 1000,
    slot: tx.slot, signature: tx.signature, mint: transfer?.mint ?? address,
    wallet: transfer?.fromUserAccount ?? transfer?.toUserAccount,
    actor: transfer?.fromUserAccount ?? transfer?.toUserAccount,
    side: side(tx),
    metadata: {
      description: tx.description ?? "", source: tx.source ?? "unknown",
      tokenAmount: transfer?.tokenAmount ?? 0,
      nativeTransfers: tx.nativeTransfers?.length ?? 0,
    },
  };
}

export async function fetchSwapEvents(mints: string[], perMint = 8): Promise<NormalizedEvent[]> {
  const key = process.env.HELIUS_API_KEY;
  if (!key) return [];
  const responses = await Promise.all(mints.slice(0, 12).map(async (mint) => {
    try {
      const url = `${API}/${encodeURIComponent(mint)}/transactions?api-key=${encodeURIComponent(key)}&limit=${perMint}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return [];
      const data = (await res.json()) as HeliusTx[];
      return data.map((tx) => normalize(tx, mint)).filter(Boolean) as NormalizedEvent[];
    } catch { return []; }
  }));
  const seen = new Set<string>();
  return responses.flat().filter((e) => !seen.has(e.id) && !!seen.add(e.id));
}

export interface WalletIntel {
  wallet: string;
  transactions: number;
  swaps: number;
  buys: number;
  sells: number;
  tokenMints: string[];
  recent: Array<{ signature: string; timestamp: number; type: string; description: string }>;
  indexedAt: number;
}

export async function fetchWalletIntel(wallet: string, limit = 50): Promise<WalletIntel | null> {
  const key = process.env.HELIUS_API_KEY;
  if (!key || !wallet) return null;
  try {
    const url = API + "/" + encodeURIComponent(wallet) + "/transactions?api-key=" + encodeURIComponent(key) + "&limit=" + Math.min(100, Math.max(10, limit));
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as HeliusTx[];
    const swaps = data.filter((tx) => tx.type === "SWAP");
    const mints = new Set<string>();
    for (const tx of swaps) for (const transfer of tx.tokenTransfers ?? []) if (transfer.mint) mints.add(transfer.mint);
    return {
      wallet, transactions: data.length, swaps: swaps.length,
      buys: swaps.filter((tx) => side(tx) === "BUY").length,
      sells: swaps.filter((tx) => side(tx) === "SELL").length,
      tokenMints: [...mints].slice(0, 50), indexedAt: Date.now(),
      recent: data.slice(0, 20).map((tx) => ({ signature: tx.signature ?? "", timestamp: (tx.timestamp ?? 0) * 1000, type: tx.type ?? "UNKNOWN", description: tx.description ?? "" })),
    };
  } catch { return null; }
}