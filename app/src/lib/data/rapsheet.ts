import { getDataLayerSnapshot } from "./index";
import type { NormalizedEvent } from "./types";

export interface RapSheetWallet {
  wallet: string;
  swaps: number;
  buys: number;
  sells: number;
  tokens: number;
  lastSeen: number;
}

export interface RapSheetLaunch {
  mint: string;
  symbol: string;
  name: string;
  createdAt: number;
  pairAddress?: string;
  liquidityUsd?: number;
  dex?: string;
  authority?: string;
  mintAuthorityRevoked?: boolean;
  freezeAuthorityRevoked?: boolean;
}

export interface RapSheetSnapshot {
  wallets: RapSheetWallet[];
  launches: RapSheetLaunch[];
  authorities: NormalizedEvent[];
  generatedAt: number;
  sources: ReturnType<typeof import("./normalize").sourceStatuses>;
}

export async function getRapSheetSnapshot(limit = 80): Promise<RapSheetSnapshot> {
  const snapshot = await getDataLayerSnapshot(Math.min(100, Math.max(40, limit)));
  const wallets = new Map<string, RapSheetWallet>();
  const launches = new Map<string, RapSheetLaunch>();
  const authorities: NormalizedEvent[] = [];

  for (const event of snapshot.events) {
    if (event.kind === "SWAP" && event.wallet) {
      const current = wallets.get(event.wallet) ?? {
        wallet: event.wallet, swaps: 0, buys: 0, sells: 0, tokens: 0, lastSeen: event.timestamp,
      };
      current.swaps += 1;
      if (event.side === "BUY") current.buys += 1;
      if (event.side === "SELL") current.sells += 1;
      current.tokens += event.mint ? 1 : 0;
      current.lastSeen = Math.max(current.lastSeen, event.timestamp);
      wallets.set(event.wallet, current);
    }

    if (event.kind === "NEW_PAIR" && event.mint) {
      const meta = event.metadata ?? {};
      launches.set(event.mint, {
        mint: event.mint,
        symbol: event.symbol ?? "UNKNOWN",
        name: event.name ?? "Unknown token",
        createdAt: event.timestamp,
        pairAddress: event.pairAddress,
        liquidityUsd: event.liquidityUsd,
        dex: typeof meta.dex === "string" ? meta.dex : undefined,
      });
    }

    if (event.kind === "AUTHORITY" && event.mint) {
      authorities.push(event);
      const launch = launches.get(event.mint);
      if (launch) {
        const meta = event.metadata ?? {};
        launch.authority = typeof meta.mintAuthority === "string" ? meta.mintAuthority : undefined;
        launch.mintAuthorityRevoked = meta.mintAuthorityRevoked === true;
        launch.freezeAuthorityRevoked = meta.freezeAuthorityRevoked === true;
      }
    }
  }

  return {
    wallets: [...wallets.values()].sort((a, b) => b.swaps - a.swaps).slice(0, 50),
    launches: [...launches.values()].sort((a, b) => b.createdAt - a.createdAt).slice(0, 50),
    authorities,
    generatedAt: snapshot.generatedAt,
    sources: snapshot.sources,
  };
}
