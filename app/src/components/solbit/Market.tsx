"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  fetchMarketTokens,
  searchTokens,
  type MarketMode,
  type TokenRow,
} from "@/lib/tokens";
import type { SelectedToken } from "./types";

type Filter =
  | "TRENDING"
  | "NEW"
  | "GAINERS"
  | "LOSERS"
  | "VOLUME"
  | "LIQUIDITY"
  | "UNUSUAL"
  | "WHALE";

const FILTER_MODE: Partial<Record<Filter, MarketMode>> = {
  TRENDING: "trending",
  NEW: "new",
  GAINERS: "gainers",
  LOSERS: "losers",
  VOLUME: "volume",
  LIQUIDITY: "liquidity",
};

const riskCls: Record<string, string> = {
  LOW: "text-[#2dd4bf]",
  MED: "text-[#f59e0b]",
  HIGH: "text-[#ef4444]",
  UNKNOWN: "text-[#7D8794]",
};

export function MarketView({
  onOpenDesk,
  title = "DISCOVER",
}: {
  onOpenDesk: (t: SelectedToken) => void;
  title?: string;
}) {
  const [filter, setFilter] = useState<Filter>("TRENDING");
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [updated, setUpdated] = useState<Date | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      if (q.trim().length > 1) {
        setRows(await searchTokens(q));
      } else if (filter === "UNUSUAL") {
        const all = await fetchMarketTokens(100, "volume");
        setRows(
          [...all]
            .filter((t) => t.liqRaw >= 2000)
            .sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h))
            .slice(0, 80)
        );
      } else if (filter === "WHALE") {
        const all = await fetchMarketTokens(100, "liquidity");
        setRows(
          [...all]
            .filter((t) => t.liqRaw >= 25000 && t.volRaw >= 10000)
            .sort((a, b) => b.volRaw - a.volRaw)
            .slice(0, 80)
        );
      } else {
        const mode = FILTER_MODE[filter] || "trending";
        setRows(await fetchMarketTokens(80, mode));
      }
      setUpdated(new Date());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "MARKET DATA UNAVAILABLE");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 45_000);
    return () => clearInterval(id);
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [q]);

  const list = useMemo(() => rows, [rows]);

  const toSelected = (t: TokenRow): SelectedToken => ({
    mint: t.mint,
    pairAddress: t.pairAddress,
    symbol: t.symbol,
    name: t.name,
    price: t.price,
    change24h: t.change24h,
    mcap: t.mcap,
    liq: t.liq,
    vol: t.vol,
    age: t.age,
    imageUrl: t.imageUrl,
    risk: t.risk,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22] flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">{title}</span>
        <span className="flex items-center gap-1.5 mono text-[10px] text-[#7D8794] ml-2">
          <span className="live-dot" />
          LIVE
        </span>
        {updated && (
          <span className="mono text-[9px] text-[#4A5560] ml-auto">
            Updated {updated.toLocaleTimeString()}
          </span>
        )}
        <button onClick={load} className="mono text-[10px] text-[#7D8794] hover:text-[#3d9eff]">
          ↻
        </button>
      </div>

      <div className="px-3 py-2 border-b border-[#151B22]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search token / CA / symbol"
          className="sb-input"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-[#151B22] px-2 py-2">
        {(["TRENDING", "NEW", "GAINERS", "LOSERS", "VOLUME", "LIQUIDITY", "UNUSUAL", "WHALE"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx("sb-pill", filter === f && "active")}
            >
              {f}
            </button>
          )
        )}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 mono text-[9px] text-[#4A5560] tracking-wider border-b border-[#151B22]">
        <span className="flex-1">TOKEN</span>
        <span className="w-16 text-right">MC</span>
        <span className="w-14 text-right">24H</span>
        <span className="w-16 text-right">LIQ</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && !list.length && (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="flex gap-2.5 py-2">
                <div className="skeleton w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2.5 w-32" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && (
          <div className="data-unavailable">
            DATA TEMPORARILY UNAVAILABLE
            <div className="mt-1 text-[#4A5560]">{error}</div>
            <button onClick={load} className="mt-3 text-[#3d9eff]">
              RETRY
            </button>
          </div>
        )}

        {!loading && !error && !list.length && (
          <div className="data-unavailable">
            WAITING FOR DATA
            <div className="mt-1 text-[#4A5560]">No tokens in this view</div>
          </div>
        )}

        {list.map((t) => (
          <button
            key={t.mint + (t.pairAddress || "")}
            onClick={() => onOpenDesk(toSelected(t))}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-[#151B22] text-left hover:bg-[#0A0E13] active:bg-[#0d1218]"
          >
            {t.imageUrl ? (
              <img
                src={t.imageUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover bg-[#0A0E13] shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#0A0E13] border border-[#151B22] flex items-center justify-center mono text-[11px] text-[#3d9eff] shrink-0">
                {(t.symbol || "?")[0]}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-[13px]">{t.symbol}</span>
                <span className="mono text-[9px] text-[#4A5560]">{t.age}</span>
                <span className={clsx("mono text-[9px] font-semibold", riskCls[t.risk] || riskCls.UNKNOWN)}>
                  {t.risk === "LOW" ? "LOW" : t.risk === "MED" ? "CAUTION" : t.risk === "HIGH" ? "HIGH" : "—"}
                </span>
              </div>
              <div className="mono text-[10px] text-[#7D8794] mt-0.5 truncate">
                V {t.vol} · {t.price}
              </div>
            </div>
            <div className="text-right shrink-0 w-16 mono text-[12px] font-medium">{t.mcap}</div>
            <div
              className={clsx(
                "text-right shrink-0 w-14 mono text-[11px]",
                t.change24h >= 0.05
                  ? "text-[#2dd4bf]"
                  : t.change24h <= -0.05
                  ? "text-[#ef4444]"
                  : "text-[#7D8794]"
              )}
            >
              {t.change24h >= 0 ? "+" : ""}
              {t.change24h.toFixed(1)}%
            </div>
            <div className="text-right shrink-0 w-16 mono text-[11px] text-[#7D8794]">{t.liq}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
