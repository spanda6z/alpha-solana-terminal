const TERMINAL = "https://alpha-solana-terminal.vercel.app";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg?.type === "FETCH_TOKEN") {
    fetchToken(msg.mint)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) => sendResponse({ ok: false, error: String(e) }));
    return true;
  }
  if (msg?.type === "OPEN_DESK") {
    chrome.tabs.create({
      url: `${TERMINAL}/?mint=${encodeURIComponent(msg.mint)}`,
    });
  }
});

async function fetchToken(mint) {
  try {
    const r = await fetch(
      `${TERMINAL}/api/market?q=${encodeURIComponent(mint)}`
    );
    if (r.ok) {
      const j = await r.json();
      const t = (j.tokens || [])[0];
      if (t) {
        return {
          symbol: t.symbol,
          name: t.name,
          price: t.price,
          mcap: t.mcap,
          liq: t.liq,
          vol: t.vol,
          change24h: t.change24h,
          imageUrl: t.imageUrl,
          mint: t.mint || mint,
        };
      }
    }
  } catch (_) {}

  const r2 = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${mint}`
  );
  const j2 = await r2.json();
  const pair =
    (j2.pairs || []).find((p) => p.chainId === "solana") || (j2.pairs || [])[0];
  if (!pair) throw new Error("Token not found");
  return {
    symbol: pair.baseToken?.symbol,
    name: pair.baseToken?.name,
    price: pair.priceUsd ? `$${Number(pair.priceUsd).toPrecision(4)}` : "—",
    mcap: pair.marketCap ? formatUsd(pair.marketCap) : "—",
    liq: pair.liquidity?.usd ? formatUsd(pair.liquidity.usd) : "—",
    vol: pair.volume?.h24 ? formatUsd(pair.volume.h24) : "—",
    change24h: pair.priceChange?.h24,
    imageUrl: pair.info?.imageUrl,
    mint,
  };
}

function formatUsd(n) {
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}K`;
  return `$${Number(n).toFixed(0)}`;
}
