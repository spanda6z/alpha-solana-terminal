"use client";

export function Landing({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="terminal-grid-bg min-h-[100dvh] flex flex-col">
      <header className="h-12 border-b border-[#1c1e24] flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-[#3d9eff] flex items-center justify-center mono text-[12px] font-bold text-[#070809]">
            SB
          </div>
          <div>
            <div className="mono text-[13px] font-semibold">SOLBIT</div>
            <div className="mono text-[8px] text-[#4a4f5a] tracking-wider">
              DIGITAL ASSET MARKET TERMINAL
            </div>
          </div>
        </div>
        <button
          onClick={onEnter}
          className="mono text-[11px] px-3 py-2 bg-[#3d9eff] text-[#070809] font-semibold"
        >
          OPEN TERMINAL
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-2xl mx-auto">
        <h1 className="mono text-2xl sm:text-3xl font-semibold tracking-tight leading-tight">
          READ THE MARKET
          <br />
          BEFORE YOU TRADE IT.
        </h1>
        <p className="mt-4 mono text-[12px] text-[#8b909a] leading-relaxed">
          Market data. On-chain flow. Wallet behavior. Risk.
          <br />
          One terminal built around what is actually moving.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 justify-center">
          <button
            onClick={onEnter}
            className="mono text-[12px] px-5 py-3 bg-[#3d9eff] text-[#070809] font-semibold"
          >
            EXPLORE MARKET
          </button>
          <button
            onClick={onEnter}
            className="mono text-[12px] px-5 py-3 border border-[#2a2d36] text-[#e8eaed]"
          >
            OPEN TERMINAL
          </button>
        </div>
        <div className="mt-10 mono text-[10px] text-[#4a4f5a] flex flex-wrap gap-4 justify-center">
          <span>
            <span className="text-[#22c55e]">●</span> LIVE DATA
          </span>
          <span>SOLANA</span>
          <span>DEXSCREENER · JUPITER</span>
        </div>
      </main>
    </div>
  );
}
