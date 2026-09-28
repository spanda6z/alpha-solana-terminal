"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import clsx from "clsx";
import { Loader2 } from "lucide-react";

const STRATEGIES = [
  { id: "dca", name: "DCA", desc: "Buy a fixed amount on a schedule. Perfect for accumulating.", strategyId: 0 },
  { id: "grid", name: "Grid", desc: "Place buy & sell levels across a price range. Harvest volatility.", strategyId: 1 },
  { id: "infinity", name: "Infinity Grid", desc: "Grid that automatically re-centers as price moves.", strategyId: 2 },
  { id: "shadow", name: "Shadow", desc: "Mirror a smart-money wallet. Copy trades at your size.", strategyId: 3 },
  { id: "ladder", name: "Ladder", desc: "Buy the dip with multiple rungs below current price.", strategyId: 4 },
  { id: "martingale", name: "Martingale", desc: "Double down after dips. High risk, high reward.", strategyId: 5 },
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
      await new Promise((r) => setTimeout(r, 800));
      setMsg(
        `Ready: ${selected.name} bot for ${publicKey.toBase58().slice(0, 8)}… ` +
          `Deposit ${deposit} SOL. Deploy programs first, then this will sign on-chain.`
      );
    } catch (e: any) {
      setMsg(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  };

  if (selected) {
    return (
      <div className="p-6 max-w-lg mx-auto">
        <button
          onClick={() => {
            setSelected(null);
            setMsg(null);
          }}
          className="text-xs text-gray-500 hover:text-violet-300 mb-4"
        >
          ← Back
        </button>
        <h2 className="text-xl font-semibold mb-1">Create {selected.name}</h2>
        <p className="text-sm text-gray-400 mb-6">{selected.desc}</p>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-gray-500 block mb-1">Token mint</label>
            <input
              value={tokenMint}
              onChange={(e) => setTokenMint(e.target.value)}
              placeholder="Paste mint address"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-xs text-gray-500 block mb-1">Deposit (SOL)</label>
            <input
              type="number"
              value={deposit}
              onChange={(e) => setDeposit(e.target.value)}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
            />
          </div>

          {selected.id === "dca" && (
            <>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Interval (minutes)</label>
                <input
                  type="number"
                  value={intervalMin}
                  onChange={(e) => setIntervalMin(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 block mb-1">Total cycles</label>
                <input
                  type="number"
                  value={cycles}
                  onChange={(e) => setCycles(e.target.value)}
                  className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-violet-500"
                />
              </div>
            </>
          )}

          {selected.id === "shadow" && (
            <div>
              <label className="text-xs text-gray-500 block mb-1">Target wallet</label>
              <input
                value={targetWallet}
                onChange={(e) => setTargetWallet(e.target.value)}
                placeholder="Wallet to mirror"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2.5 text-sm font-mono focus:outline-none focus:border-violet-500"
              />
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!connected || busy || !tokenMint}
            className={clsx(
              "w-full py-3 rounded-lg font-semibold text-sm flex items-center justify-center gap-2",
              "bg-violet-600 hover:bg-violet-500 text-white disabled:opacity-50"
            )}
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Creating…
              </>
            ) : !connected ? (
              "Connect wallet"
            ) : (
              `Create ${selected.name} bot`
            )}
          </button>

          {msg && <p className="text-xs text-center text-gray-400 break-words">{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Bots</h2>
      <p className="text-sm text-gray-400 mb-6">
        Non-custodial strategies. Funds stay in your vault. Withdraw anytime.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s)}
            className="text-left p-4 rounded-xl border border-gray-800 bg-[#0d0e14] hover:border-violet-500/50 hover:bg-violet-950/20 transition group"
          >
            <div className="font-medium mb-1 group-hover:text-violet-300">{s.name}</div>
            <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            <div className="mt-3 text-[10px] text-gray-600 font-mono">strategy #{s.strategyId}</div>
          </button>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-xl border border-gray-800 bg-gray-900/40">
        <h3 className="text-sm font-medium mb-2">How it works</h3>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Connect wallet → create bot → deposit into the vault</li>
          <li>Strategy config is stored on-chain</li>
          <li>Keeper (or you) executes cycles via Jupiter</li>
          <li>1% fee via Alpha Fee Router on every fill</li>
          <li>Withdraw & close anytime</li>
        </ol>
      </div>
    </div>
  );
}
