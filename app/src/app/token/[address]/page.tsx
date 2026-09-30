"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TokenDesk } from "@/components/desk/TokenDesk";
import type { SelectedToken } from "@/components/solbit/types";
import { searchTokens } from "@/lib/tokens";

export default function TokenPage() {
  const params = useParams();
  const router = useRouter();
  const address = String(params?.address || "");
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [watch, setWatch] = useState<string[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("solbit_watch");
      if (raw) setWatch(JSON.parse(raw));
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    if (!address || address.length < 32) {
      setErr("INVALID ADDRESS");
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const rows = await searchTokens(address);
        if (cancelled) return;
        const hit = rows.find((r) => r.mint === address) || rows[0];
        setToken({
          mint: address,
          pairAddress: hit?.pairAddress,
          symbol: hit?.symbol,
          name: hit?.name,
          price: hit?.price,
          change24h: hit?.change24h,
          mcap: hit?.mcap,
          liq: hit?.liq,
          vol: hit?.vol,
          age: hit?.age,
          imageUrl: hit?.imageUrl,
          risk: hit?.risk,
        });
      } catch {
        if (!cancelled) setErr("TOKEN NOT FOUND");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [address]);

  if (err) {
    return (
      <div className="min-h-[100dvh] bg-[#05070A] flex items-center justify-center">
        <div className="data-unavailable">
          {err}
          <button onClick={() => router.push("/")} className="block mt-3 text-[#3d9eff]">
            BACK
          </button>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#05070A] flex items-center justify-center mono text-[12px] text-[#7D8794]">
        Loading desk…
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#05070A]">
      <TokenDesk
        token={token}
        watched={watch.includes(token.mint)}
        onClose={() => router.push("/")}
        onToggleWatch={() => {
          setWatch((w) => {
            const next = w.includes(token.mint)
              ? w.filter((x) => x !== token.mint)
              : [...w, token.mint];
            try {
              localStorage.setItem("solbit_watch", JSON.stringify(next));
            } catch {
              /* */
            }
            return next;
          });
        }}
        onOpenBots={() => router.push("/")}
      />
    </div>
  );
}
