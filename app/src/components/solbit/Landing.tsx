"use client";

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="terminal-grid-bg min-h-[100dvh] flex flex-col">
      <header className="h-12 border-b border-[#151B22] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-[#3d9eff] flex items-center justify-center mono text-[12px] font-bold text-[#05070A]">
            SB
          </div>
          <div>
            <div className="mono text-[13px] font-semibold">SOLBIT</div>
            <div className="mono text-[8px] text-[#4A5560] tracking-wider">SOLANA MARKET INTELLIGENCE</div>
          </div>
        </div>
        <button onClick={onEnter} className="mono text-[11px] px-3 py-2 bg-[#3d9eff] text-[#05070A] font-semibold">
          OPEN TERMINAL
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-xl mx-auto">
        <p className="mono text-[11px] text-[#3d9eff] tracking-[0.2em] mb-4">SOLBIT</p>
        <h1 className="mono text-2xl sm:text-3xl font-semibold tracking-tight leading-tight text-[#F5F7FA]">
          Every move has a reason.
        </h1>
        <p className="mt-4 mono text-[13px] text-[#7D8794] leading-relaxed space-y-1">
          <span className="block">See the market.</span>
          <span className="block">Read the flow.</span>
          <span className="block">Understand the risk.</span>
        </p>
        <p className="mt-6 mono text-[11px] text-[#4A5560]">No wallet required to explore.</p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button onClick={onEnter} className="mono text-[12px] px-5 py-3 bg-[#3d9eff] text-[#05070A] font-semibold">
            EXPLORE MARKETS
          </button>
          <button onClick={onEnter} className="mono text-[12px] px-5 py-3 border border-[#151B22] text-[#F5F7FA] hover:border-[#3d9eff]">
            OPEN TERMINAL
          </button>
        </div>
        <p className="mt-12 mono text-[9px] text-[#4A5560] tracking-wide max-w-sm">
          Discovery and intelligence only. Not a buy signal. Not fabricated activity.
        </p>
      </main>
    </div>
  );
}
