"use client";

import { useEffect, useState } from "react";
import { X, Loader2, ExternalLink } from "lucide-react";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useSwap } from "../hooks/useSwap";
import { useTokenBalance, useSolBalance } from "../hooks/useTokenBalance";
import { MINTS } from "../lib/jupiter";
import clsx from "clsx";

type DeskTab = "MARKET" | "FLOW" | "LIQUIDITY" | "HOLDERS" | "RISK" | "TX" | "EXECUTION";

export function TokenPanel({
  mint,
  pairAddress,
  symbol,
  onClose,
  onOpenBot,
}: {
  mint: string;
  pairAddress?: string | null;
  symbol?: string;
  onClose: () => void;
  onOpenBot?: () => void;
}) {
  const [side, setSide] = useState<"buy" | "sell">("buy");
  const [amount, setAmount] = useState("0.1");
  const [slippage, setSlippage] = useState(100);
  const [outPreview, setOutPreview] = useState<string | null>(null);
  const [impact, setImpact] = useState<string | null>(null);
  const [deskTab, setDeskTab] = useState<DeskTab>("MARKET");
  const { connected } = useWallet();
  const { buyWithSol, sellForSol, previewQuote, loading, error, lastTx, setError } = useSwap();
  const sol = useSolBalance();
  const token = useTokenBalance(mint);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      const val = parseFloat(amount);
      if (!val || val <= 0 || !mint) {
        setOutPreview(null);
        setImpact(null);
        return;
      }
      try {
        const tokenMint = new PublicKey(mint);
        if (side === "buy") {
          const raw = Math.floor(val * LAMPORTS_PER_SOL);
          const q = await previewQuote(MINTS.SOL, tokenMint, raw);
          if (!cancelled && q) {
            const out = Number(q.outAmount) / Math.pow(10, token.decimals || 6);
            setOutPreview(`≈ ${out.toLocaleString(undefined, { maximumFractionDigits: 4 })}`);
            setImpact(q.priceImpactPct ? `${Number(q.priceImpactPct).toFixed(2)}% impact` : null);
          }
        } else {
          const raw = Math.floor(val * Math.pow(10, token.decimals));
          if (raw <= 0) return;
          const q = await previewQuote(tokenMint, MINTS.SOL, raw);
          if (!cancelled && q) {
            const out = Number(q.outAmount) / LAMPORTS_PER_SOL;
            setOutPreview(`≈ ${out.toFixed(4)} SOL`);
            setImpact(q.priceImpactPct ? `${Number(q.priceImpactPct).toFixed(2)}% impact` : null);
          }
        }
      } catch {
        if (!cancelled) {
          setOutPreview(null);
          setImpact(null);
        }
      }
    };
    const t = setTimeout(run, 300);
    return () => { cancelled = true; clearTimeout(t); };
  }, [amount, side, mint, token.decimals, previewQuote]);

  const handleTrade = async () => {
    if (!connected) return;
    setError?.(null);
    const tokenMint = new PublicKey(mint);
    const val = parseFloat(amount) || 0;
    if (val <= 0) return;
    if (side === "buy") {
      await buyWithSol(tokenMint, val, slippage);
      sol.refresh();
    } else {
      const raw = Math.floor(val * Math.pow(10, token.decimals));
      await sellForSol(tokenMint, raw, slippage);
      token.refresh();
      sol.refresh();
    }
  };

  const setMax = () => {
    if (side === "buy") {
      const max = Math.max(0, sol.balance - 0.01);
      setAmount(max > 0 ? max.toFixed(4) : "0");
    } else {
      setAmount(token.balance > 0 ? token.balance.toString() : "0");
    }
  };

  const [deskData, setDeskData] = useState<any>(null);

  useEffect(() => {
    let cancelled = false;
    async function loadDesk() {
      try {
        const res = await fetch(`/api/data-layer?limit=100&mint=${encodeURIComponent(mint)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const events = (data.events ?? []).filter((e: any) => e.mint === mint);
        if (!cancelled) setDeskData({ ...data, events });
      } catch {}
    }
    loadDesk();
    const id = setInterval(loadDesk, 30000);
    return () => { cancelled = true; clearInterval(id); };
  }, [mint]);

  const chartSrc = pairAddress ? `https://dexscreener.com/solana/${pairAddress}?embed=1&theme=dark&trades=0&info=0` : null;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 h-12 border-b border-[#1a1a1a]">
        <div className="min-w-0">
          <div className="mono text-[11px] tracking-wider text-[#ff6b00]">DESK · {symbol ? symbol.toUpperCase() : "TOKEN"}</div>
          <div className="mono text-[9px] text-[#3d3d3d] truncate max-w-[280px]">{mint}</div>
        </div>
        <div className="flex items-center gap-1">
          {pairAddress && <a href={`https://dexscreener.com/solana/${pairAddress}`} target="_blank" rel="noopener noreferrer" className="p-2 text-[#6b6b6b]"><ExternalLink size={14} /></a>}
          <button onClick={onClose} className="p-2 text-[#6b6b6b]"><X size={16} /></button>
        </div>
      </div>

      <div className="px-3 py-2 border-b border-[#1a1a1a] mono text-[10px] text-[#6b6b6b] flex justify-between">
        <span>SOL {sol.balance.toFixed(4)}</span>
        <span>TOK {token.loading ? "…" : token.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
      </div>

      <div className="h-40 sm:h-44 border-b border-[#1a1a1a] bg-[#050505] relative">
        {chartSrc ? <iframe title="chart" src={chartSrc} className="w-full h-full border-0" allow="clipboard-write" /> : <div className="absolute inset-0 flex items-center justify-center mono text-[9px] text-[#3d3d3d] tracking-widest">NO PAIR · CHART UNAVAILABLE</div>}
      </div>

      <div className="flex overflow-x-auto border-b border-[#1a1a1a]">
        {(["MARKET", "FLOW", "LIQUIDITY", "HOLDERS", "RISK", "TX", "EXECUTION"] as DeskTab[]).map((item) => (
          <button key={item} onClick={() => setDeskTab(item)} className={clsx("shrink-0 px-2.5 py-2 mono text-[9px] tracking-wide border-b-2", deskTab === item ? "border-[#ff6b00] text-[#ff6b00]" : "border-transparent text-[#4a4a4a]")}>{item}</button>
        ))}
      </div>

      {deskTab !== "EXECUTION" ? (
        <DeskIntel tab={deskTab} data={deskData} />
      ) : (
        <div className="p-3 space-y-3 flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 border border-[#1a1a1a]">
            <button onClick={() => { setSide("buy"); setAmount("0.1"); }} className={clsx("py-3 mono text-[12px] tracking-wider", side === "buy" ? "bg-[#ff6b00] text-[#050505] font-semibold" : "text-[#6b6b6b]")}>BUY</button>
            <button onClick={() => { setSide("sell"); setAmount(token.balance > 0 ? String(token.balance) : "0"); }} className={clsx("py-3 mono text-[12px] tracking-wider border-l border-[#1a1a1a]", side === "sell" ? "bg-[#ff3d57] text-white font-semibold" : "text-[#6b6b6b]")}>SELL</button>
          </div>

          <div>
            <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-1.5 flex justify-between"><span>AMOUNT · {side === "buy" ? "SOL" : "TOKEN"}</span>{outPreview && <span className="text-[#6b6b6b]">{outPreview}</span>}</div>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="alpha-input" disabled={loading} inputMode="decimal" />
            {impact && <div className="mono text-[9px] text-[#3d3d3d] mt-1">{impact}</div>}
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {(side === "buy" ? ["0.1", "0.5", "1", "MAX"] : ["25%", "50%", "75%", "MAX"]).map((v) => (
              <button key={v} onClick={() => { if (v === "MAX") setMax(); else if (v.endsWith("%")) setAmount((token.balance * (parseInt(v, 10) / 100)).toString()); else setAmount(v); }} className="py-2.5 mono text-[11px] border border-[#1a1a1a] text-[#6b6b6b]" disabled={loading}>{v}</button>
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="mono text-[9px] text-[#3d3d3d] tracking-wider shrink-0">SLIP</span>
            {[50, 100, 300, 500].map((bps) => <button key={bps} onClick={() => setSlippage(bps)} className={clsx("flex-1 py-2 mono text-[11px] border", slippage === bps ? "border-[#ff6b00] text-[#ff6b00]" : "border-[#1a1a1a] text-[#6b6b6b]")}>{bps / 100}%</button>)}
          </div>

          <button onClick={handleTrade} disabled={!connected || loading} className={clsx("w-full py-3.5 mono text-[13px] font-semibold tracking-wider disabled:opacity-40", side === "buy" ? "bg-[#ff6b00] text-[#050505]" : "bg-[#ff3d57] text-white")}>
            {loading ? <span className="inline-flex items-center gap-2 justify-center"><Loader2 size={14} className="animate-spin" /> EXECUTING</span> : !connected ? "CONNECT WALLET" : `${side === "buy" ? "BUY" : "SELL"} · ${slippage / 100}% SLIP`}
          </button>

          {error && <p className="mono text-[10px] text-[#ff3d57] text-center break-all">{error}</p>}
          {lastTx && <a href={`https://solscan.io/tx/${lastTx}`} target="_blank" rel="noopener noreferrer" className="block mono text-[10px] text-[#ff6b00] text-center">TX → SOLSCAN</a>}

          <div className="border-t border-[#1a1a1a] pt-3">
            <div className="mono text-[9px] text-[#3d3d3d] tracking-wider mb-2">BOT SHORTCUTS</div>
            <div className="grid grid-cols-2 gap-1.5">{["DCA", "GRID", "SHADOW", "LADDER"].map((b) => <button key={b} onClick={onOpenBot} className="py-2.5 mono text-[11px] border border-[#1a1a1a] text-[#6b6b6b]">{b}</button>)}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function DeskIntel({ tab, data }: { tab: DeskTab; data: any }) {
  const events = data?.events ?? [];
  const swaps = events.filter((e: any) => e.kind === "SWAP");
  const buys = swaps.filter((e: any) => e.side === "BUY").length;
  const sells = swaps.filter((e: any) => e.side === "SELL").length;
  const authority = events.find((e: any) => e.kind === "AUTHORITY");
  const meta = authority?.metadata ?? {};
  const pair = events.find((e: any) => e.kind === "NEW_PAIR");
  const pairMeta = pair?.metadata ?? {};
  const usd = (n: any) => !Number.isFinite(Number(n)) ? "—" : Number(n) >= 1e6 ? `${(Number(n)/1e6).toFixed(2)}M` : Number(n) >= 1e3 ? `${(Number(n)/1e3).toFixed(1)}K` : `${Number(n).toFixed(0)}`;
  let rows: [string,string][] = [];
  let note = "Derived from normalized events currently indexed for this mint.";
  if (tab === "MARKET") rows = [["PRICE", pair?.priceUsd ? `${Number(pair.priceUsd).toPrecision(5)}` : "Market feed"],["24H", pairMeta.change24h != null ? `${Number(pairMeta.change24h).toFixed(2)}%` : "Market feed"],["MARKET CAP", usd(pairMeta.marketCap)],["LIQUIDITY", usd(pair?.liquidityUsd)]];
  if (tab === "FLOW") rows = [["BUY EVENTS",String(buys)],["SELL EVENTS",String(sells)],["SWAP EVENTS",String(swaps.length)],["FLOW BIAS", buys+sells ? buys>sells ? "BUY OBSERVED" : sells>buys ? "SELL OBSERVED" : "BALANCED" : "NO SWAPS INDEXED"]];
  if (tab === "LIQUIDITY") rows = [["POOL LIQUIDITY",usd(pair?.liquidityUsd)],["24H VOLUME",usd(pairMeta.volume24h)],["PAIR",pair?.pairAddress ? pair.pairAddress.slice(0,8)+"…" : "—"],["DEPTH",pair?.liquidityUsd ? "OBSERVED" : "INDEXER REQUIRED"]];
  if (tab === "HOLDERS") { rows = [["HOLDER COUNT","INDEXER REQUIRED"],["TOP 10","INDEXER REQUIRED"],["CONCENTRATION","INDEXER REQUIRED"],["DISTRIBUTION","INDEXER REQUIRED"]]; note = "Holder distribution requires token-account indexing; it is not inferred from swap count."; }
  if (tab === "RISK") rows = [["MINT AUTH",meta.mintAuthorityRevoked === true ? "REVOKED" : meta.mintAuthorityRevoked === false ? "ACTIVE" : "INDEXER REQUIRED"],["FREEZE AUTH",meta.freezeAuthorityRevoked === true ? "REVOKED" : meta.freezeAuthorityRevoked === false ? "ACTIVE" : "INDEXER REQUIRED"],["TOKEN PROGRAM",meta.tokenProgram ? String(meta.tokenProgram).slice(0,16)+"…" : "INDEXER REQUIRED"],["RISK FLAGS",meta.mintAuthorityRevoked === true && meta.freezeAuthorityRevoked === true ? "AUTHORITIES REVOKED" : "REVIEW"]];
  if (tab === "TX") rows = [["SWAPS",String(swaps.length)],["BUYS",String(buys)],["SELLS",String(sells)],["SIGNATURES",swaps.some((e:any)=>e.signature) ? "AVAILABLE" : "INDEXER REQUIRED"]];
  return <div className="flex-1 overflow-y-auto">
    <section className="grid grid-cols-2 gap-px bg-[#1a1a1a]">{rows.map(([label,value]) => <div key={label} className="bg-[#0a0a0a] p-3"><div className="mono text-[8px] text-[#3d3d3d] tracking-wider">{label}</div><div className="mono text-[11px] mt-2 text-[#bdbdbd]">{value}</div></div>)}</section>
    {tab === "TX" && swaps.length > 0 && <div className="m-3 border border-[#1a1a1a]">{swaps.slice(0,20).map((e:any) => <div key={e.id} className="flex justify-between border-b border-[#111] px-3 py-2 mono text-[9px]"><span className={e.side==="BUY" ? "text-[#22c55e]" : e.side==="SELL" ? "text-[#ff3d57]" : "text-[#888]"}>{e.side}</span><span className="text-[#555]">{e.wallet ? e.wallet.slice(0,6)+"…"+e.wallet.slice(-4) : "—"}</span><span className="text-[#444]">{e.signature ? e.signature.slice(0,8)+"…" : "—"}</span></div>)}</div>}
    <div className="m-3 border border-[#1a1a1a] p-3"><div className="mono text-[9px] text-[#4a4a4a]">DATA STATUS</div><div className="mono mt-2 text-[10px] text-[#666]">{note}</div></div>
  </div>;
}

function deskMetrics(tab: DeskTab): [string, string][] {
  if (tab === "MARKET") return [["PRICE", "Live from market feed"], ["24H", "Live from market feed"], ["MARKET CAP", "Live from market feed"], ["AGE", "Live from market feed"]];
  if (tab === "FLOW") return [["BUY / SELL", "Indexer required"], ["VOLUME QUALITY", "Indexer required"], ["LARGE TRADES", "Indexer required"], ["FLOW TREND", "Indexer required"]];
  if (tab === "LIQUIDITY") return [["DEPTH", "Indexer required"], ["POOL LIQUIDITY", "Market feed"], ["IMPACT", "Quote preview"], ["LP RISK", "Indexer required"]];
  if (tab === "HOLDERS") return [["HOLDERS", "Indexer required"], ["TOP 10", "Indexer required"], ["CONCENTRATION", "Indexer required"], ["DISTRIBUTION", "Indexer required"]];
  if (tab === "RISK") return [["CONTRACT", "Indexer required"], ["MINT AUTH", "Indexer required"], ["FREEZE AUTH", "Indexer required"], ["RISK FLAGS", "Indexer required"]];
  return [["RECENT TX", "Indexer required"], ["SWAPS", "Indexer required"], ["TRANSFERS", "Indexer required"], ["WALLETS", "Indexer required"]];
}
