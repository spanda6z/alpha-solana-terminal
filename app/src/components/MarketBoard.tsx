"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import {
  fetchMarketTokens,
  fetchWatchlistTokens,
  filterTokens,
  searchTokens,
  type MarketCategory,
  type TokenRow,
  type Verdict,
} from "../lib/tokens";

type Filter = MarketCategory | "ALL" | "SAFE" | "FLAGGED" | "BLUE CHIP";

const PAGE_SIZE = 30;

const tabs: Array<{ id: Filter; label: string }> = [
  { id: "TRENDING", label: "🔥 Trending" },
  { id: "NEW", label: "🆕 New launches" },
  { id: "VOLUME", label: "📈 Top volume" },
  { id: "LIQUIDITY", label: "💧 Highest liquidity" },
  { id: "MOVERS", label: "⚡ Biggest movers" },
  { id: "BONDING", label: "🟢 New / graduation" },
];

const verdictMark: Record<Verdict, string> = {
  "BLUE CHIP": "text-[#38bdf8]",
  SAFE: "text-[#22c55e]",
  CAUTION: "text-[#fbbf24]",
  DANGER: "text-[#ff3d57]",
  UNKNOWN: "text-[#6b6b6b]",
};

export type SelectedToken = {
  mint: string;
  pairAddress?: string;
  symbol?: string;
};

export function MarketBoard({
  onSelect,
  selected,
}: {
  onSelect: (t: SelectedToken) => void;
  selected: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("TRENDING");
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [q, setQ] = useState("");
  const [dex, setDex] = useState("ALL");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const load = async (mode: Filter) => {
    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);

    try {
      if (mode === "SAFE" || mode === "FLAGGED" || mode === "BLUE CHIP" || mode === "ALL") {
        const data = await fetchMarketTokens("TRENDING");
        setRows(data);
      } else {
        setRows(await fetchMarketTokens(mode));
      }
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Market feed unavailable");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async () => {
    const query = q.trim();
    if (!query) {
      await load(filter);
      return;
    }

    setLoading(true);
    setError(null);
    setVisibleCount(PAGE_SIZE);

    try {
      setRows(await searchTokens(query));
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Search failed");
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    const id = window.setInterval(() => {
      if (!q.trim()) load(filter);
    }, 30_000);

    return () => window.clearInterval(id);
    // q intentionally excluded: search should not recreate the refresh timer.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const dexOptions = useMemo(() => {
    const values = new Set(rows.map((row) => row.dexId).filter(Boolean) as string[]);
    return ["ALL", ...Array.from(values).sort()];
  }, [rows]);

  const filtered = useMemo(() => {
    let result = filterTokens(rows, { query: q, dex });

    if (filter === "SAFE") {
      result = result.filter((t) => t.verdict === "SAFE" || t.verdict === "BLUE CHIP");
    }

    if (filter === "FLAGGED") {
      result = result.filter((t) => t.verdict === "CAUTION" || t.verdict === "DANGER");
    }

    if (filter === "BLUE CHIP") {
      result = result.filter((t) => t.verdict === "BLUE CHIP");
    }

    return result;
  }, [rows, filter, q, dex]);

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const loadMore = () => {
    if (hasMore) {
      setLoadingMore(true);
      window.setTimeout(() => {
        setVisibleCount((count) => count + PAGE_SIZE);
        setLoadingMore(false);
      }, 120);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 border-b border-[#1a1a1a] px-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setFilter(tab.id);
              setQ("");
              setDex("ALL");
            }}
            className={clsx(
              "px-2.5 sm:px-3 py-2.5 mono text-[10px] tracking-wide border-b-2 transition shrink-0 whitespace-nowrap",
              filter === tab.id
                ? "border-[#ff6b00] text-[#ff6b00]"
                : "border-transparent text-[#6b6b6b] active:text-[#ececec]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex gap-2 px-2 sm:px-3 py-2 border-b border-[#1a1a1a]">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            runSearch();
          }}
          className="flex-1 min-w-0"
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="🔎 SEARCH TOKEN / SYMBOL / CA"
            className="w-full bg-[#0a0a0a] border border-[#222] px-3 py-2.5 mono text-[13px] sm:text-[11px] text-[#ececec] outline-none focus:border-[#ff6b00] placeholder:text-[#3d3d3d] rounded-sm"
          />
        </form>

        <select
          value={dex}
          onChange={(e) => setDex(e.target.value)}
          className="max-w-[120px] bg-[#0a0a0a] border border-[#222] px-2 mono text-[10px] text-[#8a8a8a] outline-none focus:border-[#ff6b00] uppercase"
          aria-label="DEX filter"
        >
          {dexOptions.map((value) => (
            <option key={value} value={value}>
              {value === "ALL" ? "ALL DEXs" : value}
            </option>
          ))}
        </select>

        <button
          onClick={() => load(filter)}
          className="px-2.5 border border-[#222] bg-[#0a0a0a] mono text-[10px] text-[#6b6b6b] active:text-[#ff6b00] shrink-0"
          title="Refresh market"
        >
          {loading ? "..." : "↻"}
        </button>
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] mono text-[9px] tracking-wider text-[#3d3d3d] uppercase">
        <span>
          SOLANA · {filtered.length} discovered
          {filter === "BONDING" && " · newest pairs / graduation source pending"}
        </span>
        <span>
          {updatedAt ? `LIVE ${updatedAt.toLocaleTimeString()}` : "CONNECTING"}
        </span>
      </div>

      <div className="hidden md:grid grid-cols-[minmax(0,1.6fr)_72px_88px_64px_64px_64px_64px_56px] gap-0 px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d] border-b border-[#1a1a1a] uppercase">
        <div>TOKEN</div>
        <div>FLAG</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
        <div className="text-right">MC</div>
        <div className="text-right">LIQ</div>
        <div className="text-right">VOL</div>
        <div className="text-right">AGE</div>
      </div>

      <div className="md:hidden grid grid-cols-[minmax(0,1.5fr)_70px_58px] gap-1 px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d] border-b border-[#1a1a1a] uppercase">
        <div>TOKEN</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain" onScroll={(event) => {
        const target = event.currentTarget;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 180) {
          loadMore();
        }
      }}>
        {error && (
          <div className="p-6 text-center text-[#ff3d57] mono text-xs">
            {error}
          </div>
        )}

        {!error && loading && rows.length === 0 && (
          <div className="p-10 text-center mono text-[11px] text-[#3d3d3d]">
            LOADING LIVE SOLANA FEED...
          </div>
        )}

        {!error && !loading && visible.length === 0 && (
          <div className="p-10 text-center mono text-[11px] text-[#3d3d3d]">
            NO MATCHES
          </div>
        )}

        {visible.map((t) => (
          <button
            key={`${t.mint}-${t.pairAddress || "pair"}`}
            onClick={() =>
              onSelect({ mint: t.mint, pairAddress: t.pairAddress, symbol: t.symbol })
            }
            className={clsx(
              "row w-full text-left border-b border-[#111] active:bg-[#111]",
              selected === t.mint && "active"
            )}
          >
            <div className="hidden md:grid grid-cols-[minmax(0,1.6fr)_72px_88px_64px_64px_64px_64px_56px] gap-0 px-3 py-2">
              <div className="flex items-center gap-2 min-w-0">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-5 h-5 rounded-sm bg-[#111] object-cover shrink-0" />
                ) : (
                  <div className="w-5 h-5 rounded-sm bg-[#1a1a1a] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="mono text-[12px] font-medium truncate">{t.symbol}</div>
                  <div className="mono text-[9px] text-[#3d3d3d] truncate">
                    {t.name} {t.dexId ? `· ${t.dexId}` : ""}
                  </div>
                </div>
              </div>
              <div className={clsx("mono text-[9px] self-center tracking-wide", verdictMark[t.verdict])}>
                {t.verdict === "BLUE CHIP" ? "BLUE" : t.verdict}
              </div>
              <div className="text-right mono text-[11px] self-center">{t.price}</div>
              <div className={clsx("text-right mono text-[11px] self-center", t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]")}>
                {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
              </div>
              <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.mcap}</div>
              <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.liq}</div>
              <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.vol}</div>
              <div className="text-right mono text-[10px] self-center text-[#3d3d3d]">{t.age}</div>
            </div>

            <div className="md:hidden grid grid-cols-[minmax(0,1.5fr)_70px_58px] gap-1 px-3 py-3">
              <div className="flex items-center gap-2.5 min-w-0">
                {t.imageUrl ? (
                  <img src={t.imageUrl} alt="" className="w-8 h-8 rounded-md bg-[#111] object-cover shrink-0" />
                ) : (
                  <div className="w-8 h-8 rounded-md bg-[#1a1a1a] shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="mono text-[13px] font-medium truncate">{t.symbol}</div>
                  <div className="mono text-[9px] tracking-wide text-[#6b6b6b] truncate">{t.name}</div>
                </div>
              </div>
              <div className="text-right mono text-[12px] self-center">{t.price}</div>
              <div className={clsx("text-right mono text-[12px] self-center font-medium", t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]")}>
                {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
              </div>
            </div>
          </button>
        ))}

        {loadingMore && (
          <div className="py-4 text-center mono text-[9px] text-[#444]">
            LOADING MORE MARKETS...
          </div>
        )}

        {!loadingMore && hasMore && (
          <button
            onClick={loadMore}
            className="w-full py-4 border-t border-[#151515] mono text-[10px] tracking-wider text-[#555] active:text-[#ff6b00]"
          >
            LOAD MORE · {filtered.length - visible.length} REMAINING
          </button>
        )}

        {!loading && filtered.length > 0 && !hasMore && (
          <div className="py-4 text-center mono text-[9px] text-[#333]">
            END OF DISCOVERY FEED
          </div>
        )}
      </div>
    </div>
  );
}
