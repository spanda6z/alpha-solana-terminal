import Link from "next/link";

export const metadata = { title: "Terms · SOLBIT" };

export default function TermsPage() {
  return (
    <div className="min-h-[100dvh] bg-[#05070A] text-[#F5F7FA] px-4 py-10 max-w-2xl mx-auto mono text-[12px] leading-relaxed">
      <Link href="/" className="text-[#3d9eff] text-[11px]">
        ← SOLBIT
      </Link>
      <h1 className="text-[18px] font-semibold mt-6 mb-2">Terms of Use</h1>
      <p className="text-[#4A5560] text-[10px] mb-8">Last updated: September 2026</p>

      <section className="space-y-4 text-[#7D8794]">
        <p>
          SOLBIT is a Solana market intelligence interface. It provides discovery tools, market
          data displays, and optional non-custodial swap routing. It is not a broker, exchange,
          investment adviser, or bank.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">No financial advice</h2>
        <p>
          Nothing on SOLBIT is a recommendation to buy, sell, or hold any asset. Risk labels and
          scores are heuristic observations of on-chain or market data, not guarantees of safety or
          performance.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Data accuracy</h2>
        <p>
          Market data is supplied by third parties (e.g. Birdeye, DexScreener, Helius). Feeds may be
          delayed, incomplete, or unavailable. When data is missing, SOLBIT shows explicit empty
          states rather than inventing activity.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Wallets & trades</h2>
        <p>
          If you connect a wallet and execute a swap, you do so at your own risk. SOLBIT does not
          custody funds. You are responsible for approving transactions in your wallet and for tax
          and legal obligations in your jurisdiction.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Eligibility</h2>
        <p>
          You must be legally allowed to access crypto market tools where you live. Do not use
          SOLBIT if prohibited by applicable law.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Limitation of liability</h2>
        <p>
          SOLBIT is provided “as is” without warranties. To the fullest extent permitted by law,
          operators are not liable for losses arising from use of the interface, third-party data,
          smart contracts, or network failures.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Contact</h2>
        <p>Questions about these terms should be directed through your project’s official channels.</p>
      </section>
    </div>
  );
}
