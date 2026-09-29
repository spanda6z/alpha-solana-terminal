"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Loader2 } from "lucide-react";

const STRATEGIES = [
  { id: "dca", name: "DCA", desc: "Fixed buys on a schedule.", strategyId: 0 },
  { id: "grid", name: "GRID", desc: "Levels across a range.", strategyId: 1 },
  { id: "infinity", name: "INFINITY", desc: "Grid that re-centers.", strategyId: 2 },
  { id: "shadow", name: "SHADOW", desc: "Mirror a wallet.", strategyId: 3 },
  { id: "ladder", name: "LADDER", desc: "Buys stacked below spot.", strategyId: 4 },
  { id: "martingale", name: "MARTINGALE", desc: "Scale in after drops.", strategyId: 5 },
];

type Strategy = (typeof STRATEGIES)[number];

export function BotPanel() {
  const { connected, publicKey } = useWallet();
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [deposit, setDeposit] = useState("0.5");
  const [tokenMint, setTokenMint] = useState("");
  const [intervalMin, setIntervalMin] = useState("60");
  const [cycles, setCycles] = useState("10");
  const [targetWallet, setTargetWallet] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!connected || !publicKey || !selected) return;
    setBusy(true);
    setMsg(null);
    try {
      await new Promise((r) => setTimeout(r, 600));
      setMsg(`QUEUED ${selected.name} · ${deposit} SOL · DEPLOY PROGRAMS TO SIGN`);
    } catch (e: any) {
      setMsg(e?.message || "FAILED");
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="p-4 max-w-md mx-auto">
        <button
          onClick={() => {
            setSelected(null);
            setMsg(null);
          }}
          className="mono text-[10px] text-[#6b6b6b] hover:text-[#ff6b00] mb-4 tracking-wider"
        >
          ← BACK
        </button>
        <h2 className="mono text-[14px] font-semibold text-[#ff6b00] mb-1">{selected.name}</h2>
        <p className="mono text-[11px] text-[#6b6b6b] mb-5">{selected.desc}</p>

        <div className="space-y-3">
          <div>
            <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1">MINT</div>
            <input value={tokenMint} onChange={(e) => setTokenMint(e.target.value)} className="alpha-input" placeholder="Token mint" />
          </div>
          <div>
            <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1">DEPOSIT SOL</div>
            <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="alpha-input" />
          </div>
          {selected.id === "dca" && (
            <>
              <div>
                <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1">INTERVAL MIN</div>
                <input type="number" value={intervalMin} onChange={(e) => setIntervalMin(e.target.value)} className="alpha-input" />
              </div>
              <div>
                <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1">CYCLES</div>
                <input type="number" value={cycles} onChange={(e) => setCycles(e.target.value)} className="alpha-input" />
              </div>
            </>
          )}
          {selected.id === "shadow" && (
            <div>
              <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1">TARGET</div>
              <input value={targetWallet} onChange={(e) => setTargetWallet(e.target.value)} className="alpha-input" placeholder="Wallet" />
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={!connected || busy || !tokenMint}
            className="w-full py-3 mono text-[12px] font-semibold tracking-wider bg-[#ff6b00] text-[#050505] disabled:opacity-40"
          >
            {busy ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 size={14} className="animate-spin" /> ...
              </span>
            ) : !connected ? (
              "CONNECT"
            ) : (
              `CREATE ${selected.name}`
            )}
          </button>
          {msg && <p className="mono text-[10px] text-[#6b6b6b] text-center">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="mb-4">
        <h2 className="mono text-[14px] font-semibold tracking-tight">BOTS</h2>
        <p className="mono text-[11px] text-[#6b6b6b] mt-1">Preview · on-chain later</p>
      </div>
      <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="w-full text-left px-3 py-3.5 active:bg-[#0c0c0c] transition flex items-start justify-between gap-4"
          >
            <div>
              <div className="mono text-[12px] font-medium text-[#ff6b00]">{s.name}</div>
              <div className="mono text-[11px] text-[#6b6b6b] mt-0.5">{s.desc}</div>
            </div>
            <div className="mono text-[9px] text-[#3d3d3d] shrink-0">#{s.strategyId}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
