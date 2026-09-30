"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Star } from "lucide-react";
import {
  fetchMarketTokens,
  type MarketMode,
  type TokenRow,
} from "@/lib/tokens";
import type { SelectedToken, MarketCategory, Verdict } from "./types";

function toVerdict(risk: string): Verdict {
  if (risk === "LOW") return "SAFE";
  if (risk === "MED") return "CAUTION";
  if (risk === "HIGH") return "DANGER";
  return "UNKNOWN";
}

const verdictCls: Record<Verdict, string> = {
  SAFE: "text-[#34d399]",
  CAUTION: "text-[#fbbf24]",
  DANGER: "text-[#f87171]",
  "BLUE CHIP": "text-[#60a5fa]",
  UNKNOWN: "text-[#5e5e70]",
};

const QUICK_SOL = 0.1;

const CATEGORIES: { id: MarketCategory; label: string; mode?: MarketMode }[] = [
  { id: "trending", label: "TRENDING", mode: "trending" },
  { id: "new", label: "NEW PAIRS", mode: "new" },
  { id: "gainers", label: "GAINERS", mode: "gainers" },
  { id: "losers", label: "LOSERS", mode: "losers" },
  { id: "volume", label: "HIGH VOLUME", mode: "volume" },
  { id: "liquidity", label: "HIGH LIQ", mode: "liquidity" },
  { id: "unusual", label: "UNUSUAL" },
  { id: "whale", label: "WHALE" },
  { id: "watched", label: "WATCHED" },
];

function rowToSelected(t: TokenRow & { verdict?: Verdict }): SelectedToken {
  return {
    mint: t.mint,
    pairAddress: t.pairAddress,
    symbol: t.symbol,
    name: t.name,
    verdict: t.verdict || toVerdict(t.risk),
    price: t.price,
    change24h: t.change24h,
    mcap: t.mcap,
    liq: t.liq,
    vol: t.vol,
    age: t.age,
    imageUrl: t.imageUrl,
  };
}

export function Board({
  mode: boardMode,
  onOpenToken,
  onQuickBuy,
  watchlist,
  onToggleWatch,
  onOpenLeaders,
}: {
  mode: "market" | "firehose";
  onOpenToken: (t: SelectedToken) => void;
  onQuickBuy?: (t: SelectedToken, solAmount: number) => void;
  watchlist: string[];
  onToggleWatch: (mint: string) => void;
  onOpenLeaders?: () => void;
}) {
  const [category, setCategory] = useState<MarketCategory>(
    boardMode === "firehose" ? "new" : "trending"
  );
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setCategory(boardMode === "firehose" ? "new" : "trending");
  }, [boardMode]);

  const load = async () => {
    setLoading(true);
    try {
      if (category === "watched") {
        const all = await fetchMarketTokens(80, "trending");
        setRows(all.filter((t) => watchlist.includes(t.mint)));
        return;
      }
      if (category === "unusual") {
        const all = await fetchMarketTokens(100, "volume");
        setRows(
          [...all]
            .filter((t) => t.liqRaw >= 2000)
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
            .slice(0, 80)
        );
        return;
      }
      if (category === "whale") {
        const all = await fetchMarketTokens(100, "liquidity");
        setRows(
          [...all]
            .filter((t) => t.liqRaw >= 25000 && t.volRaw >= 10000)
            .sort((a, b) => b.volRaw - a.volRaw)
            .slice(0, 80)
        );
        return;
      }
      const cat = CATEGORIES.find((c) => c.id === category);
      const m: MarketMode = cat?.mode || "trending";
      setRows(await fetchMarketTokens(80, m));
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 45_000);
    return () => clearInterval(id);
  }, [category, boardMode]);

  const list = useMemo(() => {
    return rows.map((t) => {
      let verdict = toVerdict(t.risk);
      if (t.liqRaw >= 500000 && (verdict === "SAFE" || verdict === "UNKNOWN"))
        verdict = "BLUE CHIP";
      return { ...t, verdict };
    });
  }, [rows]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-[#9898a8] border-b border-[#1c1c26]">
        <span className="font-semibold text-[#f3f3f7] shrink-0">
          {loading ? "…" : list.length}
          <span className="font-normal text-[#5e5e70]"> tokens</span>
        </span>
        <button type="button" onClick={() => onOpenLeaders?.()} className="pill !py-1">
          🏆 LEADERS
        </button>
        <span className="flex items-center gap-1.5 shrink-0 text-[10px]">
          <span className="live-dot" />
          LIVE
        </span>
        <button onClick={load} className="ml-auto text-[#5e5e70] shrink-0 active:text-[#fbbf24]">
          ↻
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-2.5 py-2 border-b border-[#1c1c26]">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategory(c.id)}
            className={clsx("pill", category === c.id && "active")}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 text-[9px] text-[#5e5e70] tracking-wider border-b border-[#1c1c26]">
        <span className="flex-1">TOKEN</span>
        <span className="w-16 text-right">MC</span>
        <span className="w-14 text-right">24H</span>
        <span className="w-[52px] text-right">BUY</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && !rows.length && (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex items-center gap-2.5 py-2">
                <div className="skeleton w-9 h-9 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2.5 w-32" />
                </div>
                <div className="skeleton h-3 w-12" />
              </div>
            ))}
          </div>
        )}
        {!loading && !list.length && (
          <div className="p-12 text-center">
            <div className="text-[13px] font-medium text-[#9898a8] mb-1">
              {category === "watched" ? "Watchlist empty" : "No tokens in this view"}
            </div>
            <div className="text-[11px] text-[#5e5e70]">
              {category === "watched" ? "Star tokens from any category" : "Switch category or refresh"}
            </div>
          </div>
        )}
        {list.map((t) => {
          const v = t.verdict as Verdict;
          const watched = watchlist.includes(t.mint);
          return (
            <div
              key={t.mint + (t.pairAddress || "")}
              className="row-hover flex items-center gap-2 px-3 py-2.5 border-b border-[#1c1c26]"
            >
              <button
                className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
                onClick={() => onOpenToken(rowToSelected(t))}
              >
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-9 h-9 rounded-full object-cover bg-[#18181f] shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#18181f] flex items-center justify-center text-[12px] font-bold text-[#fbbf24] shrink-0">
                    {(t.symbol || "?")[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-[14px]">{t.symbol}</span>
                    <span className="text-[10px] text-[#5e5e70]">{t.age}</span>
                    <span className={clsx("text-[10px] font-semibold", verdictCls[v])}>
                      {v === "BLUE CHIP" ? "BLUE CHIP" : v}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9898a8] mt-0.5 truncate">V {t.vol} · L {t.liq}</div>
                </div>
                <div className="text-right shrink-0 w-16">
                  <div className="font-semibold text-[13px] tabular-nums">{t.mcap}</div>
                </div>
                <div
                  className={clsx(
                    "text-right shrink-0 w-14 text-[11px] font-medium tabular-nums",
                    t.change24h >= 0.05 ? "text-[#34d399]" : t.change24h <= -0.05 ? "text-[#f87171]" : "text-[#9898a8]"
                  )}
                >
                  {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
                </div>
              </button>
              <button onClick={() => onToggleWatch(t.mint)} className={clsx("p-1", watched ? "text-[#fbbf24]" : "text-[#5e5e70]")} title="Watch">
                <Star size={14} fill={watched ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => onQuickBuy?.(rowToSelected(t), QUICK_SOL)}
                title={`Buy ${QUICK_SOL} SOL via Jupiter`}
                className="shrink-0 min-w-[48px] px-2 py-1.5 rounded-full border border-[#f59e0b]/70 text-[#fbbf24] text-[10px] font-semibold tracking-wide active:bg-[#f59e0b]/15"
              >
                {QUICK_SOL}◎
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
