"use client";

export function PlaceholderView({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22]">
        <span className="mono text-[11px] font-semibold tracking-wide">{title}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="mono text-[12px] text-[#7D8794] tracking-wide mb-2">WAITING FOR DATA</div>
          <p className="mono text-[11px] text-[#4A5560] leading-relaxed">{body}</p>
          <p className="mono text-[10px] text-[#4A5560] mt-4">
            Requires indexed on-chain feed (Helius / Birdeye). No fabricated activity.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FirehoseView() {
  return (
    <PlaceholderView
      title="FIREHOSE"
      body="Real-time stream of new pairs, swaps, liquidity events and risk signals. Connect HELIUS_API_KEY for live events."
    />
  );
}

export function SmartMoneyView() {
  return (
    <PlaceholderView
      title="SMART MONEY"
      body="Tracked wallet activity with documented criteria — not every profitable wallet. Data layer not connected yet."
    />
  );
}

export function WatchView({ count }: { count: number }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22] flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">WATCH</span>
        <span className="mono text-[10px] text-[#7D8794]">{count} saved</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="data-unavailable">
          {count === 0
            ? "No watched tokens yet. Open a desk and tap WATCH."
            : `${count} token(s) in local watchlist. Full cards load when metadata is available.`}
        </div>
      </div>
    </div>
  );
}

export function BotsView() {
  return (
    <PlaceholderView
      title="BOTS"
      body="Monitoring bots (Flow, Liquidity, Wallet, Risk, Volume). Execution stays isolated from discovery — no private keys here."
    />
  );
}
