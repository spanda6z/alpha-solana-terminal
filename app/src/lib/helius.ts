/**
 * Helius helpers — RPC + DAS
 * Env: HELIUS_API_KEY
 * Docs: https://docs.helius.dev
 */

function apiKey() {
  return process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY || "";
}

function rpcUrl() {
  const k = apiKey();
  return k
    ? `https://mainnet.helius-rpc.com/?api-key=${k}`
    : "https://api.mainnet-beta.solana.com";
}

export function hasHelius() {
  return Boolean(apiKey());
}

async function rpc(method: string, params: unknown[]) {
  const res = await fetch(rpcUrl(), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
  });
  if (!res.ok) throw new Error(`Helius RPC ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

export type HolderRow = {
  address: string;
  amount: number;
  pct: number;
  tag?: "LP" | "WHALE" | "CONTRACT" | null;
};

export async function getTopHolders(mint: string, limit = 20): Promise<HolderRow[]> {
  const result = await rpc("getTokenLargestAccounts", [mint]);
  const accounts: { address: string; uiAmount: number; amount: string }[] =
    result?.value || [];
  const total = accounts.reduce((s, a) => s + (a.uiAmount || 0), 0) || 1;
  return accounts.slice(0, limit).map((a) => {
    const pct = ((a.uiAmount || 0) / total) * 100;
    let tag: HolderRow["tag"] = null;
    if (pct >= 5) tag = "WHALE";
    return {
      address: a.address,
      amount: a.uiAmount || 0,
      pct,
      tag,
    };
  });
}

export type ParsedSwap = {
  signature: string;
  side: "buy" | "sell" | "unknown";
  usd?: number;
  amount?: number;
  wallet?: string;
  ageSec: number;
  slot?: number;
};

export async function getEnhancedTransactions(
  address: string,
  limit = 40
): Promise<ParsedSwap[]> {
  const k = apiKey();
  if (!k) return [];
  const url = `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${k}&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return [];
  const txs = await res.json();
  if (!Array.isArray(txs)) return [];
  const now = Math.floor(Date.now() / 1000);
  const out: ParsedSwap[] = [];
  for (const tx of txs) {
    if (tx.transactionError) continue;
    const t = tx.timestamp || now;
    const ageSec = Math.max(0, now - t);
    const transfers = tx.tokenTransfers || [];
    let side: "buy" | "sell" | "unknown" = "unknown";
    let amount = 0;
    let wallet = tx.feePayer as string | undefined;
    if (transfers.length) {
      const tr = transfers[0];
      amount = tr.tokenAmount || 0;
      wallet = tr.fromUserAccount || tr.toUserAccount || wallet;
    }
    out.push({
      signature: tx.signature,
      side,
      amount,
      wallet,
      ageSec,
      slot: tx.slot,
    });
  }
  return out;
}

export async function getMintSwaps(mint: string, limit = 40): Promise<ParsedSwap[]> {
  const k = apiKey();
  if (!k) return [];
  const url = `https://api.helius.xyz/v0/addresses/${mint}/transactions?api-key=${k}&limit=${limit}&type=SWAP`;
  const res = await fetch(url);
  if (!res.ok) {
    return getEnhancedTransactions(mint, limit);
  }
  const txs = await res.json();
  if (!Array.isArray(txs)) return [];
  const now = Math.floor(Date.now() / 1000);
  const out: ParsedSwap[] = [];
  for (const tx of txs) {
    if (tx.transactionError) continue;
    const t = tx.timestamp || now;
    const ageSec = Math.max(0, now - t);
    const events = tx.events?.swap;
    let side: "buy" | "sell" | "unknown" = "unknown";
    let usd: number | undefined;
    let amount: number | undefined;
    const wallet = tx.feePayer as string | undefined;
    if (events) {
      const nativeIn = events.nativeInput?.amount || 0;
      const nativeOut = events.nativeOutput?.amount || 0;
      if (nativeIn > 0) side = "buy";
      else if (nativeOut > 0) side = "sell";
    }
    for (const tr of tx.tokenTransfers || []) {
      if (tr.mint !== mint) continue;
      amount = tr.tokenAmount;
      if (tr.fromUserAccount === wallet) side = side === "unknown" ? "sell" : side;
      if (tr.toUserAccount === wallet) side = side === "unknown" ? "buy" : side;
    }
    out.push({
      signature: tx.signature,
      side,
      usd,
      amount,
      wallet,
      ageSec,
      slot: tx.slot,
    });
  }
  return out;
}
