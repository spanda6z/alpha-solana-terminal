"use client";

import { useState, useCallback } from "react";
import { Shell } from "@/components/solbit/Shell";
import { Landing } from "@/components/solbit/Landing";
import { MarketView } from "@/components/solbit/Market";
import { DeskView } from "@/components/solbit/Desk";
import {
  FlowMarket,
  SmartMarket,
  RapSheet,
  WatchView,
} from "@/components/solbit/SimpleViews";
import type { NavId, SelectedToken } from "@/components/solbit/types";
import { searchTokens } from "@/lib/tokens";
import clsx from "clsx";

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [nav, setNav] = useState<NavId>("market");
  const [selected, setSelected] = useState<SelectedToken | null>(null);
  const [watchlist, setWatchlist] = useState<SelectedToken[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const [searchHits, setSearchHits] = useState<SelectedToken[]>([]);
  const [status, setStatus] = useState("READY");

  const openDesk = useCallback((t: SelectedToken) => {
    setSelected(t);
    setNav("desk");
    setWatchlist((w) => {
      if (w.some((x) => x.mint === t.mint)) return w;
      return [t, ...w].slice(0, 12);
    });
    setStatus(`DESK · ${t.symbol || t.mint.slice(0, 6)}`);
    setSearchOpen(false);
  }, []);

  const onNav = (n: NavId) => {
    if (n === "landing") {
      setEntered(false);
      return;
    }
    setNav(n);
    if (n !== "desk") setStatus(n.toUpperCase());
    if (n === "desk" && !selected) setStatus("DESK · SELECT TOKEN FROM MARKET");
  };

  const runSearch = async (q: string) => {
    setSearchQ(q);
    if (q.trim().length < 2) {
      setSearchHits([]);
      return;
    }
    const rows = await searchTokens(q);
    setSearchHits(
      rows.slice(0, 12).map((r) => ({
        mint: r.mint,
        symbol: r.symbol,
        name: r.name,
        pairAddress: r.pairAddress,
      }))
    );
  };

  if (!entered) {
    return <Landing onEnter={() => setEntered(true)} />;
  }

  return (
    <>
      <Shell
        nav={nav}
        onNav={onNav}
        onSearch={() => setSearchOpen(true)}
        status={status}
        watchlist={watchlist}
        onSelectWatch={openDesk}
      >
        {nav === "market" && <MarketView onOpenDesk={openDesk} />}
        {nav === "desk" && selected && (
          <div className={clsx("h-full", "desk-overlay md:static")}>
            <DeskView
              token={selected}
              onClose={() => {
                setSelected(null);
                setNav("market");
              }}
              onBack={() => setNav("market")}
            />
          </div>
        )}
        {nav === "desk" && !selected && (
          <div className="p-6 mono text-[12px] text-[#8b909a]">
            Select a token from MARKET to open DESK.
          </div>
        )}
        {nav === "flow" && <FlowMarket />}
        {nav === "smart" && <SmartMarket />}
        {nav === "rap" && <RapSheet />}
        {nav === "watch" && (
          <WatchView
            items={watchlist}
            onOpen={(mint) => {
              const t = watchlist.find((x) => x.mint === mint);
              if (t) openDesk(t);
            }}
          />
        )}
      </Shell>

      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-start justify-center pt-16 px-4">
          <div className="w-full max-w-lg border border-[#1c1e24] bg-[#0c0d10]">
            <div className="flex items-center justify-between px-3 py-2 border-b border-[#1c1e24]">
              <span className="mono text-[11px] text-[#3d9eff]">SEARCH</span>
              <button
                onClick={() => setSearchOpen(false)}
                className="mono text-[10px] text-[#8b909a]"
              >
                CLOSE
              </button>
            </div>
            <div className="p-3">
              <input
                autoFocus
                value={searchQ}
                onChange={(e) => runSearch(e.target.value)}
                placeholder="Token / CA / symbol"
                className="sb-input"
              />
            </div>
            <div className="max-h-72 overflow-y-auto border-t border-[#1c1e24]">
              {searchHits.map((h) => (
                <button
                  key={h.mint}
                  onClick={() => openDesk(h)}
                  className="w-full text-left px-3 py-3 border-b border-[#111318] mono text-[12px] hover:bg-[#111318]"
                >
                  <span className="text-[#e8eaed]">{h.symbol}</span>
                  <span className="text-[#4a4f5a] ml-2 text-[10px]">{h.name}</span>
                  <div className="text-[9px] text-[#4a4f5a] mt-0.5">Open Desk →</div>
                </button>
              ))}
              {searchQ.length > 1 && !searchHits.length && (
                <div className="p-4 mono text-[11px] text-[#4a4f5a]">NO RESULTS</div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
