"use client";

export function PlaceholderView({
  title,
  status,
  body,
}: {
  title: string;
  status: string;
  body: string;
}) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22] flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">{title}</span>
        <span className="mono text-[9px] text-[#4A5560] ml-auto">{status}</span>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <div className="w-10 h-10 mx-auto mb-4 rounded border border-[#151B22] flex items-center justify-center mono text-[11px] text-[#3d9eff]">
            SB
          </div>
          <p className="mono text-[12px] text-[#7D8794] leading-relaxed">{body}</p>
          <p className="mono text-[9px] text-[#4A5560] mt-4 tracking-wide">No fabricated activity</p>
        </div>
      </div>
    </div>
  );
}

export function FirehoseView() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22] flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">FLOW</span>
        <span className="live-dot" />
        <span className="mono text-[9px] text-[#4A5560]">EVENT STREAM</span>
      </div>
      <div className="px-3 py-2 border-b border-[#151B22] flex gap-1.5 overflow-x-auto">
        {["ALL", "SWAPS", "LIQ", "LAUNCH"].map((x, i) => (
          <span
            key={x}
            className={
              i === 0
                ? "mono text-[9px] px-2 py-1 border border-[#3d9eff] text-[#3d9eff]"
                : "mono text-[9px] px-2 py-1 border border-[#151B22] text-[#4A5560]"
            }
          >
            {x}
          </span>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-3 py-1.5 mono text-[8px] text-[#4A5560] tracking-wider border-b border-[#151B22]">
          TIME · EVENT · TOKEN · DETAIL
        </div>
        <div className="data-unavailable py-16">
          WAITING FOR STREAM
          <div className="mt-2 text-[#4A5560] max-w-xs mx-auto leading-relaxed">
            Live swaps and liquidity events appear when HELIUS_API_KEY is configured. Discover still
            works from market data.
          </div>
        </div>
      </div>
    </div>
  );
}

export function SmartMoneyView() {
  return (
    <PlaceholderView
      title="ACCOUNT"
      status="WALLET"
      body="Connect a wallet to see balances, positions and recent activity. Watchlist is saved on this device."
    />
  );
}

export function WatchView({
  mints,
  onOpen,
}: {
  count?: number;
  mints?: string[];
  onOpen?: (mint: string) => void;
}) {
  const list = mints || [];
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3 py-2 border-b border-[#151B22] flex items-center gap-2">
        <span className="mono text-[11px] font-semibold tracking-wide">WATCH</span>
        <span className="mono text-[10px] text-[#7D8794] board-count">{list.length}</span>
      </div>
      {!list.length ? (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="data-unavailable">
            NO WATCHED TOKENS
            <div className="mt-2 text-[#4A5560]">Open a token desk and tap the star to save it here.</div>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {list.map((mint) => (
            <button
              key={mint}
              onClick={() => onOpen?.(mint)}
              className="row-token w-full flex items-center gap-3 px-3 py-3 border-b border-[#0d1218] text-left"
            >
              <div className="w-7 h-7 rounded-full bg-[#0A0E13] border border-[#151B22] flex items-center justify-center mono text-[10px] text-[#3d9eff]">
                {mint.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mono text-[12px] font-medium truncate">
                  {mint.slice(0, 6)}…{mint.slice(-4)}
                </div>
                <div className="mono text-[9px] text-[#4A5560]">Tap to open desk</div>
              </div>
              <span className="mono text-[10px] text-[#3d9eff]">OPEN</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function BotsView() {
  return (
    <PlaceholderView
      title="BOTS"
      status="MONITORING"
      body="Non-custodial monitoring bots will list here. Discovery and desk do not require bots."
    />
  );
}
