"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { fetchMarketTokens, searchTokens, type TokenRow } from "@/lib/tokens";
import type { SelectedToken } from "./types";

type Filter =
  | "TRENDING"
  | "NEW"
  | "GAINERS"
  | "LOSERS"
  | "VOLUME"
  | "LIQUIDITY"
  | "WHALES";

const riskCls = {
  LOW: "text-[#22c55e]",
  MED: "text-[#f59e0b]",
  HIGH: "text-[#ef4444]",
  UNKNOWN: "text-[#8b909a]",
};

export function MarketView({ onOpenDesk }: { onOpenDesk: (t: SelectedToken) => void }) {
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
      const data = q.trim().length > 1 ? await searchTokens(q) : await fetchMarketTokens(80);
      setRows(data);
      setUpdated(new Date());
    } catch (e: any) {
      setError(e?.message || "MARKET DATA UNAVAILABLE");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      load();
    }, 400);
    return () => clearTimeout(t);
  }, [q]);

  const sorted = useMemo(() => {
    let list = [...rows];
    if (filter === "GAINERS") list.sort((a, b) => b.change24h - a.change24h);
    else if (filter === "LOSERS") list.sort((a, b) => a.change24h - b.change24h);
    else if (filter === "VOLUME") list.sort((a, b) => b.volRaw - a.volRaw);
    else if (filter === "LIQUIDITY") list.sort((a, b) => b.liqRaw - a.liqRaw);
    else list.sort((a, b) => b.volRaw - a.volRaw);
    return list;
  }, [rows, filter]);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#1c1e24] flex items-center justify-between gap-2">
        <div className="mono text-[12px] font-semibold tracking-wide">MARKET</div>
        <div className="mono text-[10px] text-[#8b909a]">
          <span className="text-[#22c55e]">●</span> LIVE
          {updated && ` · ${sorted.length} MARKETS`}
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#1c1e24]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search token / CA / symbol"
          className="sb-input"
        />
      </div>

      <div className="flex gap-0 overflow-x-auto border-b border-[#1c1e24] px-1">
        {(["TRENDING", "GAINERS", "LOSERS", "VOLUME", "LIQUIDITY", "NEW", "WHALES"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-2.5 py-2 mono text-[9px] tracking-wider border-b-2 shrink-0",
                filter === f
                  ? "border-[#3d9eff] text-[#3d9eff]"
                  : "border-transparent text-[#8b909a]"
              )}
            >
              {f}
            </button>
          )
        )}
      </div>

      <div className="hidden md:grid grid-cols-[minmax(0,1.4fr)_80px_72px_72px_72px_64px_56px_48px] gap-1 px-3 py-1.5 mono text-[9px] text-[#4a4f5a] tracking-wider border-b border-[#1c1e24]">
        <div>TOKEN</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">MC</div>
        <div className="text-right">LIQ</div>
        <div className="text-right">VOL</div>
        <div className="text-right">24H</div>
        <div className="text-right">RISK</div>
        <div className="text-right">AGE</div>
      </div>

      <div className="md:hidden grid grid-cols-[minmax(0,1.4fr)_72px_56px] gap-1 px-3 py-1.5 mono text-[9px] text-[#4a4f5a] border-b border-[#1c1e24]">
        <div>TOKEN</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {error && (
          <div className="p-6 text-center mono text-[11px] text-[#ef4444]">{error}</div>
        )}
        {loading && !rows.length && (
          <div className="p-10 text-center mono text-[11px] text-[#4a4f5a]">LOADING MARKET DATA…</div>
        )}
        {!loading && !sorted.length && !error && (
          <div className="p-10 text-center mono text-[11px] text-[#4a4f5a]">NO MARKETS · TRY SEARCH</div>
        )}
        {sorted.map((t) => (
          <button
            key={t.mint + (t.pairAddress || "")}
            onClick={() =>
              onOpenDesk({
                mint: t.mint,
                pairAddress: t.pairAddress,
                symbol: t.symbol,
                name: t.name,
              })
            }
            className="sb-row w-full text-left border-b border-[#111318]"
          >
            <div className="hidden md:grid grid-cols-[minmax(0,1.4fr)_80px_72px_72px_72px_64px_56px_48px] gap-1 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-5 h-5 rounded-sm object-cover bg-[#111]" />
                ) : (
                  <div className="w-5 h-5 rounded-sm bg-[#1c1e24]" />
                )}
                <div className="min-w-0">
                  <div className="mono text-[12px] font-medium truncate">{t.symbol}</div>
                  <div className="mono text-[9px] text-[#4a4f5a] truncate">{t.name}</div>
                </div>
              </div>
              <div className="text-right mono text-[11px] self-center">{t.price}</div>
              <div className="text-right mono text-[10px] self-center text-[#8b909a]">{t.mcap}</div>
              <div className="text-right mono text-[10px] self-center text-[#8b909a]">{t.liq}</div>
              <div className="text-right mono text-[10px] self-center text-[#8b909a]">{t.vol}</div>
              <div
                className={clsx(
                  "text-right mono text-[11px] self-center",
                  t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                )}
              >
                {t.change24h >= 0 ? "+" : ""}
                {t.change24h.toFixed(1)}%
              </div>
              <div className={clsx("text-right mono text-[9px] self-center", riskCls[t.risk])}>
                {t.risk}
              </div>
              <div className="text-right mono text-[10px] self-center text-[#4a4f5a]">{t.age}</div>
            </div>
            <div className="md:hidden grid grid-cols-[minmax(0,1.4fr)_72px_56px] gap-1 px-3 py-3">
              <div className="flex items-center gap-2 min-w-0">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-8 h-8 rounded object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded bg-[#1c1e24]" />
                )}
                <div className="min-w-0">
                  <div className="mono text-[13px] font-medium truncate">{t.symbol}</div>
                  <div className={clsx("mono text-[9px]", riskCls[t.risk])}>{t.risk}</div>
                </div>
              </div>
              <div className="text-right mono text-[12px] self-center">{t.price}</div>
              <div
                className={clsx(
                  "text-right mono text-[12px] self-center",
                  t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ef4444]"
                )}
              >
                {t.change24h >= 0 ? "+" : ""}
                {t.change24h.toFixed(1)}%
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
