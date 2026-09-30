"use client";

import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import type { NavId } from "./types";
import clsx from "clsx";

const DESKTOP_NAV: { id: NavId; label: string }[] = [
  { id: "discover", label: "DISCOVER" },
  { id: "markets", label: "MARKETS" },
  { id: "firehose", label: "FIREHOSE" },
  { id: "smart", label: "SMART MONEY" },
  { id: "watch", label: "WATCH" },
  { id: "bots", label: "BOTS" },
];

const MOBILE_NAV: { id: NavId; label: string }[] = [
  { id: "discover", label: "HOME" },
  { id: "markets", label: "DISCOVER" },
  { id: "firehose", label: "FIREHOSE" },
  { id: "watch", label: "WATCH" },
  { id: "smart", label: "MORE" },
];

export function Shell({
  nav,
  onNav,
  onSearch,
  children,
  hideMobileNav,
}: {
  nav: NavId;
  onNav: (n: NavId) => void;
  onSearch: () => void;
  children: React.ReactNode;
  hideMobileNav?: boolean;
}) {
  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#05070A] text-[#F5F7FA]">
      <header className="h-12 shrink-0 border-b border-[#151B22] flex items-center justify-between px-3 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button onClick={() => onNav("landing")} className="flex items-center gap-2 shrink-0">
            <div className="w-7 h-7 rounded-sm bg-[#3d9eff] flex items-center justify-center mono text-[11px] font-bold text-[#05070A]">
              SB
            </div>
            <div className="hidden sm:block text-left leading-tight">
              <div className="mono text-[12px] font-semibold tracking-tight">SOLBIT</div>
              <div className="mono text-[8px] text-[#4A5560] tracking-wider">MARKET INTELLIGENCE</div>
            </div>
          </button>

          <nav className="hidden md:flex items-stretch h-12 overflow-x-auto">
            {DESKTOP_NAV.map((n) => (
              <button
                key={n.id}
                onClick={() => onNav(n.id)}
                className={clsx(
                  "px-3 mono text-[10px] tracking-wide border-b-2 transition whitespace-nowrap",
                  nav === n.id
                    ? "border-[#3d9eff] text-[#3d9eff]"
                    : "border-transparent text-[#7D8794] hover:text-[#F5F7FA]"
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
            className="mono text-[10px] text-[#7D8794] border border-[#151B22] px-2.5 py-1.5 hover:border-[#3d9eff] hover:text-[#3d9eff]"
          >
            ⌘K
          </button>
          <div className="scale-90 origin-right">
            <WalletMultiButton />
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>

      {!hideMobileNav && (
        <nav className="md:hidden h-[56px] shrink-0 border-t border-[#151B22] bg-[#05070A] flex items-stretch pb-[env(safe-area-inset-bottom)]">
          {MOBILE_NAV.map((n) => (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              className={clsx(
                "flex-1 flex flex-col items-center justify-center mono text-[9px] tracking-wide",
                nav === n.id ? "text-[#3d9eff]" : "text-[#7D8794]"
              )}
            >
              {n.label}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
