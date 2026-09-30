"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { NavId, SelectedToken } from "./types";
import clsx from "clsx";

const NAV: { id: NavId; label: string }[] = [
  { id: "market", label: "MARKET" },
  { id: "desk", label: "DESK" },
  { id: "flow", label: "FLOW" },
  { id: "smart", label: "SMART" },
  { id: "rap", label: "RAP SHEET" },
  { id: "watch", label: "WATCH" },
];

export function Shell({
  nav,
  onNav,
  onSearch,
  children,
  status,
  watchlist,
  onSelectWatch,
}: {
  nav: NavId;
  onNav: (n: NavId) => void;
  onSearch: () => void;
  children: React.ReactNode;
  status?: string;
  watchlist?: SelectedToken[];
  onSelectWatch?: (t: SelectedToken) => void;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#070809] text-[#e8eaed]">
      <header className="h-11 shrink-0 border-b border-[#1c1e24] flex items-center justify-between px-2 sm:px-3 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => onNav("landing")} className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-sm bg-[#3d9eff] flex items-center justify-center mono text-[11px] font-bold text-[#070809]">
              SB
            </div>
            <div className="hidden sm:block text-left">
              <div className="mono text-[12px] font-semibold tracking-tight">SOLBIT</div>
              <div className="mono text-[8px] text-[#4a4f5a] tracking-wider">
                DIGITAL ASSET MARKET TERMINAL
              </div>
            </div>
          </button>

          <nav className="hidden md:flex items-stretch h-11 overflow-x-auto">
            {NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                className={clsx(
                  "px-3 mono text-[10px] tracking-wide border-b-2 transition whitespace-nowrap",
                  nav === n.id
                    ? "border-[#3d9eff] text-[#3d9eff]"
                    : "border-transparent text-[#8b909a] hover:text-[#e8eaed]"
                )}
              >
                {n.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSearch}
            className="mono text-[10px] text-[#8b909a] border border-[#2a2d36] px-2 py-1.5 hover:border-[#3d9eff] hover:text-[#3d9eff]"
          >
            SEARCH
          </button>
          <WalletMultiButton />
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex w-40 shrink-0 flex-col border-r border-[#1c1e24] bg-[#0c0d10]">
          <div className="px-3 py-2 mono text-[9px] text-[#4a4f5a] tracking-wider">WORKSPACE</div>
          {NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={clsx(
                "text-left px-3 py-2 mono text-[11px] transition",
                nav === n.id ? "text-[#3d9eff] bg-[#111318]" : "text-[#8b909a] hover:text-[#e8eaed]"
              )}
            >
              {n.label}
            </button>
          ))}
          <div className="mt-auto border-t border-[#1c1e24] p-2">
            <div className="mono text-[9px] text-[#4a4f5a] mb-1 tracking-wider">WATCHLIST</div>
            {(watchlist || []).slice(0, 6).map((t) => (
              <button
                key={t.mint}
                onClick={() => onSelectWatch?.(t)}
                className="block w-full text-left mono text-[10px] text-[#8b909a] py-1 truncate hover:text-[#3d9eff]"
              >
                {t.symbol || t.mint.slice(0, 6)}
              </button>
            ))}
            {!watchlist?.length && (
              <div className="mono text-[9px] text-[#4a4f5a]">EMPTY</div>
            )}
          </div>
        </aside>

        <div className="flex-1 min-w-0 flex flex-col min-h-0">{children}</div>
      </div>

      <footer className="h-7 shrink-0 border-t border-[#1c1e24] bg-[#0c0d10] px-3 flex items-center gap-4 mono text-[9px] text-[#4a4f5a] overflow-x-auto">
        <span>
          <span className="text-[#22c55e]">●</span> RPC
        </span>
        <span>
          <span className="text-[#22c55e]">●</span> MARKET DATA
        </span>
        <span className="truncate">{status || "SOLBIT"}</span>
      </footer>

      <nav className="md:hidden h-14 shrink-0 border-t border-[#1c1e24] bg-[#0c0d10] flex items-stretch pb-[env(safe-area-inset-bottom)]">
        {(
          [
            { id: "market" as NavId, label: "MARKET" },
            { id: "flow" as NavId, label: "FLOW" },
            { id: "desk" as NavId, label: "DESK" },
            { id: "watch" as NavId, label: "WATCH" },
            { id: "rap" as NavId, label: "RAP" },
          ] as const
        ).map((n) => (
          <button
            key={n.id}
            onClick={() => onNav(n.id)}
            className={clsx(
              "flex-1 mono text-[9px] tracking-wide",
              nav === n.id ? "text-[#3d9eff]" : "text-[#8b909a]"
            )}
          >
            {n.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
