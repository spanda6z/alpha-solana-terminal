"use client";

export function FlowMarket() {
  return (
    <div className="p-4 max-w-xl">
      <h2 className="mono text-[14px] font-semibold mb-2">FLOW</h2>
      <p className="mono text-[11px] text-[#8b909a] leading-relaxed">
        Market-wide buy/sell pressure, whale flow, and liquidity events need a trade indexer
        (e.g. Helius webhooks). This panel is wired for that feed — not fabricated activity.
      </p>
      <div className="mt-6 mono text-[10px] text-[#4a4f5a]">STATE: INDEXER NOT CONNECTED</div>
    </div>
  );
}

export function SmartMarket() {
  return (
    <div className="p-4 max-w-xl">
      <h2 className="mono text-[14px] font-semibold mb-2">SMART</h2>
      <p className="mono text-[11px] text-[#8b909a] leading-relaxed">
        Behavioral observations with evidence and confidence. No chatbot. Signals appear when
        wallet clustering + history are available.
      </p>
      <div className="mt-6 border border-[#1c1e24] p-3 mono text-[11px] text-[#8b909a]">
        NO MARKET-WIDE SIGNALS · INSUFFICIENT DATA
      </div>
    </div>
  );
}

export function RapSheet() {
  return (
    <div className="p-4 max-w-xl">
      <h2 className="mono text-[14px] font-semibold mb-2">RAP SHEET</h2>
      <p className="mono text-[11px] text-[#8b909a] mb-4">
        Search wallet / creator / token — investigation graph.
      </p>
      <input className="sb-input" placeholder="Wallet / creator / token" disabled />
      <p className="mt-4 mono text-[10px] text-[#4a4f5a]">
        Wallet funding graphs and creator history require indexed chain data. UI ready —
        backend not connected.
      </p>
    </div>
  );
}

export function WatchView({
  items,
  onOpen,
}: {
  items: { mint: string; symbol?: string }[];
  onOpen: (mint: string) => void;
}) {
  return (
    <div className="p-4 max-w-xl">
      <h2 className="mono text-[14px] font-semibold mb-2">WATCH</h2>
      <div className="mono text-[10px] text-[#4a4f5a] mb-3">TOKENS · LOCAL SESSION</div>
      {!items.length && (
        <p className="mono text-[11px] text-[#8b909a]">Open tokens from Market to fill watchlist.</p>
      )}
      <div className="border border-[#1c1e24] divide-y divide-[#1c1e24] mt-2">
        {items.map((t) => (
          <button
            key={t.mint}
            onClick={() => onOpen(t.mint)}
            className="w-full text-left px-3 py-3 mono text-[12px] hover:bg-[#0f1115]"
          >
            {t.symbol || t.mint.slice(0, 8)}
          </button>
        ))}
      </div>
      <div className="mt-6">
        <div className="mono text-[10px] text-[#4a4f5a] tracking-wider mb-2">ALERTS</div>
        <p className="mono text-[11px] text-[#8b909a]">NO ALERTS · RULE ENGINE NOT CONNECTED</p>
      </div>
    </div>
  );
}
