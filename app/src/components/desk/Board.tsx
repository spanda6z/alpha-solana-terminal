"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Star } from "lucide-react";
import { fetchMarketTokens, searchTokens, type TokenRow } from "@/lib/tokens";
import type { SelectedToken, Filter, Verdict } from "./types";

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
  UNKNOWN: "text-[#5c5c72]",
};

function rowToSelected(t: TokenRow): SelectedToken {
  return {
    mint: t.mint,
    pairAddress: t.pairAddress,
    symbol: t.symbol,
    name: t.name,
    verdict: toVerdict(t.risk),
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
  mode,
  onOpenToken,
  onQuickBuy,
  watchlist,
  onToggleWatch,
}: {
  mode: "market" | "firehose";
  onOpenToken: (t: SelectedToken) => void;
  onQuickBuy?: (t: SelectedToken) => void;
  watchlist: string[];
  onToggleWatch: (mint: string) => void;
}) {
  const [filter, setFilter] = useState<Filter>(mode === "firehose" ? "LIQ1K" : "ALL");
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"VOL" | "MC" | "24H" | "AGE">("VOL");

  const load = async () => {
    setLoading(true);
    try {
      const data =
        q.trim().length > 1
          ? await searchTokens(q)
          : await fetchMarketTokens(80, mode === "firehose" ? "new" : "trending");
      setRows(data);
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
  }, [mode]);

  useEffect(() => {
    const t = setTimeout(load, 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    setFilter(mode === "firehose" ? "LIQ1K" : "ALL");
    setSort(mode === "firehose" ? "AGE" : "VOL");
  }, [mode]);

  const list = useMemo(() => {
    let r = rows.map((t) => ({ ...t, verdict: toVerdict(t.risk) }));
    if (filter === "SAFE") r = r.filter((t) => t.verdict === "SAFE" || t.verdict === "BLUE CHIP");
    if (filter === "FLAGGED") r = r.filter((t) => t.verdict === "DANGER" || t.verdict === "CAUTION");
    if (filter === "ALIVE" || filter === "LIQ1K") r = r.filter((t) => t.liqRaw >= 1000);
    if (filter === "BLUE CHIP") r = r.filter((t) => t.verdict === "BLUE CHIP");
    if (filter === "WATCH") r = r.filter((t) => watchlist.includes(t.mint));
    if (sort === "VOL") r.sort((a, b) => b.volRaw - a.volRaw);
    if (sort === "MC") r.sort((a, b) => b.mcapRaw - a.mcapRaw);
    if (sort === "24H") r.sort((a, b) => b.change24h - a.change24h);
    return r;
  }, [rows, filter, sort, watchlist]);

  const pills: { id: Filter; label: string }[] =
    mode === "firehose"
      ? [
          { id: "WATCH", label: "★ WATCHLIST" },
          { id: "LIQ1K", label: "LIQ > $1K" },
          { id: "ALL", label: "ALL" },
          { id: "ALIVE", label: "ALIVE" },
          { id: "FLAGGED", label: "FLAGGED" },
        ]
      : [
          { id: "WATCH", label: "★ WATCHLIST" },
          { id: "ALL", label: "ALL" },
          { id: "SAFE", label: "SAFE" },
          { id: "FLAGGED", label: "FLAGGED" },
          { id: "ALIVE", label: "ALIVE" },
        ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-[#9b9bb0] overflow-x-auto border-b border-[#1a1a28]">
        <span className="font-semibold text-[#f4f4f8] shrink-0">
          {loading ? "…" : list.length}
          <span className="font-normal text-[#5c5c72]"> tokens</span>
        </span>
        <span className="pill text-[10px] !py-1">🏆 LEADERS</span>
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#34d399]" />
          LIVE
        </span>
        <button onClick={load} className="ml-auto text-[#5c5c72] shrink-0">
          ↻
        </button>
      </div>

      <div className="flex gap-1.5 overflow-x-auto px-2.5 py-2 border-b border-[#1a1a28]">
        {pills.map((p) => (
          <button
            key={p.id}
            onClick={() => setFilter(p.id)}
            className={clsx("pill", filter === p.id && "active")}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-[#5c5c72] border-b border-[#1a1a28]">
        <span>⇅ SORT</span>
        {(["VOL", "MC", "24H", "AGE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={clsx(sort === s ? "text-[#a78bfa] font-semibold" : "")}
          >
            {s}
            {sort === s ? " ↓" : ""}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && !rows.length && (
          <div className="p-12 text-center text-[12px] text-[#5c5c72]">Loading market…</div>
        )}
        {!loading && !list.length && (
          <div className="p-12 text-center text-[12px] text-[#5c5c72]">No tokens</div>
        )}
        {list.map((t) => {
          const v = t.verdict as Verdict;
          const watched = watchlist.includes(t.mint);
          return (
            <div
              key={t.mint + (t.pairAddress || "")}
              className="flex items-center gap-2 px-3 py-2.5 border-b border-[#14141e] active:bg-[#12121c]"
            >
              <button
                className="flex-1 flex items-center gap-2.5 min-w-0 text-left"
                onClick={() => onOpenToken(rowToSelected(t))}
              >
                {t.imageUrl ? (
                  <img
                    src={t.imageUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover bg-[#1a1a28] shrink-0"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-[#1a1a28] flex items-center justify-center text-[12px] font-bold text-[#a78bfa] shrink-0">
                    {(t.symbol || "?")[0]}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-semibold text-[14px]">{t.symbol}</span>
                    <span className="text-[10px] text-[#5c5c72]">{t.age}</span>
                    <span className={clsx("text-[10px] font-semibold", verdictCls[v])}>
                      {v === "BLUE CHIP" ? "BLUE CHIP" : v}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#9b9bb0] mt-0.5 truncate">
                    V {t.vol} · {t.price}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-[13px]">{t.mcap}</div>
                  <div
                    className={clsx(
                      "text-[11px] font-medium mt-0.5",
                      t.change24h >= 0.05
                        ? "text-[#34d399]"
                        : t.change24h <= -0.05
                        ? "text-[#f87171]"
                        : "text-[#9b9bb0]"
                    )}
                  >
                    {t.change24h >= 0 ? "+" : ""}
                    {t.change24h.toFixed(1)}%
                  </div>
                </div>
              </button>
              <button
                onClick={() => onToggleWatch(t.mint)}
                className={clsx("p-1.5", watched ? "text-[#a78bfa]" : "text-[#5c5c72]")}
              >
                <Star size={15} fill={watched ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => onQuickBuy?.(rowToSelected(t))}
                className="shrink-0 px-2.5 py-1.5 rounded-full border border-[#8b5cf6] text-[#a78bfa] text-[11px] font-semibold"
              >
                $25
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
