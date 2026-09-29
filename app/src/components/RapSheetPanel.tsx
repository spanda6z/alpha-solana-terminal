"use client";

import { useState } from "react";

type Section = "CREATORS" | "WALLETS" | "LAUNCH HISTORY";

export function RapSheetPanel() {
  const [section, setSection] = useState<Section>("CREATORS");
  const items = {
    CREATORS: [
      ["CREATOR INTELLIGENCE", "Awaiting verified creator / deployer data"],
      ["FUNDING PATH", "Track first-funder and linked-wallet relationships"],
      ["REPEAT LAUNCHES", "Detect recurring deployers across launches"],
    ],
    WALLETS: [
      ["WALLET INTELLIGENCE", "Awaiting indexed wallet history"],
      ["ACCUMULATION", "Track repeated buys before volume expansion"],
      ["DISTRIBUTION", "Track exits, transfers and linked wallets"],
    ],
    "LAUNCH HISTORY": [
      ["LAUNCH TIMELINE", "Awaiting indexed launch history"],
      ["DEV SELL", "Contract / wallet events will appear here"],
      ["REPEAT DEPLOYER", "Cross-token identity matching will appear here"],
    ],
  }[section];

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[#1a1a1a] px-3 py-3">
        <div className="mono text-[12px] font-semibold tracking-wide">RAP SHEET</div>
        <div className="mono mt-1 text-[9px] text-[#4a4a4a]">CREATOR · WALLET · LAUNCH INTELLIGENCE</div>
      </div>
      <div className="flex overflow-x-auto border-b border-[#1a1a1a]">
        {(["CREATORS", "WALLETS", "LAUNCH HISTORY"] as Section[]).map((s) => (
          <button key={s} onClick={() => setSection(s)} className={`shrink-0 border-b-2 px-3 py-2 mono text-[10px] tracking-wide ${section === s ? "border-[#ff6b00] text-[#ff6b00]" : "border-transparent text-[#6b6b6b]"}`}>{s}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {items.map(([title, detail]) => (
          <div key={title} className="border-b border-[#111] px-3 py-4">
            <div className="mono text-[11px] text-[#ececec]">{title}</div>
            <div className="mono mt-1 text-[9px] leading-5 text-[#4a4a4a]">{detail}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
