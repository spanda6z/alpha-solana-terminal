import { NextResponse } from "next/server";
import { getDataLayerSnapshot } from "@/lib/data";
import { fetchHolderSnapshot } from "@/lib/data/rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mint = searchParams.get("mint");

  if (!mint) {
    return NextResponse.json({ error: "mint is required" }, { status: 400 });
  }

  const snapshot = await getDataLayerSnapshot(100);
  const events = snapshot.events.filter((event) => event.mint === mint);
  const holders = await fetchHolderSnapshot(mint);

  const walletMap = new Map<string, {
    wallet: string;
    swaps: number;
    buys: number;
    sells: number;
    lastSeen: number;
  }>();

  for (const event of events) {
    if (event.kind !== "SWAP" || !event.wallet) continue;
    const current = walletMap.get(event.wallet) ?? {
      wallet: event.wallet,
      swaps: 0,
      buys: 0,
      sells: 0,
      lastSeen: event.timestamp,
    };
    current.swaps += 1;
    if (event.side === "BUY") current.buys += 1;
    if (event.side === "SELL") current.sells += 1;
    current.lastSeen = Math.max(current.lastSeen, event.timestamp);
    walletMap.set(event.wallet, current);
  }

  const authority = events.find((event) => event.kind === "AUTHORITY");
  const pair = events.find((event) => event.kind === "NEW_PAIR");
  const swaps = events.filter((event) => event.kind === "SWAP");

  return NextResponse.json({
    mint,
    events,
    pair: pair ?? null,
    authority: authority ?? null,
    swaps: {
      count: swaps.length,
      buys: swaps.filter((event) => event.side === "BUY").length,
      sells: swaps.filter((event) => event.side === "SELL").length,
    },
    wallets: [...walletMap.values()]
      .sort((a, b) => b.swaps - a.swaps)
      .slice(0, 50),
    holders,
    sources: snapshot.sources,
    generatedAt: Date.now(),
  }, {
    headers: { "Cache-Control": "no-store" },
  });
}
