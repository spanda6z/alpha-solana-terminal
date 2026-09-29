"use client";

import { useEffect, useState } from "react";
import type { DataLayerSnapshot, NormalizedEvent } from "../lib/data/types";

function age(ms: number) {
  const seconds = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (seconds < 60) return "<1m";
  if (seconds < 3600) return Math.floor(seconds / 60) + "m";
  if (seconds < 86400) return Math.floor(seconds / 3600) + "h";
  return Math.floor(seconds / 86400) + "d";
}

function usd(n?: number) {
  if (!Number.isFinite(n)) return "—";
  if ((n ?? 0) >= 1e6) return "$" + ((n ?? 0) / 1e6).toFixed(2) + "M";
  if ((n ?? 0) >= 1e3) return "$" + ((n ?? 0) / 1e3).toFixed(1) + "K";
  return "$" + (n ?? 0).toFixed(0);
}

function status(e: NormalizedEvent) {
  const liq = e.liquidityUsd ?? 0;
  const change = Number(e.metadata?.change24h ?? 0);
  if (liq < 5000) return "DANGER";
  if (liq < 50000 || Math.abs(change) > 80) return "CAUTION";
  if (liq > 200000) return "SAFE";
  return "UNKNOWN";
}

export function FirehosePanel({ onSelect }: { onSelect: (t: { mint: string; pairAddress?: string; symbol?: string }) => void }) {
  const [snapshot, setSnapshot] = useState<DataLayerSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/data-layer?limit=40", { cache: "no-store" });
      if (!res.ok) throw new Error("data layer unavailable");
      setSnapshot(await res.json());
    } catch {
      setSnapshot({ events: [], sources: [], generatedAt: Date.now() });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 30000);
    return () => clearInterval(id);
  }, []);

  const rows = snapshot?.events ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-2">
        <div>
          <div className="mono text-[12px] font-semibold tracking-wide">FIREHOSE</div>
          <div className="mono mt-0.5 text-[9px] text-[#4a4a4a]">NORMALIZED EVENTS · PAIRS · SWAPS · AUTHORITY</div>
        </div>
        <div className="flex items-center gap-3">
          <span className="mono text-[8px] text-[#555]">{snapshot?.sources.filter(s => s.enabled).length ?? 0} SOURCES</span>
          <button onClick={load} className="mono text-[9px] text-[#6b6b6b] hover:text-[#ff6b00]">{loading ? "SYNC" : "REFRESH"}</button>
        </div>
      </div>

      <div className="grid grid-cols-[42px_minmax(100px,1fr)_82px_72px_72px] border-b border-[#1a1a1a] px-3 py-1.5 mono text-[9px] tracking-wider text-[#3d3d3d]">
        <div>AGE</div><div>EVENT</div><div>STATUS</div><div className="text-right">LIQ</div><div className="text-right">24H</div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {rows.map((e) => {
          const change = Number(e.metadata?.change24h ?? 0);
          const verdict = status(e);
          return (
            <button key={e.id} onClick={() => e.mint && onSelect({ mint: e.mint, pairAddress: e.pairAddress, symbol: e.symbol })}
              className="grid w-full grid-cols-[42px_minmax(100px,1fr)_82px_72px_72px] border-b border-[#111] px-3 py-2 text-left hover:bg-[#0c0c0c]">
              <div className="mono text-[10px] text-[#6b6b6b]">{age(e.timestamp)}</div>
              <div className="min-w-0">
                <div className="mono truncate text-[12px] font-medium">{e.symbol || "UNKNOWN"}</div>
                <div className="mono truncate text-[8px] text-[#3d3d3d]">{e.kind} · {String(e.metadata?.dex ?? "DEX").toUpperCase()}</div>
              </div>
              <div className={`mono self-center text-[9px] ${verdict === "DANGER" ? "text-[#ff3d57]" : verdict === "CAUTION" ? "text-[#fbbf24]" : verdict === "SAFE" ? "text-[#22c55e]" : "text-[#6b6b6b]"}`}>{verdict}</div>
              <div className="mono self-center text-right text-[10px] text-[#6b6b6b]">{usd(e.liquidityUsd)}</div>
              <div className={`mono self-center text-right text-[10px] ${change >= 0 ? "text-[#22c55e]" : "text-[#ff3d57]"}`}>
                {change >= 0 ? "+" : ""}{change.toFixed(1)}%
              </div>
            </button>
          );
        })}
        {!loading && rows.length === 0 && <div className="p-8 text-center mono text-[10px] text-[#3d3d3d]">NO NORMALIZED EVENTS</div>}
      </div>
    </div>
  );
}
