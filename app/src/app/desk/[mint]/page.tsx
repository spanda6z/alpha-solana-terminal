"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TokenDesk } from "@/components/desk/TokenDesk";
import type { SelectedToken } from "@/components/desk/types";
import { searchTokens } from "@/lib/tokens";

export default function DeskMintPage() {
  const params = useParams();
  const router = useRouter();
  const mint = String(params?.mint || "");
  const [token, setToken] = useState<SelectedToken | null>(null);
  const [watch, setWatch] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("desk_watch");
      if (raw) setWatch(JSON.parse(raw));
    } catch {
      /* */
    }
  }, []);

  useEffect(() => {
    if (!mint || mint.length < 32) return;
    let cancelled = false;
    (async () => {
      const rows = await searchTokens(mint);
      if (cancelled) return;
      const hit = rows.find((r) => r.mint === mint) || rows[0];
      setToken({
        mint,
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
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [mint]);

  if (!token) {
    return (
      <div className="min-h-[100dvh] bg-[#0a0a0f] text-[#9898a8] flex items-center justify-center text-[13px]">
        Loading desk…
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#0a0a0f]">
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
              localStorage.setItem("desk_watch", JSON.stringify(next));
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
