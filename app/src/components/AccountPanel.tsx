"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useSolBalance } from "../hooks/useSolBalance";

export function AccountPanel() {
  const { connected, publicKey } = useWallet();
  const sol = useSolBalance();

  const address = publicKey?.toBase58() ?? null;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1a1a1a] px-3 py-3">
        <div className="mono text-[12px] font-semibold tracking-wide">ACCOUNT</div>
        <div className="mono mt-1 text-[9px] text-[#4a4a4a]">WALLET · POSITIONS · PNL · WATCHLIST · ALERTS</div>
      </div>
      <div className="grid gap-2 p-3 sm:grid-cols-2">
        <div className="border border-[#1a1a1a] p-3">
          <div className="mono text-[9px] text-[#4a4a4a]">WALLET</div>
          <div className="mono mt-2 text-[11px]">{connected && address ? `${address.slice(0, 6)}…${address.slice(-6)}` : "NOT CONNECTED"}</div>
          <div className={`mono mt-2 text-[9px] ${connected ? "text-[#22c55e]" : "text-[#6b6b6b]"}`}>{connected ? "CONNECTED" : "READ-ONLY"}</div>
        </div>
        <div className="border border-[#1a1a1a] p-3">
          <div className="mono text-[9px] text-[#4a4a4a]">SOL BALANCE</div>
          <div className="mono mt-2 text-[16px]">{connected ? sol.balance.toFixed(4) : "—"}</div>
          <div className="mono mt-2 text-[9px] text-[#4a4a4a]">LIVE WALLET STATE</div>
        </div>
      </div>
      <div className="mx-3 grid border border-[#1a1a1a] sm:grid-cols-3">
        {["POSITIONS", "PNL", "WATCHLIST"].map((label) => (
          <div key={label} className="border-b border-[#1a1a1a] p-4 last:border-b-0 sm:border-b-0 sm:border-r sm:last:border-r-0">
            <div className="mono text-[9px] text-[#4a4a4a]">{label}</div>
            <div className="mono mt-3 text-[11px] text-[#6b6b6b]">NO INDEXED DATA</div>
          </div>
        ))}
      </div>
      <div className="mx-3 mt-3 border border-[#1a1a1a] p-4">
        <div className="mono text-[9px] text-[#4a4a4a]">ALERTS</div>
        <div className="mono mt-2 text-[10px] text-[#6b6b6b]">Watchlist and event alerts will appear here.</div>
      </div>
    </div>
  );
}
