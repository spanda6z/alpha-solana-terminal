"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { fetchTrendingTokens, fetchWatchlistTokens, type TokenRow, type Verdict } from "../lib/tokens";

type Filter = "ALL" | "SAFE" | "FLAGGED" | "ALIVE" | "BLUE CHIP" | "MY BAG" | "TRENDING";

const verdictColor: Record<Verdict, string> = {
  "BLUE CHIP": "text-sky-400 bg-sky-400/10",
  SAFE: "text-emerald-400 bg-emerald-400/10",
  CAUTION: "text-amber-400 bg-amber-400/10",
  DANGER: "text-rose-400 bg-rose-400/10",
  UNKNOWN: "text-gray-400 bg-gray-400/10",
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
      setError(e?.message || "Failed to load tokens");
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
    if (filter === "ALL" || filter === "TRENDING" || filter === "ALIVE") return true;
    if (filter === "SAFE") return t.verdict === "SAFE" || t.verdict === "BLUE CHIP";
    if (filter === "FLAGGED") return t.verdict === "CAUTION" || t.verdict === "DANGER";
    if (filter === "BLUE CHIP") return t.verdict === "BLUE CHIP";
    if (filter === "MY BAG") return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800/60 overflow-x-auto">
        {(["TRENDING", "ALL", "SAFE", "FLAGGED", "ALIVE", "BLUE CHIP", "MY BAG"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition",
                filter === f
                  ? "bg-violet-600 text-white"
                  : "bg-gray-800/60 text-gray-400 hover:text-gray-200"
              )}
            >
              {f}
            </button>
          )
        )}
        <button
          onClick={() => load(filter)}
          className="ml-auto text-[11px] text-gray-500 hover:text-violet-300"
        >
          {loading ? "Loading…" : updatedAt ? `↻ ${updatedAt.toLocaleTimeString()}` : "↻"}
        </button>
      </div>

      <div className="grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] gap-2 px-4 py-2 text-[11px] text-gray-500 border-b border-gray-800/40">
        <div>TOKEN</div>
        <div>VERDICT</div>
        <div className="text-right">PRICE</div>
        <div className="text-right">24H</div>
        <div className="text-right">MC</div>
        <div className="text-right">LIQ</div>
        <div className="text-right">VOL</div>
        <div className="text-right">AGE</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-4 text-sm text-rose-400 text-center">{error}</div>}
        {!error && loading && rows.length === 0 && (
          <div className="p-8 text-sm text-gray-500 text-center">Fetching live Solana markets…</div>
        )}
        {!error && !loading && filtered.length === 0 && (
          <div className="p-8 text-sm text-gray-500 text-center">No tokens match this filter</div>
        )}
        {filtered.map((t) => (
          <button
            key={t.mint}
            onClick={() => onSelect(t.mint)}
            className={clsx(
              "w-full grid grid-cols-[1.4fr_0.7fr_0.7fr_0.6fr_0.6fr_0.6fr_0.5fr_0.5fr] gap-2 px-4 py-2.5 text-sm hover:bg-white/[0.03] transition border-b border-gray-800/20 text-left",
              selected === t.mint && "bg-violet-600/10"
            )}
          >
            <div className="flex items-center gap-2 min-w-0">
              {t.imageUrl ? (
                <img src={t.imageUrl} alt="" className="w-7 h-7 rounded-full bg-gray-800 flex-shrink-0 object-cover" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex-shrink-0" />
              )}
              <div className="min-w-0">
                <div className="font-medium truncate">{t.symbol}</div>
                <div className="text-[11px] text-gray-500 truncate">{t.name}</div>
              </div>
            </div>
            <div>
              <span className={clsx("text-[10px] px-1.5 py-0.5 rounded font-medium", verdictColor[t.verdict])}>
                {t.verdict}
              </span>
            </div>
            <div className="text-right font-mono text-[13px]">{t.price}</div>
            <div className={clsx("text-right font-mono text-[13px]", t.change24h >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
            </div>
            <div className="text-right text-gray-400 text-[13px]">{t.mcap}</div>
            <div className="text-right text-gray-400 text-[13px]">{t.liq}</div>
            <div className="text-right text-gray-400 text-[13px]">{t.vol}</div>
            <div className="text-right text-gray-500 text-[13px]">{t.age}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
