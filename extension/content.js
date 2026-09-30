(() => {
  const CA_RE = /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g;
  const IGNORE = new Set(["So11111111111111111111111111111111111111112"]);
  const seen = new WeakSet();
  let cardEl = null;
  let hideTimer = null;

  function isLikelyMint(s) {
    if (s.length < 32 || s.length > 44) return false;
    if (IGNORE.has(s)) return false;
    if (!/[1-9]/.test(s)) return false;
    if (/^[0-9]+$/.test(s)) return false;
    return true;
  }

  function toast(msg) {
    const t = document.createElement("div");
    t.className = "solbit-toast";
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 1600);
  }

  async function copy(text) {
    try {
      await navigator.clipboard.writeText(text);
      toast("CA copied");
    } catch {
      toast("Copy failed");
    }
  }

  function hideCard() {
    if (cardEl) {
      cardEl.remove();
      cardEl = null;
    }
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&")
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """);
  }

  function showCard(anchor, data, mint) {
    hideCard();
    const rect = anchor.getBoundingClientRect();
    cardEl = document.createElement("div");
    cardEl.className = "solbit-card";
    const chg =
      data.change24h != null
        ? `${data.change24h >= 0 ? "+" : ""}${Number(data.change24h).toFixed(1)}%`
        : "—";
    const chgColor =
      data.change24h == null ? "#7D8794" : data.change24h >= 0 ? "#2dd4bf" : "#ef4444";
    const img = data.imageUrl
      ? `<img src="${data.imageUrl}" alt="" />`
      : `<div style="width:28px;height:28px;border-radius:99px;background:#151B22;display:flex;align-items:center;justify-content:center;color:#3d9eff;font-size:11px;font-weight:700">${(data.symbol || "?")[0]}</div>`;
    cardEl.innerHTML = `
      <header>
        ${img}
        <div style="flex:1;min-width:0">
          <div class="sym">${escapeHtml(data.symbol || "TOKEN")}</div>
          <div class="name">${escapeHtml(data.name || mint.slice(0, 8) + "…")}</div>
        </div>
        <div style="color:${chgColor};font-weight:600">${chg}</div>
      </header>
      <div class="metrics">
        <div><span>PRICE</span><b>${escapeHtml(String(data.price || "—"))}</b></div>
        <div><span>MC</span><b>${escapeHtml(String(data.mcap || "—"))}</b></div>
        <div><span>LIQ</span><b>${escapeHtml(String(data.liq || "—"))}</b></div>
        <div><span>VOL 24H</span><b>${escapeHtml(String(data.vol || "—"))}</b></div>
      </div>
      <div class="actions">
        <button type="button" data-copy>COPY CA</button>
        <a class="primary" href="https://alpha-solana-terminal.vercel.app/?mint=${encodeURIComponent(mint)}" target="_blank" rel="noreferrer">OPEN DESK</a>
      </div>`;
    document.body.appendChild(cardEl);
    const top = window.scrollY + rect.bottom + 6;
    let left = window.scrollX + rect.left;
    if (left + 280 > window.scrollX + window.innerWidth - 8) {
      left = window.scrollX + window.innerWidth - 288;
    }
    cardEl.style.top = `${top}px`;
    cardEl.style.left = `${Math.max(8, left)}px`;
    cardEl.querySelector("[data-copy]")?.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      copy(mint);
    });
    cardEl.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    cardEl.addEventListener("mouseleave", () => {
      hideTimer = setTimeout(hideCard, 200);
    });
  }

  function wrapNode(textNode) {
    if (seen.has(textNode)) return;
    const parent = textNode.parentElement;
    if (!parent) return;
    if (parent.closest(".solbit-ca, .solbit-card, script, style, textarea, input")) return;
    const text = textNode.nodeValue || "";
    if (!CA_RE.test(text)) return;
    CA_RE.lastIndex = 0;
    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = CA_RE.exec(text))) {
      const ca = m[1];
      if (!isLikelyMint(ca)) continue;
      if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
      const span = document.createElement("span");
      span.className = "solbit-ca";
      span.textContent = ca;
      span.title = "SOLBIT · click to copy · hover for card";
      span.dataset.mint = ca;
      span.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        copy(ca);
      });
      span.addEventListener("mouseenter", () => {
        clearTimeout(hideTimer);
        chrome.runtime.sendMessage({ type: "FETCH_TOKEN", mint: ca }, (res) => {
          if (chrome.runtime.lastError) return;
          if (res?.ok && res.data) showCard(span, res.data, ca);
          else
            showCard(
              span,
              { symbol: "…", name: "Loading failed", price: "—", mcap: "—", liq: "—", vol: "—" },
              ca
            );
        });
      });
      span.addEventListener("mouseleave", () => {
        hideTimer = setTimeout(hideCard, 280);
      });
      frag.appendChild(span);
      last = m.index + ca.length;
    }
    if (last === 0) return;
    if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
    seen.add(textNode);
    parent.replaceChild(frag, textNode);
  }

  function scan(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue || node.nodeValue.length < 32) return NodeFilter.FILTER_REJECT;
        if (!/[1-9A-HJ-NP-Za-km-z]{32,}/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapNode);
  }

  scan(document.body);
  const mo = new MutationObserver((muts) => {
    for (const m of muts) {
      m.addedNodes.forEach((n) => {
        if (n.nodeType === 1) scan(n);
        else if (n.nodeType === 3) wrapNode(n);
      });
    }
  });
  mo.observe(document.body, { childList: true, subtree: true });
})();
