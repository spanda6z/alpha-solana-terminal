import Link from "next/link";

export const metadata = { title: "Privacy · SOLBIT" };

export default function PrivacyPage() {
  return (
    <div className="min-h-[100dvh] bg-[#05070A] text-[#F5F7FA] px-4 py-10 max-w-2xl mx-auto mono text-[12px] leading-relaxed">
      <Link href="/" className="text-[#3d9eff] text-[11px]">
        ← SOLBIT
      </Link>
      <h1 className="text-[18px] font-semibold mt-6 mb-2">Privacy Policy</h1>
      <p className="text-[#4A5560] text-[10px] mb-8">Last updated: September 2026</p>

      <section className="space-y-4 text-[#7D8794]">
        <p>
          SOLBIT is designed to minimize personal data collection. This policy describes what may
          be processed when you use the web terminal or browser extension.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Data we do not collect by default</h2>
        <p>
          We do not require an account. We do not ask for name, email, or identity documents to
          browse markets. Wallet addresses are only known to the interface when you choose to
          connect a wallet in your browser.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Local storage</h2>
        <p>
          Watchlists and UI preferences may be stored in your browser’s local storage on your
          device. Clearing site data removes them.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Technical logs</h2>
        <p>
          Hosting providers (e.g. Vercel) may process standard request logs (IP, user agent, path)
          for security and reliability. API keys for market providers stay on the server and are
          not embedded in the public client bundle.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Third parties</h2>
        <p>
          Market quotes and on-chain reads may be requested from Birdeye, DexScreener, Helius,
          Solana RPC, and Jupiter. Their processing is governed by their own policies.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Extension</h2>
        <p>
          The optional Chrome extension reads page text only to detect Solana contract addresses
          and fetch public market data. It does not access wallet keys.
        </p>
        <h2 className="text-[#F5F7FA] text-[13px] font-semibold pt-2">Contact</h2>
        <p>Privacy requests should go through your project’s official channels.</p>
      </section>
    </div>
  );
}
