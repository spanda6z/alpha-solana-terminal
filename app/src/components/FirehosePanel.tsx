"use client";

import { useEffect, useState } from "react";
import { fetchFirehoseTokens, type TokenRow } from "../lib/tokens";

type EventRow = TokenRow & { seen: string; kind: "MARKET PULSE" | "NEW TO BOARD" };

export function FirehosePanel({ onSelect }: { onSelect: (t: { mint: string; pairAddress?: string; symbol?: string }) => void }) {
  const [rows, setRows] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const tokens = await fetchFirehoseTokens(30);
    const next = tokens.map((t, i) => ({
      ...t,
      seen: t.age === "<1d" ? (i < 4 ? "<1m" : i < 10 ? "1m" : "2m") : `${Math.max(5, i * 2)}m`,
      kind: Math.abs(t.change24h) > 40 ? "MARKET PULSE" : "NEW / ACTIVE PAIR",
    } as EventRow));
    setRows(next);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2">
        <div>
          <div className="mono text-[12px] font-semibold tracking-wide">FIREHOSE</div>
          <div className="mono mt-0.5 text-[9px] text-[#4a4a4a]">FAST MARKET EVENTS · PUBLIC DEX DATA</div>
        </div>
        <button onClick={load} className="mono text-[9px] text-[#6b6b6b] hover:text-[#ff6b00]">{loading ? "SYNC" : "REFRESH"}</button>
      </div>
      <div className="grid grid-cols-[42px_minmax(100px,1fr)_82px_72px_72px] border-b border-[#1a1a1a] px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d]">
        <div>AGE</div><div>EVENT</div><div>STATUS</div><div className="text-right">MC</div><div className="text-right">24H</div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {rows.map((t) => (
          <button key={t.mint} onClick={() => onSelect({ mint: t.mint, pairAddress: t.pairAddress, symbol: t.symbol })}
            className="grid w-full grid-cols-[42px_minmax(100px,1fr)_82px_72px_72px] border-b border-[#111] px-3 py-2 text-left hover:bg-[#0c0c0c]">
            <div className="mono text-[10px] text-[#6b6b6b]">{t.seen}</div>
            <div className="min-w-0">
              <div className="mono truncate text-[12px] font-medium">{t.symbol}</div>
              <div className="mono truncate text-[8px] text-[#3d3d3d]">{t.kind}</div>
            </div>
            <div className={`mono self-center text-[9px] ${t.verdict === "DANGER" ? "text-[#ff3d57]" : t.verdict === "CAUTION" ? "text-[#fbbf24]" : "text-[#22c55e]"}`}>
              {t.verdict}
            </div>
            <div className="mono self-center text-right text-[10px] text-[#6b6b6b]">{t.mcap}</div>
            <div className={`mono self-center text-right text-[10px] ${t.change24h >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]"}`}>
              {t.change24h >= 0 ? "+" : ""}{t.change24h.toFixed(1)}%
            </div>
          </button>
        ))}
        {!loading && rows.length === 0 && <div className="p-8 text-center mono text-[10px] text-[#3d3d3d]">NO EVENTS</div>}
      </div>
    </div>
  );
}
