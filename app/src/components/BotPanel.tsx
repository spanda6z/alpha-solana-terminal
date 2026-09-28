"use client";

const STRATEGIES = [
  {
    id: "dca",
    name: "DCA",
    desc: "Buy a fixed amount on a schedule. Perfect for accumulating.",
    strategyId: 0,
  },
  {
    id: "grid",
    name: "Grid",
    desc: "Place buy & sell levels across a price range. Harvest volatility.",
    strategyId: 1,
  },
  {
    id: "infinity",
    name: "Infinity Grid",
    desc: "Grid that automatically re-centers as price moves.",
    strategyId: 2,
  },
  {
    id: "shadow",
    name: "Shadow",
    desc: "Mirror a smart-money wallet. Copy trades at your size.",
    strategyId: 3,
  },
  {
    id: "ladder",
    name: "Ladder",
    desc: "Buy the dip with multiple rungs below current price.",
    strategyId: 4,
  },
  {
    id: "martingale",
    name: "Martingale",
    desc: "Double down after dips. High risk, high reward.",
    strategyId: 5,
  },
];

export function BotPanel() {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-1">Bots</h2>
      <p className="text-sm text-gray-400 mb-6">
        Non-custodial strategies. Funds stay in your vault. You can withdraw anytime.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            className="text-left p-4 rounded-xl border border-gray-800 bg-[#0d0e14] hover:border-violet-500/50 hover:bg-violet-950/20 transition group"
          >
            <div className="font-medium mb-1 group-hover:text-violet-300">
              {s.name}
            </div>
            <div className="text-xs text-gray-500 leading-relaxed">{s.desc}</div>
            <div className="mt-3 text-[10px] text-gray-600 font-mono">
              strategy #{s.strategyId}
            </div>
          </button>
        ))}
      </div>

      <div className="mt-10 p-4 rounded-xl border border-gray-800 bg-gray-900/40">
        <h3 className="text-sm font-medium mb-2">How it works</h3>
        <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
          <li>Connect wallet → create bot → deposit quote token into the vault</li>
          <li>Strategy config is stored on-chain (immutable parameters)</li>
          <li>A keeper (or you) executes the cycles via Jupiter</li>
          <li>1% fee is taken on every fill via the Alpha Fee Router</li>
          <li>Withdraw & close anytime — full refund of remaining balance</li>
        </ol>
      </div>
    </div>
  );
}
