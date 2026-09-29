"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { fetchTrendingTokens, fetchWatchlistTokens, type TokenRow, type Verdict } from "../lib/tokens";

type Filter = "TRENDING" | "ALL" | "SAFE" | "FLAGGED" | "BLUE CHIP";

const verdictMark: Record<Verdict, string> = {
  "BLUE CHIP": "text-[#38bdf8]",
  SAFE: "text-[#00e676]",
  CAUTION: "text-[#fbbf24]",
  DANGER: "text-[#ff3d57]",
  UNKNOWN: "text-[#6b6b6b]",
};

export function MarketBoard({
  onSelect,
  selected,
}: {
  onSelect: (mint: string) => void;
  selected: string | null;
}) {
  const [filter, setFilter] = useState<Filter>("TRENDING");
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const load = async (mode: Filter) => {
    setLoading(true);
    setError(null);
    try {
      const data =
        mode === "TRENDING" || mode === "ALL"
          ? await fetchTrendingTokens(25)
          : await fetchWatchlistTokens();
      setRows(data);
      setUpdatedAt(new Date());
    } catch (e: any) {
      setError(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    const id = setInterval(() => load(filter), 45_000);
    return () => clearInterval(id);
  }, [filter]);

  const filtered = rows.filter((t) => {
    if (filter === "TRENDING" || filter === "ALL") return true;
    if (filter === "SAFE") return t.verdict === "SAFE" || t.verdict === "BLUE CHIP";
    if (filter === "FLAGGED") return t.verdict === "CAUTION" || t.verdict === "DANGER";
    if (filter === "BLUE CHIP") return t.verdict === "BLUE CHIP";
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-0 border-b border-[#1a1a1a] px-1 overflow-x-auto">
        {(["TRENDING", "ALL", "SAFE", "FLAGGED", "BLUE CHIP"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              "px-3 py-2 mono text-[10px] tracking-wider border-b-2 transition shrink-0",
              filter === f
                ? "border-[#c8ff00] text-[#c8ff00]"
                : "border-transparent text-[#6b6b6b] hover:text-[#ececec]"
            )}
          >
            {f}
          </button>
        ))}
        <button
          onClick={() => load(filter)}
          className="ml-auto px-3 py-2 mono text-[10px] text-[#3d3d3d] hover:text-[#c8ff00]"
        >
          {loading ? "..." : updatedAt ? updatedAt.toLocaleTimeString() : "REFRESH"}
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1.6fr)_72px_88px_64px_64px_64px_56px_48px] gap-0 px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d] border-b border-[#1a1a1a] uppercase">
        <div>TOKEN</div>
        <div>FLAG</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
        <div className="text-right">MC</div>
        <div className="text-right">LIQ</div>
        <div className="text-right">VOL</div>
        <div className="text-right">AGE</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-6 text-center text-[#ff3d57] mono text-xs">{error}</div>}
        {!error && loading && rows.length === 0 && (
          <div className="p-10 text-center mono text-[11px] text-[#3d3d3d]">LOADING FEED...</div>
        )}
        {!error && !loading && filtered.length === 0 && (
          <div className="p-10 text-center mono text-[11px] text-[#3d3d3d]">EMPTY</div>
        )}
        {filtered.map((t) => (
          <button
            key={t.mint}
            onClick={() => onSelect(t.mint)}
            className={clsx(
              "row w-full grid grid-cols-[minmax(0,1.6fr)_72px_88px_64px_64px_64px_56px_48px] gap-0 px-3 py-2 text-left border-b border-[#111]",
              selected === t.mint && "active"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {t.imageUrl ? (
                <img src={t.imageUrl} alt="" className="w-5 h-5 rounded-sm bg-[#111] object-cover shrink-0" />
              ) : (
                <div className="w-5 h-5 rounded-sm bg-[#1a1a1a] shrink-0" />
              )}
              <div className="min-w-0">
                <div className="mono text-[12px] font-medium truncate">{t.symbol}</div>
                <div className="mono text-[9px] text-[#3d3d3d] truncate">{t.name}</div>
              </div>
            </div>
            <div className={clsx("mono text-[9px] self-center tracking-wide", verdictMark[t.verdict])}>
              {t.verdict === "BLUE CHIP" ? "BLUE" : t.verdict}
            </div>
            <div className="text-right mono text-[11px] self-center">{t.price}</div>
            <div className={clsx("text-right mono text-[11px] self-center", t.change24h >= 0 ? "text-[#00e676]" : "text-[#ff3d57]")}>
              {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
            </div>
            <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.mcap}</div>
            <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.liq}</div>
            <div className="text-right mono text-[10px] self-center text-[#6b6b6b]">{t.vol}</div>
            <div className="text-right mono text-[10px] self-center text-[#3d3d3d]">{t.age}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
