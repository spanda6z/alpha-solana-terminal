"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  fetchMarketTokens,
  searchTokens,
  type MarketMode,
  type TokenRow,
} from "@/lib/tokens";
import { isBoardWorthy, rankTrending } from "@/lib/marketFilter";
import type { SelectedToken } from "./types";

type Filter = "TRENDING" | "NEW" | "GAINERS" | "LOSERS" | "VOLUME";

const FILTER_MODE: Partial<Record<Filter, MarketMode>> = {
  TRENDING: "trending",
  NEW: "new",
  GAINERS: "gainers",
  LOSERS: "losers",
  VOLUME: "volume",
};

const riskCls: Record<string, string> = {
  LOW: "text-[#2dd4bf]",
  MED: "text-[#f59e0b]",
  HIGH: "text-[#ef4444]",
  UNKNOWN: "text-[#7D8794]",
};

function fmtMc(t: TokenRow): string {
  if (!t.mcapRaw || t.mcapRaw <= 0) return "—";
  return t.mcap;
}

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
      let raw: TokenRow[] = [];
      if (q.trim().length > 1) {
        raw = await searchTokens(q);
      } else {
        const mode = FILTER_MODE[filter] || "trending";
        raw = await fetchMarketTokens(100, mode);
      }
      setRows(raw.filter((t) => isBoardWorthy(t)));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const list = useMemo(() => {
    let r = rows.filter((t) => isBoardWorthy(t));
    if (filter === "GAINERS") {
      r = r.filter((t) => t.change24h >= 15).sort((a, b) => b.change24h - a.change24h);
    } else if (filter === "LOSERS") {
      r = r.filter((t) => t.change24h <= -10).sort((a, b) => a.change24h - b.change24h);
    } else if (filter === "TRENDING") {
      r = rankTrending(r) as TokenRow[];
    } else if (filter === "VOLUME") {
      r = [...r].sort((a, b) => b.volRaw - a.volRaw);
    }
    return r.slice(0, 40);
  }, [rows, filter]);

  const toSelected = (t: TokenRow): SelectedToken => ({
    mint: t.mint,
    pairAddress: t.pairAddress,
    symbol: t.symbol,
    name: t.name,
    price: t.price,
    change24h: t.change24h,
    mcap: fmtMc(t),
    liq: t.liq,
    vol: t.vol,
    age: t.age,
    imageUrl: t.imageUrl,
    risk: t.risk,
  });

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="shrink-0 px-3 pt-2 pb-1.5 flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">{title}</span>
        <span className="live-dot" />
        <span className="mono text-[9px] text-[#4A5560] ml-auto">
          {updated
            ? updated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            : ""}
        </span>
        <button onClick={load} className="mono text-[10px] text-[#7D8794] w-7 h-7" aria-label="Refresh">
          ↻
        </button>
      </div>

      <div className="shrink-0 px-3 pb-2">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search CA or symbol"
          className="sb-input !py-2 !text-[12px]"
        />
      </div>

      <div className="shrink-0 flex gap-1 overflow-x-auto px-2 pb-2">
        {(["TRENDING", "GAINERS", "LOSERS", "NEW", "VOLUME"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "mono text-[10px] px-2.5 py-1.5 border tracking-wide whitespace-nowrap",
              filter === f
                ? "border-[#3d9eff] text-[#3d9eff] bg-[rgba(61,158,255,0.08)]"
                : "border-[#151B22] text-[#7D8794]"
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="shrink-0 flex px-3 py-1 mono text-[8px] text-[#4A5560] tracking-wider border-y border-[#151B22]">
        <span className="flex-1">TOKEN</span>
        <span className="w-[4.5rem] text-right">MC</span>
        <span className="w-14 text-right">CHG</span>
        <span className="w-[4.5rem] text-right">LIQ</span>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 pb-2">
        {loading && !list.length && (
          <div className="p-3 space-y-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="flex gap-2.5 py-2">
                <div className="skeleton w-7 h-7 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="skeleton h-3 w-24" />
                  <div className="skeleton h-2 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {error && !list.length && <div className="data-unavailable py-12">{error}</div>}

        {!loading && !error && !list.length && (
          <div className="data-unavailable py-12">
            No movers in this lens
            <div className="mt-1 text-[#4A5560]">Try GAINERS or VOLUME</div>
          </div>
        )}

        {list.map((t) => {
          const up = t.change24h >= 0;
          const hot = t.change24h >= 100;
          return (
            <button
              key={t.mint}
              onClick={() => onOpenDesk(toSelected(t))}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 border-b border-[#0d1218] text-left active:bg-[#0A0E13]"
            >
              {t.imageUrl ? (
                <img
                  src={t.imageUrl}
                  alt=""
                  className="w-7 h-7 rounded-full object-cover bg-[#0A0E13] shrink-0"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#0A0E13] border border-[#151B22] flex items-center justify-center mono text-[10px] text-[#3d9eff] shrink-0">
                  {(t.symbol || "?")[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="mono text-[12px] font-semibold truncate">{t.symbol}</span>
                  {hot && (
                    <span className="mono text-[8px] text-[#2dd4bf] border border-[#2dd4bf]/40 px-1">
                      100%+
                    </span>
                  )}
                  <span className={clsx("mono text-[8px]", riskCls[t.risk] || riskCls.UNKNOWN)}>
                    {t.risk}
                  </span>
                </div>
                <div className="mono text-[9px] text-[#4A5560] truncate">
                  {t.vol ? `V ${t.vol}` : ""}
                  {t.price ? ` · ${t.price}` : ""}
                </div>
              </div>
              <span className="mono text-[11px] w-[4.5rem] text-right tabular-nums">{fmtMc(t)}</span>
              <span
                className={clsx(
                  "mono text-[11px] w-14 text-right font-semibold tabular-nums",
                  up ? "text-[#2dd4bf]" : "text-[#ef4444]"
                )}
              >
                {up ? "+" : ""}
                {t.change24h.toFixed(1)}%
              </span>
              <span className="mono text-[11px] w-[4.5rem] text-right tabular-nums text-[#7D8794]">
                {t.liq || "—"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
