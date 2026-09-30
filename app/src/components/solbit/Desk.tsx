"use client";

import { useState } from "react";
import { X, ExternalLink, Loader2 } from "lucide-react";
import { PublicKey } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "@/hooks/useSwap";
import { useTokenBalance, useSolBalance } from "@/hooks/useTokenBalance";
import type { SelectedToken, DeskTab } from "./types";
import clsx from "clsx";

export function DeskView({
  token,
  onClose,
  onBack,
}: {
  token: SelectedToken;
  onClose: () => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<DeskTab>("overview");
  const tabs: { id: DeskTab; label: string }[] = [
    { id: "overview", label: "OVERVIEW" },
    { id: "flow", label: "FLOW" },
    { id: "holders", label: "HOLDERS" },
    { id: "trades", label: "TRADES" },
    { id: "risk", label: "RISK" },
    { id: "smart", label: "SMART" },
    { id: "dex", label: "DEX" },
  ];

  const chartSrc = token.pairAddress
    ? `https://dexscreener.com/solana/${token.pairAddress}?embed=1&theme=dark&trades=0&info=0`
    : null;

  return (
    <div className="flex flex-col h-full min-h-0 bg-[#070809]">
      <div className="flex items-center justify-between px-3 h-11 border-b border-[#1c1e24]">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="mono text-[10px] text-[#8b909a] hover:text-[#3d9eff]">
            ← MARKET
          </button>
          <div className="min-w-0">
            <div className="mono text-[13px] font-semibold truncate">{token.symbol || "TOKEN"}</div>
            <div className="mono text-[9px] text-[#4a4f5a] truncate max-w-[180px]">{token.mint}</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {token.pairAddress && (
            <a
              href={`https://dexscreener.com/solana/${token.pairAddress}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 text-[#8b909a]"
            >
              <ExternalLink size={14} />
            </a>
          )}
          <button onClick={onClose} className="p-2 text-[#8b909a] md:hidden">
            <X size={16} />
          </button>
        </div>
      </div>

      <div className="flex overflow-x-auto border-b border-[#1c1e24] px-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={clsx(
              "px-2.5 py-2 mono text-[9px] tracking-wider border-b-2 shrink-0",
              tab === t.id
                ? "border-[#3d9eff] text-[#3d9eff]"
                : "border-transparent text-[#8b909a]"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {(tab === "overview" || tab === "flow") && (
          <>
            <div className="h-48 border-b border-[#1c1e24] relative bg-[#0c0d10]">
              {chartSrc ? (
                <iframe title="chart" src={chartSrc} className="w-full h-full border-0" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center mono text-[10px] text-[#4a4f5a]">
                  CHART UNAVAILABLE · NO PAIR
                </div>
              )}
            </div>
            {tab === "flow" && (
              <div className="p-4 space-y-4">
                <div className="mono text-[10px] text-[#4a4f5a] tracking-wider">FLOW</div>
                <div className="mono text-[11px] text-[#8b909a]">
                  OBSERVED BUY/SELL SPLIT REQUIRES TRADE INDEXER.
                </div>
                <div className="mono text-[10px] text-[#4a4f5a]">STATE: INSUFFICIENT DATA</div>
              </div>
            )}
            {tab === "overview" && (
              <div className="p-4 mono text-[11px] text-[#8b909a] space-y-2">
                <p>Investigation workstation. Open FLOW, HOLDERS, RISK, or DEX.</p>
                <p className="text-[10px] text-[#4a4f5a]">
                  Holders and creator history need a dedicated indexer. Chart is live from pair.
                </p>
              </div>
            )}
          </>
        )}

        {tab === "holders" && (
          <div className="p-4">
            <div className="mono text-[12px] font-semibold mb-2">HOLDERS</div>
            <div className="mono text-[11px] text-[#8b909a]">
              Holder distribution requires on-chain indexer. DATA UNAVAILABLE.
            </div>
          </div>
        )}
        {tab === "trades" && (
          <div className="p-4">
            <div className="mono text-[12px] font-semibold mb-2">TRADES</div>
            <div className="mono text-[11px] text-[#8b909a]">
              Live trade tape requires websocket indexer. DATA UNAVAILABLE.
            </div>
          </div>
        )}
        {tab === "risk" && (
          <div className="p-4 space-y-4">
            <div className="mono text-[12px] font-semibold">RISK ANALYSIS</div>
            <div className="mono text-[10px] text-[#4a4f5a] tracking-wider">OBSERVED</div>
            <div className="space-y-2 mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#4a4f5a]">PAIR</span>
                <span>{token.pairAddress ? "LINKED" : "UNKNOWN"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4f5a]">MINT</span>
                <span>{token.mint.slice(0, 8)}…</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4f5a]">CHAIN</span>
                <span>SOLANA</span>
              </div>
            </div>
            <div className="mono text-[10px] text-[#4a4f5a]">
              Mint/freeze authority and concentration need RPC program accounts.
            </div>
            <div className="mono text-[10px] text-[#4a4f5a] tracking-wider mt-4">CONFIDENCE</div>
            <div className="flex justify-between mono text-[11px]">
              <span className="text-[#4a4f5a]">DATA COVERAGE</span>
              <span>LOW</span>
            </div>
          </div>
        )}
        {tab === "smart" && (
          <div className="p-4 space-y-4">
            <div className="mono text-[12px] font-semibold">SMART</div>
            <div className="border border-[#1c1e24] p-3">
              <div className="mono text-[11px]">NO AUTOMATED SIGNAL</div>
              <div className="mono text-[10px] text-[#8b909a] mt-2">
                Behavioral signals require transaction history + wallet clustering.
              </div>
              <div className="mono text-[9px] text-[#4a4f5a] mt-2">
                CONFIDENCE — N/A · EVIDENCE — NONE
              </div>
            </div>
          </div>
        )}
        {tab === "dex" && <DexPanel mint={token.mint} />}
      </div>
    </div>
  );
}

function DexPanel({ mint }: { mint: string }) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [slippage, setSlippage] = useState(100);
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, loading, error, lastTx } = useSwap();
  const sol = useSolBalance();
  const token = useTokenBalance(mint);

  const run = async () => {
    if (!connected) return;
    const m = new PublicKey(mint);
    const v = parseFloat(amount) || 0;
    if (v <= 0) return;
    if (side === "buy") {
      await buyWithSol(m, v, slippage);
      sol.refresh();
    } else {
      await sellForSol(m, Math.floor(v * Math.pow(10, token.decimals)), slippage);
      token.refresh();
      sol.refresh();
    }
  };

  return (
    <div className="p-4 space-y-3">
      <div className="mono text-[12px] font-semibold">DEX</div>
      <div className="mono text-[10px] text-[#8b909a]">
        SOL {sol.balance.toFixed(4)} · TOK{" "}
        {token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
      </div>
      <div className="grid grid-cols-2 border border-[#1c1e24]">
        <button
          onClick={() => setSide("buy")}
          className={clsx(
            "py-2.5 mono text-[11px]",
            side === "buy" ? "bg-[#22c55e] text-[#070809] font-semibold" : "text-[#8b909a]"
          )}
        >
          BUY
        </button>
        <button
          onClick={() => setSide("sell")}
          className={clsx(
            "py-2.5 mono text-[11px] border-l border-[#1c1e24]",
            side === "sell" ? "bg-[#ef4444] text-white font-semibold" : "text-[#8b909a]"
          )}
        >
          SELL
        </button>
      </div>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="sb-input"
        inputMode="decimal"
      />
      <div className="flex gap-1">
        {[50, 100, 300, 500].map((b) => (
          <button
            key={b}
            onClick={() => setSlippage(b)}
            className={clsx(
              "flex-1 py-1.5 mono text-[10px] border",
              slippage === b ? "border-[#3d9eff] text-[#3d9eff]" : "border-[#1c1e24] text-[#8b909a]"
            )}
          >
            {b / 100}%
          </button>
        ))}
      </div>
      <button
        onClick={run}
        disabled={!connected || loading}
        className={clsx(
          "w-full py-3 mono text-[12px] font-semibold disabled:opacity-40",
          side === "buy" ? "bg-[#22c55e] text-[#070809]" : "bg-[#ef4444] text-white"
        )}
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2 size={14} className="animate-spin" /> EXECUTING
          </span>
        ) : !connected ? (
          "CONNECT WALLET"
        ) : (
          `REVIEW · ${side.toUpperCase()}`
        )}
      </button>
      {error && <p className="mono text-[10px] text-[#ef4444]">{error}</p>}
      {lastTx && (
        <a
          href={`https://solscan.io/tx/${lastTx}`}
          target="_blank"
          rel="noreferrer"
          className="block mono text-[10px] text-[#3d9eff] text-center"
        >
          TX → SOLSCAN
        </a>
      )}
      <p className="mono text-[9px] text-[#4a4f5a]">
        Jupiter route · wallet signature required · non-custodial
      </p>
    </div>
  );
}
