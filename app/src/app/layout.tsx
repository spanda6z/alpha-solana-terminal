import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "The Desk — Solana",
  description: "Solana trading terminal. Market, firehose, bots, rap sheet.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect fill='%230a0a0b' width='32' height='32'/><text x='16' y='22' text-anchor='middle' font-size='12' font-family='monospace' font-weight='700' fill='%23a3e635'>DK</text></svg>",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "Desk" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0b",
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WalletContextProvider>{children}</WalletContextProvider>
      </body>
    </html>
  );
}
