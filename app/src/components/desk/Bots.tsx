"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

const STRATS = [
  { id: "dca", name: "DCA", desc: "Fixed buys on a schedule." },
  { id: "grid", name: "GRID", desc: "Buy/sell levels across a range." },
  { id: "infinity", name: "INFINITY", desc: "Self-centering grid." },
  { id: "shadow", name: "SHADOW", desc: "Mirror a wallet." },
  { id: "ladder", name: "LADDER", desc: "Rungs below spot." },
  { id: "martingale", name: "MARTINGALE", desc: "Scale in after dips." },
];

export function BotsView() {
  const { connected } = useWallet();
  const [sel, setSel] = useState<(typeof STRATS)[0] | null>(null);
  const [mint, setMint] = useState("");
  const [dep, setDep] = useState("0.5");

  if (sel) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <button onClick={() => setSel(null)} className="mono text-[11px] text-[#8a8a93] mb-4">
          ← STRATEGIES
        </button>
        <h2 className="mono text-[16px] font-semibold text-[#a3e635]">{sel.name}</h2>
        <p className="mono text-[12px] text-[#8a8a93] mt-1 mb-4">{sel.desc}</p>
        <div className="space-y-3">
          <div>
            <div className="mono text-[9px] text-[#52525b] mb-1">MINT</div>
            <input className="desk-input" value={mint} onChange={(e) => setMint(e.target.value)} />
          </div>
          <div>
            <div className="mono text-[9px] text-[#52525b] mb-1">DEPOSIT SOL</div>
            <input type="number" className="desk-input" value={dep} onChange={(e) => setDep(e.target.value)} />
          </div>
          <button
            disabled={!connected || !mint}
            className="w-full py-3 mono text-[12px] font-semibold bg-[#a3e635] text-[#0a0a0b] disabled:opacity-40 rounded"
          >
            {!connected ? "CONNECT" : `CREATE ${sel.name}`}
          </button>
          <p className="mono text-[10px] text-[#52525b] text-center">
            Non-custodial · programs must be deployed to sign on-chain
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="mono text-[14px] font-semibold mb-1">BOTS</h2>
      <p className="mono text-[11px] text-[#8a8a93] mb-4">
        Six strategies · non-custodial when programs are live
      </p>
      <div className="border border-[#1e1e22] divide-y divide-[#1e1e22] rounded overflow-hidden">
        {STRATS.map((s) => (
          <button key={s.id} onClick={() => setSel(s)} className="w-full text-left px-3 py-3.5 active:bg-[#111113]">
            <div className="mono text-[13px] font-medium text-[#a3e635]">{s.name}</div>
            <div className="mono text-[11px] text-[#8a8a93] mt-0.5">{s.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
