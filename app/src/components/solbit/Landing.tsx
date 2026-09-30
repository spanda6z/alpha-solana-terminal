"use client";

import { Disclaimer } from "./Disclaimer";

const CAPABILITIES = [
  {
    title: "DISCOVER",
    body: "Trending, new pairs, gainers, losers, volume and liquidity — sorted from live market data.",
  },
  {
    title: "TOKEN DESK",
    body: "Price, chart, trade tape, holders and risk in one workspace. Open any mint to investigate.",
  },
  {
    title: "FLOW",
    body: "Buy/sell pressure and market health measured from observable activity — not a prediction.",
  },
  {
    title: "RISK",
    body: "Liquidity, concentration and behavior factors with confidence. Explainable, never a black box.",
  },
  {
    title: "FIREHOSE",
    body: "Real-time event stream of launches, swaps and liquidity moves when indexers are connected.",
  },
  {
    title: "WATCH",
    body: "Save tokens and return when conditions change. Alerts layer comes next.",
  },
];

const JOURNEY = ["Discover", "Open desk", "Read chart", "Check flow", "Check risk", "Watch"];

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="terminal-grid-bg min-h-[100dvh] flex flex-col overflow-y-auto">
      <header className="h-12 shrink-0 border-b border-[#151B22] flex items-center justify-between px-4 fade-in">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-[#3d9eff] flex items-center justify-center mono text-[12px] font-bold text-[#05070A]">
            SB
          </div>
          <div>
            <div className="mono text-[13px] font-semibold">SOLBIT</div>
            <div className="mono text-[8px] text-[#4A5560] tracking-wider">SOLANA MARKET INTELLIGENCE</div>
          </div>
        </div>
        <button
          onClick={onEnter}
          className="mono text-[11px] px-3 py-2 bg-[#3d9eff] text-[#05070A] font-semibold active:opacity-90"
        >
          OPEN TERMINAL
        </button>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-10 sm:py-14 max-w-3xl mx-auto w-full">
        <section className="text-center mb-12 sm:mb-16">
          <p className="mono text-[11px] text-[#3d9eff] tracking-[0.22em] mb-4 fade-up">SOLBIT</p>
          <h1 className="mono text-2xl sm:text-4xl font-semibold tracking-tight leading-tight text-[#F5F7FA] fade-up delay-1">
            Every move has a reason.
          </h1>
          <div className="hero-line my-5 max-w-xs mx-auto" />
          <p className="mono text-[13px] sm:text-[14px] text-[#7D8794] leading-relaxed fade-up delay-2 space-y-0.5">
            <span className="block text-[#F5F7FA]/90">See the market.</span>
            <span className="block text-[#F5F7FA]/90">Read the flow.</span>
            <span className="block text-[#F5F7FA]/90">Understand the risk.</span>
          </p>
          <p className="mt-5 mono text-[11px] text-[#4A5560] fade-up delay-3 max-w-md mx-auto leading-relaxed">
            A Solana intelligence terminal for discovery, not a casino. No wallet required to explore.
            No fabricated activity.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center fade-up delay-4">
            <button
              onClick={onEnter}
              className="mono text-[12px] px-6 py-3.5 bg-[#3d9eff] text-[#05070A] font-semibold tracking-wide active:scale-[0.98] transition-transform"
            >
              EXPLORE MARKETS
            </button>
            <button
              onClick={onEnter}
              className="mono text-[12px] px-6 py-3.5 border border-[#151B22] text-[#F5F7FA] hover:border-[#3d9eff] transition-colors"
            >
              OPEN TERMINAL
            </button>
          </div>
        </section>

        <section className="mb-12 sm:mb-16 fade-up delay-5">
          <p className="mono text-[9px] text-[#4A5560] tracking-[0.18em] text-center mb-4">HOW YOU USE IT</p>
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {JOURNEY.map((step, i) => (
              <div key={step} className="flex items-center gap-1.5 sm:gap-2">
                <span className="mono text-[10px] sm:text-[11px] px-2.5 py-1.5 border border-[#151B22] text-[#7D8794]">
                  <span className="text-[#3d9eff] mr-1.5">{i + 1}</span>
                  {step}
                </span>
                {i < JOURNEY.length - 1 && (
                  <span className="text-[#4A5560] mono text-[10px] hidden sm:inline">→</span>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 sm:mb-16 fade-up delay-6">
          <p className="mono text-[9px] text-[#4A5560] tracking-[0.18em] text-center mb-5">WHAT YOU GET</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {CAPABILITIES.map((c) => (
              <div key={c.title} className="sb-panel p-3.5 text-left hover:border-[#1e2630] transition-colors">
                <div className="mono text-[11px] font-semibold text-[#3d9eff] tracking-wide mb-1.5">{c.title}</div>
                <p className="mono text-[11px] text-[#7D8794] leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-12 fade-up delay-7">
          <p className="mono text-[9px] text-[#4A5560] tracking-[0.18em] text-center mb-5">PRINCIPLES</p>
          <div className="sb-panel p-4 space-y-3">
            {[
              ["Real data only", "Prices, trades and holders come from providers — never invented."],
              ["Explainable risk", "Every flag has a reason. Confidence drops when data is missing."],
              ["No buy signals", "Intelligence helps you read the market. It does not tell you to buy."],
              ["Honest empties", "If a feed is offline you see WAITING FOR DATA — not fake activity."],
            ].map(([t, b]) => (
              <div key={t} className="flex gap-3">
                <span className="mono text-[10px] text-[#3d9eff] shrink-0 mt-0.5">▸</span>
                <div>
                  <div className="mono text-[11px] text-[#F5F7FA] font-medium">{t}</div>
                  <div className="mono text-[10px] text-[#4A5560] mt-0.5 leading-relaxed">{b}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-10 fade-up delay-7">
          <Disclaimer />
        </section>

        <section className="text-center pb-10 fade-up delay-8">
          <p className="mono text-[12px] text-[#7D8794] mb-5">Ready when you are.</p>
          <button
            onClick={onEnter}
            className="mono text-[12px] px-8 py-3.5 bg-[#3d9eff] text-[#05070A] font-semibold tracking-wide active:scale-[0.98] transition-transform"
          >
            ENTER TERMINAL
          </button>
          <p className="mt-6 mono text-[9px] text-[#4A5560] tracking-wide">
            SOLBIT · SEE IT · READ IT · UNDERSTAND IT
          </p>
        </section>
      </main>
    </div>
  );
}
