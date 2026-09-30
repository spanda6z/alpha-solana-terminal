import type { Metadata, Viewport } from "next";
import "./globals.css";
import { WalletContextProvider } from "@/components/WalletProvider";

export const metadata: Metadata = {
  title: "SOLBIT — Digital Asset Market Terminal",
  description:
    "Read the market before you trade it. Market data, on-chain flow, wallet behavior, risk.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect fill='%23070809' width='32' height='32' rx='4'/><text x='16' y='22' text-anchor='middle' font-size='14' font-family='monospace' font-weight='700' fill='%233d9eff'>SB</text></svg>",
  },
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "SOLBIT" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#070809",
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
