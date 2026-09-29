"use client";

import { useEffect, useState } from "react";
import clsx from "clsx";
import { fetchTrendingTokens, fetchWatchlistTokens, type TokenRow, type Verdict } from "../lib/tokens";

type Filter = "ALL" | "SAFE" | "FLAGGED" | "ALIVE" | "BLUE CHIP" | "MY BAG" | "TRENDING";

const verdictStyle: Record<Verdict, string> = {
  "BLUE CHIP": "text-sky-300 bg-sky-400/10 ring-1 ring-sky-400/20",
  SAFE: "text-emerald-300 bg-emerald-400/10 ring-1 ring-emerald-400/20",
  CAUTION: "text-amber-300 bg-amber-400/10 ring-1 ring-amber-400/20",
  DANGER: "text-rose-300 bg-rose-400/10 ring-1 ring-rose-400/20",
  UNKNOWN: "text-gray-400 bg-white/[0.04] ring-1 ring-white/[0.06]",
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
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-white/[0.05] overflow-x-auto">
        {(["TRENDING", "ALL", "SAFE", "FLAGGED", "ALIVE", "BLUE CHIP", "MY BAG"] as Filter[]).map(
          (f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "px-2.5 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition",
                filter === f
                  ? "bg-violet-600 text-white shadow-md shadow-violet-600/20"
                  : "bg-white/[0.04] text-gray-500 hover:text-gray-300 hover:bg-white/[0.07]"
              )}
            >
              {f}
            </button>
          )
        )}
        <button
          onClick={() => load(filter)}
          className="ml-auto text-[10px] text-gray-600 hover:text-violet-300 mono shrink-0 px-2"
        >
          {loading ? "…" : updatedAt ? updatedAt.toLocaleTimeString() : "↻"}
        </button>
      </div>

      <div className="grid grid-cols-[minmax(0,1.5fr)_0.7fr_0.75fr_0.55fr_0.55fr_0.55fr_0.5fr_0.45fr] gap-1 px-3 py-2 text-[10px] uppercase tracking-wider text-gray-600 border-b border-white/[0.04]">
        <div>Token</div>
        <div>Verdict</div>
        <div className="text-right">Price</div>
        <div className="text-right">24h</div>
        <div className="text-right">MC</div>
        <div className="text-right">Liq</div>
        <div className="text-right">Vol</div>
        <div className="text-right">Age</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {error && <div className="p-6 text-sm text-rose-400/90 text-center">{error}</div>}
        {!error && loading && rows.length === 0 && (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-gray-500">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-400 live-dot" />
              Fetching Solana markets…
            </div>
          </div>
        )}
        {!error && !loading && filtered.length === 0 && (
          <div className="p-12 text-sm text-gray-600 text-center">No tokens match</div>
        )}
        {filtered.map((t) => (
          <button
            key={t.mint}
            onClick={() => onSelect(t.mint)}
            className={clsx(
              "token-row w-full grid grid-cols-[minmax(0,1.5fr)_0.7fr_0.75fr_0.55fr_0.55fr_0.55fr_0.5fr_0.45fr] gap-1 px-3 py-2.5 text-left border-b border-white/[0.03]",
              selected === t.mint && "selected"
            )}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {t.imageUrl ? (
                <img src={t.imageUrl} alt="" className="w-7 h-7 rounded-full bg-[#15161c] object-cover ring-1 ring-white/10 shrink-0" />
              ) : (
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 ring-1 ring-white/10 shrink-0" />
              )}
              <div className="min-w-0">
                <div className="font-medium text-[13px] truncate tracking-tight">{t.symbol}</div>
                <div className="text-[10px] text-gray-600 truncate">{t.name}</div>
              </div>
            </div>
            <div className="flex items-center">
              <span className={clsx("text-[9px] px-1.5 py-0.5 rounded-md font-semibold tracking-wide", verdictStyle[t.verdict])}>
                {t.verdict}
              </span>
            </div>
            <div className="text-right mono text-[12px] self-center text-gray-200">{t.price}</div>
            <div className={clsx("text-right mono text-[12px] self-center font-medium", t.change24h >= 0 ? "text-emerald-400" : "text-rose-400")}>
              {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
            </div>
            <div className="text-right mono text-[11px] self-center text-gray-500">{t.mcap}</div>
            <div className="text-right mono text-[11px] self-center text-gray-500">{t.liq}</div>
            <div className="text-right mono text-[11px] self-center text-gray-500">{t.vol}</div>
            <div className="text-right mono text-[11px] self-center text-gray-600">{t.age}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
