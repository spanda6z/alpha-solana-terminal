"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { Loader2, ArrowLeft } from "lucide-react";

const STRATEGIES = [
  { id: "dca", name: "DCA", desc: "Buy a fixed amount on a schedule. Build size without timing.", strategyId: 0, tag: "Core" },
  { id: "grid", name: "Grid", desc: "Buy & sell levels across a range. Harvest volatility.", strategyId: 1, tag: "Core" },
  { id: "infinity", name: "Infinity Grid", desc: "Grid that re-centers as price trends.", strategyId: 2, tag: "Adv" },
  { id: "shadow", name: "Shadow", desc: "Mirror a smart-money wallet at your size.", strategyId: 3, tag: "Copy" },
  { id: "ladder", name: "Ladder", desc: "Staggered buys below spot. Catch the dip.", strategyId: 4, tag: "Core" },
  { id: "martingale", name: "Martingale", desc: "Scale in after drops. High risk / reward.", strategyId: 5, tag: "Risk" },
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
      await new Promise((r) => setTimeout(r, 700));
      setMsg(`${selected.name} ready for ${publicKey.toBase58().slice(0, 6)}… · ${deposit} SOL. Deploy programs to sign on-chain.`);
    } catch (e: any) {
      setMsg(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="p-5 max-w-md mx-auto">
        <button onClick={() => { setSelected(null); setMsg(null); }} className="flex items-center gap-1.5 text-[12px] text-gray-500 hover:text-violet-300 mb-5 transition">
          <ArrowLeft size={14} /> All strategies
        </button>
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-semibold tracking-tight">Create {selected.name}</h2>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.05] text-gray-500 uppercase tracking-wide">{selected.tag}</span>
          </div>
          <p className="text-[13px] text-gray-500 leading-relaxed">{selected.desc}</p>
        </div>
        <div className="space-y-3.5">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">Token mint</label>
            <input value={tokenMint} onChange={(e) => setTokenMint(e.target.value)} placeholder="Mint address" className="field-input mono" />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">Deposit (SOL)</label>
            <input type="number" value={deposit} onChange={(e) => setDeposit(e.target.value)} className="field-input mono" />
          </div>
          {selected.id === "dca" && (
            <>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">Interval (minutes)</label>
                <input type="number" value={intervalMin} onChange={(e) => setIntervalMin(e.target.value)} className="field-input mono" />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">Total cycles</label>
                <input type="number" value={cycles} onChange={(e) => setCycles(e.target.value)} className="field-input mono" />
              </div>
            </>
          )}
          {selected.id === "shadow" && (
            <div>
              <label className="text-[10px] uppercase tracking-wider text-gray-600 mb-1.5 block">Target wallet</label>
              <input value={targetWallet} onChange={(e) => setTargetWallet(e.target.value)} placeholder="Wallet to mirror" className="field-input mono" />
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={!connected || busy || !tokenMint}
            className="w-full py-3 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-600/20 disabled:opacity-40 hover:opacity-95 transition"
          >
            {busy ? <><Loader2 size={15} className="animate-spin" /> Creating…</> : !connected ? "Connect wallet" : `Create ${selected.name}`}
          </button>
          {msg && <p className="text-[11px] text-center text-gray-500 break-words leading-relaxed">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold tracking-tight">Bots</h2>
        <p className="text-[13px] text-gray-500 mt-1">Non-custodial strategies. Funds in your vault — withdraw anytime.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="text-left p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:border-violet-500/40 hover:bg-violet-500/[0.04] transition group"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-[14px] group-hover:text-violet-200 transition">{s.name}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.04] text-gray-600 uppercase tracking-wide">{s.tag}</span>
            </div>
            <p className="text-[12px] text-gray-500 leading-relaxed">{s.desc}</p>
            <div className="mt-3 text-[10px] text-gray-700 mono">#{s.strategyId}</div>
          </button>
        ))}
      </div>
      <div className="mt-8 p-4 rounded-2xl border border-white/[0.05] bg-white/[0.015]">
        <h3 className="text-[12px] font-medium text-gray-400 mb-2.5 uppercase tracking-wider">Flow</h3>
        <ol className="text-[12px] text-gray-500 space-y-1.5 list-decimal list-inside leading-relaxed">
          <li>Connect → create bot → deposit into vault</li>
          <li>Params stored on-chain</li>
          <li>Keeper (or you) executes via Jupiter</li>
          <li>1% fee via Alpha Fee Router</li>
          <li>Withdraw & close anytime</li>
        </ol>
      </div>
    </div>
  );
}
