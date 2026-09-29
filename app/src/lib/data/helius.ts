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
