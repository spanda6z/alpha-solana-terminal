"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { Star, Zap } from "lucide-react";
import { fetchMarketTokens, searchTokens, type TokenRow } from "@/lib/tokens";
import type { SelectedToken, Filter, Verdict } from "./types";

function toVerdict(risk: string): Verdict {
  if (risk === "LOW") return "SAFE";
  if (risk === "MED") return "CAUTION";
  if (risk === "HIGH") return "DANGER";
  return "UNKNOWN";
}

const verdictColor: Record<Verdict, string> = {
  SAFE: "text-[#22c55e]",
  CAUTION: "text-[#eab308]",
  DANGER: "text-[#ef4444]",
  "BLUE CHIP": "text-[#38bdf8]",
  UNKNOWN: "text-[#52525b]",
};

const stripClass: Record<Verdict, string> = {
  SAFE: "verdict-strip-safe",
  CAUTION: "verdict-strip-caution",
  DANGER: "verdict-strip-danger",
  "BLUE CHIP": "verdict-strip-blue",
  UNKNOWN: "verdict-strip-unknown",
};

function rowToSelected(t: TokenRow): SelectedToken {
  const v = toVerdict(t.risk);
  return {
    mint: t.mint,
    pairAddress: t.pairAddress,
    symbol: t.symbol,
    name: t.name,
    verdict: v,
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
  const [sort, setSort] = useState<"VOL" | "MC" | "24H" | "AGE" | "LIQ">("VOL");

  const load = async () => {
    setLoading(true);
    try {
      let data: TokenRow[];
      if (q.trim().length > 1) data = await searchTokens(q);
      else data = await fetchMarketTokens(80);
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
    if (filter === "ALIVE") r = r.filter((t) => t.liqRaw >= 1000);
    if (filter === "LIQ1K") r = r.filter((t) => t.liqRaw >= 1000);
    if (filter === "BLUE CHIP") r = r.filter((t) => t.verdict === "BLUE CHIP");
    if (filter === "WATCH") r = r.filter((t) => watchlist.includes(t.mint));

    if (sort === "VOL") r.sort((a, b) => b.volRaw - a.volRaw);
    if (sort === "MC") r.sort((a, b) => b.mcapRaw - a.mcapRaw);
    if (sort === "24H") r.sort((a, b) => b.change24h - a.change24h);
    if (sort === "LIQ") r.sort((a, b) => b.liqRaw - a.liqRaw);
    return r;
  }, [rows, filter, sort, watchlist]);

  const pills: Filter[] =
    mode === "firehose"
      ? ["LIQ1K", "ALL", "ALIVE", "FLAGGED"]
      : ["ALL", "SAFE", "FLAGGED", "ALIVE", "BLUE CHIP", "WATCH"];

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#1e1e22] flex items-center justify-between">
        <div className="mono text-[12px] font-semibold tracking-wide">
          {mode === "firehose" ? "FIREHOSE" : "MARKET"}
        </div>
        <div className="mono text-[10px] text-[#8a8a93]">
          <span className="text-[#a3e635]">●</span>{" "}
          {loading ? "SYNCING…" : `${list.length} TOKENS`}
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#1e1e22]">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search token / CA"
          className="desk-input text-[14px]"
        />
      </div>

      <div className="flex gap-1 overflow-x-auto px-2 py-2 border-b border-[#1e1e22]">
        {pills.map((p) => (
          <button
            key={p}
            onClick={() => setFilter(p)}
            className={clsx(
              "px-2.5 py-1 mono text-[10px] tracking-wider rounded-full shrink-0 border transition",
              filter === p
                ? "bg-[#a3e635] text-[#0a0a0b] border-[#a3e635] font-semibold"
                : "border-[#1e1e22] text-[#8a8a93]"
            )}
          >
            {p === "LIQ1K" ? "LIQ > $1K" : p === "WATCH" ? `★ ${watchlist.length}` : p}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-[#1e1e22] mono text-[9px] text-[#52525b]">
        <span className="tracking-wider">SORT</span>
        {(["VOL", "MC", "24H", "LIQ", "AGE"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setSort(s)}
            className={clsx("px-1.5 py-0.5", sort === s ? "text-[#a3e635]" : "text-[#52525b]")}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {loading && !rows.length && (
          <div className="p-10 text-center mono text-[11px] text-[#52525b]">WAITING FOR DATA…</div>
        )}
        {!loading && !list.length && (
          <div className="p-10 text-center mono text-[11px] text-[#52525b]">EMPTY</div>
        )}
        {list.map((t) => {
          const v = t.verdict as Verdict;
          const watched = watchlist.includes(t.mint);
          return (
            <div
              key={t.mint + (t.pairAddress || "")}
              className={clsx("border-b border-[#141416] active:bg-[#111113]", stripClass[v])}
            >
              <div className="flex items-stretch">
                <button
                  className="flex-1 text-left px-3 py-2.5 min-w-0"
                  onClick={() => onOpenToken(rowToSelected(t))}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {t.imageUrl ? (
                      <img
                        src={t.imageUrl}
                        alt=""
                        className="w-7 h-7 rounded-md object-cover bg-[#1e1e22] shrink-0"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-md bg-[#1e1e22] shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span className="mono text-[13px] font-semibold truncate">{t.symbol}</span>
                        <span className={clsx("mono text-[9px] tracking-wide shrink-0", verdictColor[v])}>
                          {v === "BLUE CHIP" ? "BLUE" : v}
                        </span>
                        <span className="mono text-[9px] text-[#52525b] shrink-0">{t.age}</span>
                      </div>
                      <div className="mono text-[10px] text-[#8a8a93] mt-0.5 truncate">
                        V {t.vol} · L {t.liq}
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-2">
                      <div className="mono text-[12px]">{t.mcap}</div>
                      <div
                        className={clsx(
                          "mono text-[11px]",
                          t.change24h >= 0.05
                            ? "text-[#22c55e]"
                            : t.change24h <= -0.05
                            ? "text-[#ef4444]"
                            : "text-[#8a8a93]"
                        )}
                      >
                        {t.change24h >= 0 ? "+" : ""}
                        {t.change24h.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </button>

                <div className="flex flex-col border-l border-[#1e1e22] w-11 shrink-0">
                  <button
                    onClick={() => onToggleWatch(t.mint)}
                    className={clsx(
                      "flex-1 flex items-center justify-center",
                      watched ? "text-[#a3e635]" : "text-[#52525b]"
                    )}
                  >
                    <Star size={14} fill={watched ? "currentColor" : "none"} />
                  </button>
                  <button
                    onClick={() => onQuickBuy?.(rowToSelected(t))}
                    className="flex-1 flex items-center justify-center text-[#52525b] active:text-[#a3e635] border-t border-[#1e1e22]"
                    title="Quick buy"
                  >
                    <Zap size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
