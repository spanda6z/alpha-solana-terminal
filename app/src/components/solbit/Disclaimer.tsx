import Link from "next/link";

export function Disclaimer({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <p className="mono text-[9px] text-[#4A5560] leading-relaxed">
        Not financial advice. Heuristic risk only.{" "}
        <Link href="/terms" className="text-[#3d9eff]">
          Terms
        </Link>
        {" · "}
        <Link href="/privacy" className="text-[#3d9eff]">
          Privacy
        </Link>
      </p>
    );
  }
  return (
    <div className="sb-panel p-3 mono text-[10px] text-[#7D8794] leading-relaxed space-y-2">
      <p className="text-[#F5F7FA] text-[11px] font-medium">Important</p>
      <p>
        SOLBIT displays market intelligence for Solana tokens. It does not provide investment
        advice, custody, or guaranteed outcomes. Risk labels are observational heuristics.
      </p>
      <p>
        Third-party data may be incomplete. Empty states mean data is unavailable — not that
        activity is zero.
      </p>
      <p>
        <Link href="/terms" className="text-[#3d9eff]">
          Terms of Use
        </Link>
        {" · "}
        <Link href="/privacy" className="text-[#3d9eff]">
          Privacy Policy
        </Link>
      </p>
    </div>
  );
}
