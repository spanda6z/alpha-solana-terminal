"use client";

import { useEffect, useMemo, useState } from "react";
import clsx from "clsx";
import { fetchTrendingTokens, fetchWatchlistTokens, type TokenRow, type Verdict } from "../lib/tokens";

type View = "ALL" | "SAFE" | "FLAGGED" | "ALIVE";
type Lane = "LEADERS" | "LIVE" | "WATCHLIST";
type Sort = "24H" | "MC" | "LIQ" | "VOL";

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
  const [lane, setLane] = useState<Lane>("LEADERS");
  const [view, setView] = useState<View>("ALL");
  const [sort, setSort] = useState<Sort>("24H");
  const [rows, setRows] = useState<TokenRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    const data = lane === "WATCHLIST" ? await fetchWatchlistTokens() : await fetchTrendingTokens(40);
    setRows(data);
    setUpdatedAt(new Date());
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 45000);
    return () => clearInterval(id);
  }, [lane]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const next = rows.filter((t) => {
      if (view === "SAFE" && !(t.verdict === "SAFE" || t.verdict === "BLUE CHIP")) return false;
      if (view === "FLAGGED" && !(t.verdict === "CAUTION" || t.verdict === "DANGER")) return false;
      if (view === "ALIVE" && !["<1d", "1d"].includes(t.age)) return false;
      if (!query) return true;
      return t.symbol.toLowerCase().includes(query) || t.name.toLowerCase().includes(query) || t.mint.toLowerCase().includes(query);
    });

    return next.sort((a, b) => {
      if (sort === "24H") return b.change24h - a.change24h;
      if (sort === "MC") return parseMoney(b.mcap) - parseMoney(a.mcap);
      if (sort === "LIQ") return parseMoney(b.liq) - parseMoney(a.liq);
      return parseMoney(b.vol) - parseMoney(a.vol);
    });
  }, [rows, view, q, sort]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2">
        <div>
          <div className="mono text-[12px] font-semibold tracking-wide">MARKET</div>
          <div className="mono text-[9px] text-[#4a4a4a] mt-0.5">DISCOVERY · {rows.length || "—"} TOKENS INDEXED</div>
        </div>
        <div className="mono text-[9px] text-[#6b6b6b]"><span className="text-[#22c55e]">●</span> NODE LIVE</div>
      </div>

      <div className="flex items-center gap-0 border-b border-[#1a1a1a] overflow-x-auto">
        {(["LEADERS", "LIVE", "WATCHLIST"] as Lane[]).map((item) => (
          <button key={item} onClick={() => setLane(item)} className={clsx("px-3 py-2 mono text-[10px] tracking-wider border-b-2 shrink-0", lane === item ? "border-[#ff6b00] text-[#ff6b00]" : "border-transparent text-[#6b6b6b]")}>{item}</button>
        ))}
      </div>

      <div className="flex items-center gap-0 border-b border-[#1a1a1a] overflow-x-auto">
        {(["ALL", "SAFE", "FLAGGED", "ALIVE"] as View[]).map((item) => (
          <button key={item} onClick={() => setView(item)} className={clsx("px-3 py-2 mono text-[9px] tracking-wider shrink-0", view === item ? "text-[#ececec]" : "text-[#4a4a4a]")}>{item}</button>
        ))}
        <div className="ml-auto flex items-center gap-1 px-2">
          <span className="mono text-[8px] text-[#3d3d3d]">SORT</span>
          {(["24H", "MC", "LIQ", "VOL"] as Sort[]).map((item) => (
            <button key={item} onClick={() => setSort(item)} className={clsx("px-1.5 py-1 mono text-[8px]", sort === item ? "text-[#ff6b00]" : "text-[#4a4a4a]")}>{item}</button>
          ))}
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#1a1a1a]">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="SEARCH TOKEN / MINT" className="w-full bg-[#090909] border border-[#1d1d1d] px-3 py-2 mono text-[11px] text-[#ececec] outline-none focus:border-[#ff6b00] placeholder:text-[#3d3d3d] rounded-sm" />
      </div>

      <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_72px_88px_76px_76px_76px_60px_64px] gap-0 px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d] border-b border-[#1a1a1a] uppercase">
        <div>TOKEN</div><div>STATUS</div><div className="text-right">MC</div><div className="text-right">24H</div><div className="text-right">LIQ</div><div className="text-right">VOL</div><div className="text-right">AGE</div><div className="text-right">DESK</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && rows.length === 0 && <div className="p-10 text-center mono text-[10px] text-[#3d3d3d]">SYNCING MARKET…</div>}
        {!loading && filtered.length === 0 && <div className="p-10 text-center mono text-[10px] text-[#3d3d3d]">NO MATCHES</div>}

        {filtered.map((t) => (
          <div key={t.mint} className={clsx("border-b border-[#111] hover:bg-[#0b0b0b]", selected === t.mint && "bg-[#0d0d0d]")}>
            <div className="hidden md:grid grid-cols-[minmax(0,1.5fr)_72px_88px_76px_76px_76px_60px_64px] gap-0 px-3 py-2">
              <button onClick={() => onSelect({ mint: t.mint, pairAddress: t.pairAddress, symbol: t.symbol })} className="flex min-w-0 items-center gap-2 text-left">
                {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-5 h-5 rounded-sm bg-[#111] object-cover shrink-0" /> : <div className="w-5 h-5 rounded-sm bg-[#1a1a1a] shrink-0" />}
                <div className="min-w-0"><div className="mono text-[12px] font-medium truncate">{t.symbol}</div><div className="mono text-[8px] text-[#3d3d3d] truncate">{t.name}</div></div>
              </button>
              <div className={clsx("mono text-[9px] self-center", verdictMark[t.verdict])}>{t.verdict === "BLUE CHIP" ? "BLUE" : t.verdict}</div>
              <div className="mono text-[10px] self-center text-right text-[#6b6b6b]">{t.mcap}</div>
              <div className={clsx("mono text-[11px] self-center text-right", t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]")}>{t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%</div>
              <div className="mono text-[10px] self-center text-right text-[#6b6b6b]">{t.liq}</div>
              <div className="mono text-[10px] self-center text-right text-[#6b6b6b]">{t.vol}</div>
              <div className="mono text-[9px] self-center text-right text-[#4a4a4a]">{t.age}</div>
              <button onClick={() => onSelect({ mint: t.mint, pairAddress: t.pairAddress, symbol: t.symbol })} className="mono text-[9px] self-center text-right text-[#ff6b00] hover:underline">$25</button>
            </div>

            <button onClick={() => onSelect({ mint: t.mint, pairAddress: t.pairAddress, symbol: t.symbol })} className="md:hidden w-full grid grid-cols-[minmax(0,1fr)_72px_58px] gap-2 px-3 py-3 text-left">
              <div className="flex items-center gap-2.5 min-w-0">
                {t.imageUrl ? <img src={t.imageUrl} alt="" className="w-8 h-8 rounded-md bg-[#111] object-cover shrink-0" /> : <div className="w-8 h-8 rounded-md bg-[#1a1a1a] shrink-0" />}
                <div className="min-w-0"><div className="mono text-[13px] font-medium truncate">{t.symbol}</div><div className={clsx("mono text-[9px]", verdictMark[t.verdict])}>{t.verdict}</div></div>
              </div>
              <div className="mono text-[10px] self-center text-right text-[#6b6b6b]">{t.mcap}</div>
              <div className={clsx("mono text-[11px] self-center text-right", t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]")}>{t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%</div>
            </button>
          </div>
        ))}
      </div>

      <div className="border-t border-[#1a1a1a] px-3 py-1.5 flex justify-between mono text-[8px] text-[#3d3d3d]">
        <span>{updatedAt ? `UPDATED ${updatedAt.toLocaleTimeString()}` : "WAITING FOR DATA"}</span>
        <button onClick={load} className="text-[#6b6b6b] hover:text-[#ff6b00]">REFRESH</button>
      </div>
    </div>
  );
}

function parseMoney(value: string): number {
  const n = Number(value.replace(/[$,]/g, "").trim());
  if (!Number.isFinite(n)) return 0;
  if (value.includes("B")) return n * 1e9;
  if (value.includes("M")) return n * 1e6;
  if (value.includes("K")) return n * 1e3;
  return n;
}
