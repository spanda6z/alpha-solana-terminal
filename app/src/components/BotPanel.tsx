"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, CircleHelp, Loader2, Plus, ShieldCheck, Zap } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

const STRATEGIES = [
  { id: "dca", name: "DCA", desc: "Fixed buys on a schedule.", strategyId: 0 },
  { id: "grid", name: "GRID", desc: "Levels across a defined range.", strategyId: 1 },
  { id: "infinity", name: "INFINITY V4", desc: "Adaptive grid that re-centers around price.", strategyId: 2 },
  { id: "shadow", name: "SHADOW", desc: "Mirror activity from a target wallet.", strategyId: 3 },
  { id: "ladder", name: "LADDER", desc: "Stack entries below the current price.", strategyId: 4 },
  { id: "martingale", name: "MARTINGALE", desc: "Scale entries after predefined drawdowns.", strategyId: 5 },
] as const;

type Strategy = (typeof STRATEGIES)[number];

function Field({ label, value, onChange, suffix, hint, placeholder }: {
  label: string; value: string; onChange: (value: string) => void;
  suffix?: string; hint?: string; placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="mono text-[9px] tracking-[0.14em] text-[#666]">{label}</span>
        {hint && <span className="mono text-[8px] text-[#383838]">{hint}</span>}
      </div>
      <div className="relative">
        <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="alpha-input pr-16" />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 mono text-[9px] text-[#555]">{suffix}</span>}
      </div>
    </div>
  );
}

export function BotPanel() {
  const { connected, publicKey } = useWallet();
  const [selected, setSelected] = useState<Strategy | null>(null);
  const [tokenMint, setTokenMint] = useState("");
  const [capital, setCapital] = useState("0.5");
  const [gridSize, setGridSize] = useState("8");
  const [step, setStep] = useState("5");
  const [takeProfit, setTakeProfit] = useState("3");
  const [stopLoss, setStopLoss] = useState("15");
  const [recenter, setRecenter] = useState("10");
  const [maxOrders, setMaxOrders] = useState("4");
  const [slippage, setSlippage] = useState("1");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const estimated = useMemo(() => {
    const c = Number(capital) || 0;
    const n = Math.max(1, Number(gridSize) || 1);
    return (c / n).toFixed(3);
  }, [capital, gridSize]);

  const create = async () => {
    if (!connected || !publicKey || !selected) return;
    setBusy(true);
    setMsg(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setBusy(false);
    setMsg("CONFIG READY · DEPLOYMENT API NOT CONNECTED");
  };

  if (selected) {
    const isInfinity = selected.id === "infinity";
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-3 sm:p-5">
          <button onClick={() => { setSelected(null); setMsg(null); }} className="inline-flex items-center gap-1.5 mono text-[9px] tracking-wider text-[#666] hover:text-[#ff6b00] mb-5">
            <ArrowLeft size={12} /> ALL BOTS
          </button>

          <div className="border border-[#1c1c1c] bg-[#080808]">
            <div className="px-4 py-4 border-b border-[#1c1c1c] flex items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-[#ff6b00]" />
                  <h2 className="mono text-[13px] font-semibold tracking-wide">{selected.name}</h2>
                  <span className="mono text-[8px] px-1.5 py-0.5 border border-[#2a2a2a] text-[#666]">V4</span>
                </div>
                <p className="mono text-[9px] text-[#555] mt-1">{selected.desc}</p>
              </div>
              <div className="hidden sm:block mono text-[8px] text-[#444]">{connected ? "WALLET CONNECTED" : "WALLET REQUIRED"}</div>
            </div>

            <div className="grid lg:grid-cols-[1fr_300px]">
              <div className="p-4 space-y-5">
                <section>
                  <div className="mono text-[9px] tracking-[0.16em] text-[#ff6b00] mb-3">01 · MARKET</div>
                  <div className="space-y-3">
                    <Field label="TOKEN MINT" value={tokenMint} onChange={setTokenMint} placeholder="Paste Solana token mint" />
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="CAPITAL" value={capital} onChange={setCapital} suffix="SOL" />
                      <Field label="SLIPPAGE" value={slippage} onChange={setSlippage} suffix="%" />
                    </div>
                  </div>
                </section>

                {isInfinity ? (
                  <>
                    <section>
                      <div className="mono text-[9px] tracking-[0.16em] text-[#ff6b00] mb-3">02 · GRID ENGINE</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="GRID LEVELS" value={gridSize} onChange={setGridSize} suffix="LEVELS" />
                        <Field label="STEP" value={step} onChange={setStep} suffix="%" />
                        <Field label="TAKE PROFIT" value={takeProfit} onChange={setTakeProfit} suffix="%" />
                        <Field label="MAX ORDERS" value={maxOrders} onChange={setMaxOrders} suffix="OPEN" />
                      </div>
                    </section>
                    <section>
                      <div className="mono text-[9px] tracking-[0.16em] text-[#ff6b00] mb-3">03 · PROTECTION</div>
                      <div className="grid grid-cols-2 gap-3">
                        <Field label="STOP LOSS" value={stopLoss} onChange={setStopLoss} suffix="%" />
                        <Field label="RECENTER" value={recenter} onChange={setRecenter} suffix="%" />
                      </div>
                      <div className="mt-3 border border-[#1c1c1c] bg-[#0a0a0a] p-3 flex gap-2.5">
                        <ShieldCheck size={14} className="text-[#6b6b6b] shrink-0 mt-0.5" />
                        <div>
                          <div className="mono text-[9px] text-[#bdbdbd]">RISK CONTROLS</div>
                          <p className="mono text-[8px] leading-4 text-[#4d4d4d] mt-1">Capital is capped by the configured deposit. Orders should never exceed the maximum open-order setting.</p>
                        </div>
                      </div>
                    </section>
                  </>
                ) : (
                  <section>
                    <div className="mono text-[9px] tracking-[0.16em] text-[#ff6b00] mb-3">02 · PARAMETERS</div>
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="SIZE" value={capital} onChange={setCapital} suffix="SOL" />
                      <Field label="SLIPPAGE" value={slippage} onChange={setSlippage} suffix="%" />
                    </div>
                  </section>
                )}

                <section>
                  <div className="mono text-[9px] tracking-[0.16em] text-[#ff6b00] mb-3">04 · REVIEW</div>
                  <div className="border border-[#1c1c1c] divide-y divide-[#161616]">
                    <div className="px-3 py-2.5 flex justify-between mono text-[9px]"><span className="text-[#555]">EST. ORDER SIZE</span><span>{estimated} SOL</span></div>
                    <div className="px-3 py-2.5 flex justify-between mono text-[9px]"><span className="text-[#555]">STRATEGY</span><span>{selected.name}</span></div>
                    <div className="px-3 py-2.5 flex justify-between mono text-[9px]"><span className="text-[#555]">EXECUTION</span><span className="text-[#666]">NOT DEPLOYED</span></div>
                  </div>
                </section>

                <button onClick={create} disabled={!connected || busy || !tokenMint.trim()} className="w-full h-11 bg-[#ff6b00] text-[#050505] disabled:opacity-30 mono text-[10px] font-semibold tracking-[0.12em] flex items-center justify-center gap-2">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                  {busy ? "PREPARING…" : "CREATE " + selected.name}
                </button>
                {msg && <div className="text-center mono text-[8px] tracking-wider text-[#555]">{msg}</div>}
              </div>

              <aside className="border-t lg:border-t-0 lg:border-l border-[#1c1c1c] bg-[#070707] p-4">
                <div className="mono text-[9px] tracking-[0.16em] text-[#555] mb-4">BOT SUMMARY</div>
                <div className="space-y-3">
                  {[
                    ["CAPITAL", capital + " SOL"],
                    ["LEVELS", isInfinity ? gridSize : "—"],
                    ["STEP", isInfinity ? step + "%" : "—"],
                    ["TP", isInfinity ? takeProfit + "%" : "—"],
                    ["SL", isInfinity ? stopLoss + "%" : "—"],
                    ["RECENTER", isInfinity ? recenter + "%" : "—"],
                  ].map(([k, v]) => <div key={k} className="flex justify-between mono text-[9px]"><span className="text-[#444]">{k}</span><span className="text-[#aaa]">{v}</span></div>)}
                </div>
                <div className="mt-6 pt-4 border-t border-[#171717]">
                  <div className="flex gap-2 text-[#555]">
                    <CircleHelp size={13} className="shrink-0" />
                    <p className="mono text-[8px] leading-4">This screen builds the strategy configuration. Live deployment requires the bot execution service.</p>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-3 sm:p-5">
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="mono text-[9px] tracking-[0.16em] text-[#555]">AUTOMATION</div>
            <h2 className="mono text-[14px] font-semibold mt-1">BOTS</h2>
            <p className="mono text-[9px] text-[#555] mt-1">Create a strategy, configure risk, then deploy.</p>
          </div>
          <span className="mono text-[8px] text-[#3f3f3f]">6 STRATEGIES</span>
        </div>

        <div className="border border-[#1a1a1a] divide-y divide-[#1a1a1a]">
          {STRATEGIES.map((s) => (
            <button key={s.id} onClick={() => setSelected(s)} className="w-full text-left px-3 sm:px-4 py-4 hover:bg-[#0b0b0b] transition flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="mono text-[11px] font-semibold text-[#ff6b00]">{s.name}</span>
                  {s.id === "infinity" && <span className="mono text-[7px] px-1.5 py-0.5 border border-[#2b2118] text-[#8a5a32]">ADAPTIVE</span>}
                </div>
                <div className="mono text-[9px] text-[#555] mt-1">{s.desc}</div>
              </div>
              <span className="mono text-[8px] text-[#333] shrink-0">OPEN →</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
