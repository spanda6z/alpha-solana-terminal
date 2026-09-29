"use client";

import { useEffect, useState } from "react";

type Section = "CREATORS" | "WALLETS" | "LAUNCH HISTORY";
type Wallet = { wallet:string; swaps:number; buys:number; sells:number; tokens:number; lastSeen:number };
type Launch = { mint:string; symbol:string; name:string; createdAt:number; pairAddress?:string; liquidityUsd?:number; dex?:string; authority?:string; mintAuthorityRevoked?:boolean; freezeAuthorityRevoked?:boolean };

function short(v?: string) { return v ? `${v.slice(0, 6)}…${v.slice(-4)}` : "—"; }
function usd(v?: number) { if (!Number.isFinite(v)) return "—"; if ((v ?? 0) >= 1e6) return `$${((v ?? 0)/1e6).toFixed(2)}M`; if ((v ?? 0) >= 1e3) return `$${((v ?? 0)/1e3).toFixed(1)}K`; return `$${(v ?? 0).toFixed(0)}`; }
function ago(v:number) { const s=Math.max(0,Math.floor((Date.now()-v)/1000)); if(s<60)return "<1m"; if(s<3600)return `${Math.floor(s/60)}m`; if(s<86400)return `${Math.floor(s/3600)}h`; return `${Math.floor(s/86400)}d`; }

export function RapSheetPanel() {
  const [section, setSection] = useState<Section>("CREATORS");
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch("/api/rap-sheet?limit=80", { cache: "no-store" });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWallets(data.wallets ?? []);
      setLaunches(data.launches ?? []);
    } catch {
      setWallets([]); setLaunches([]);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); const id=setInterval(load,30000); return()=>clearInterval(id); }, []);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-[#1a1a1a] px-3 py-3">
        <div>
          <div className="mono text-[12px] font-semibold tracking-wide">RAP SHEET</div>
          <div className="mono mt-1 text-[9px] text-[#4a4a4a]">OBSERVED ACTIVITY · NO UNVERIFIED IDENTITY CLAIMS</div>
        </div>
        <button onClick={load} className="mono text-[9px] text-[#666] hover:text-[#ff6b00]">{loading ? "SYNC" : "REFRESH"}</button>
      </div>
      <div className="flex overflow-x-auto border-b border-[#1a1a1a]">
        {(["CREATORS","WALLETS","LAUNCH HISTORY"] as Section[]).map(s =>
          <button key={s} onClick={()=>setSection(s)} className={`shrink-0 border-b-2 px-3 py-2 mono text-[10px] tracking-wide ${section===s ? "border-[#ff6b00] text-[#ff6b00]" : "border-transparent text-[#6b6b6b]"}`}>{s}</button>
        )}
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] border-b border-[#151515] px-3 py-1.5 mono text-[8px] tracking-wider text-[#3d3d3d]">
        {section==="CREATORS" ? <><div>OBSERVED ACTOR</div><div>SWAPS</div><div>BUY / SELL</div></> :
         section==="WALLETS" ? <><div>WALLET</div><div>SWAPS</div><div>BUY / SELL</div></> :
         <><div>LAUNCH</div><div>AGE</div><div>LIQ</div></>}
      </div>

      <div className="flex-1 overflow-y-auto">
        {section !== "LAUNCH HISTORY" && wallets.map(w =>
          <div key={w.wallet} className="grid grid-cols-[1fr_auto_auto] border-b border-[#111] px-3 py-3">
            <div><div className="mono text-[11px] text-[#e5e5e5]">{short(w.wallet)}</div><div className="mono mt-1 text-[8px] text-[#444]">OBSERVED IN SWAP EVENTS · {w.tokens} TOKEN EVENTS</div></div>
            <div className="mono self-center px-3 text-[10px] text-[#888]">{w.swaps}</div>
            <div className="mono self-center text-[10px]"><span className="text-[#22c55e]">{w.buys}</span> <span className="text-[#555]">/</span> <span className="text-[#ff3d57]">{w.sells}</span></div>
          </div>
        )}

        {section === "LAUNCH HISTORY" && launches.map(l =>
          <div key={l.mint} className="border-b border-[#111] px-3 py-3">
            <div className="grid grid-cols-[1fr_auto_auto]">
              <div><div className="mono text-[11px] text-[#e5e5e5]">{l.symbol} <span className="text-[#444]">{short(l.mint)}</span></div><div className="mono mt-1 text-[8px] text-[#444]">{ago(l.createdAt)} · {(l.dex ?? "DEX").toUpperCase()}</div></div>
              <div className="mono self-center px-3 text-[10px] text-[#888]">{usd(l.liquidityUsd)}</div>
              <div className="mono self-center text-[9px] text-[#666]">{l.mintAuthorityRevoked === undefined ? "—" : l.mintAuthorityRevoked ? "MINT REVOKED" : "MINT ACTIVE"}</div>
            </div>
            {l.authority && <div className="mono mt-2 text-[8px] text-[#555]">AUTHORITY {short(l.authority)} · FREEZE {l.freezeAuthorityRevoked ? "REVOKED" : "ACTIVE"}</div>}
          </div>
        )}

        {!loading && ((section==="LAUNCH HISTORY" && launches.length===0) || (section!=="LAUNCH HISTORY" && wallets.length===0)) &&
          <div className="p-8 text-center mono text-[10px] text-[#3d3d3d]">NO INDEXED ACTIVITY</div>}
      </div>
    </div>
  );
}
