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
  UNKNOWN: "text-[#5e5e70]",
};

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
  mode,
  onOpenToken,
  onQuickBuy,
  watchlist,
  onToggleWatch,
  onOpenLeaders,
}: {
  mode: "market" | "firehose";
  onOpenToken: (t: SelectedToken) => void;
  onQuickBuy?: (t: SelectedToken) => void;
  watchlist: string[];
  onToggleWatch: (mint: string) => void;
  onOpenLeaders?: () => void;
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
    let r = rows.map((t) => {
      let verdict = toVerdict(t.risk);
      if (t.liqRaw >= 500000 && (verdict === "SAFE" || verdict === "UNKNOWN"))
        verdict = "BLUE CHIP";
      return { ...t, verdict };
    });
    if (filter === "SAFE") r = r.filter((t) => t.verdict === "SAFE" || t.verdict === "BLUE CHIP");
    if (filter === "FLAGGED") r = r.filter((t) => t.verdict === "DANGER" || t.verdict === "CAUTION");
    if (filter === "ALIVE" || filter === "LIQ1K") r = r.filter((t) => t.liqRaw >= 1000);
    if (filter === "BLUE CHIP")
      r = r.filter((t) => t.verdict === "BLUE CHIP" || t.liqRaw >= 500000);
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
          { id: "SAFE", label: "SAFE" },
          { id: "FLAGGED", label: "FLAGGED" },
          { id: "ALIVE", label: "ALIVE" },
          { id: "BLUE CHIP", label: "BLUE CHIP" },
          { id: "WATCH", label: "MY BAG" },
        ];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 flex items-center gap-2 text-[11px] text-[#9898a8] overflow-x-auto border-b border-[#1c1c26]">
        <span className="font-semibold text-[#f3f3f7] shrink-0">
          {loading ? "…" : list.length}
          <span className="font-normal text-[#5e5e70]"> tokens</span>
        </span>
        <button type="button" onClick={() => onOpenLeaders?.()} className="pill text-[10px] !py-1">
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

      <div className="flex items-center gap-3 px-3 py-1.5 text-[10px] text-[#5e5e70] border-b border-[#1c1c26]">
        <span>⇅ SORT</span>
        {(["VOL", "MC", "24H", "AGE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={clsx(sort === s ? "text-[#fbbf24] font-semibold" : "")}
          >
            {s}
            {sort === s ? " ↓" : ""}
          </button>
        ))}
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
                <div className="space-y-1.5 flex flex-col items-end">
                  <div className="skeleton h-3 w-12" />
                  <div className="skeleton h-2.5 w-10" />
                </div>
              </div>
            ))}
          </div>
        )}
        {!loading && !list.length && (
          <div className="p-12 text-center">
            <div className="text-[13px] font-medium text-[#9898a8] mb-1">No tokens match</div>
            <div className="text-[11px] text-[#5e5e70]">Try another filter or refresh</div>
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
                  <img
                    src={t.imageUrl}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover bg-[#18181f] shrink-0"
                  />
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
                  <div className="text-[11px] text-[#9898a8] mt-0.5 truncate">
                    V {t.vol} · {t.price}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-semibold text-[13px] tabular-nums">{t.mcap}</div>
                  <div
                    className={clsx(
                      "text-[11px] font-medium mt-0.5 tabular-nums",
                      t.change24h >= 0.05
                        ? "text-[#34d399]"
                        : t.change24h <= -0.05
                        ? "text-[#f87171]"
                        : "text-[#9898a8]"
                    )}
                  >
                    {t.change24h >= 0 ? "+" : ""}
                    {t.change24h.toFixed(1)}%
                  </div>
                </div>
              </button>
              <button
                onClick={() => onToggleWatch(t.mint)}
                className={clsx("p-1.5", watched ? "text-[#fbbf24]" : "text-[#5e5e70]")}
              >
                <Star size={15} fill={watched ? "currentColor" : "none"} />
              </button>
              <button
                onClick={() => onQuickBuy?.(rowToSelected(t))}
                className="shrink-0 px-2.5 py-1.5 rounded-full border border-[#f59e0b]/70 text-[#fbbf24] text-[10px] font-semibold tracking-wide active:bg-[#f59e0b]/15"
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
