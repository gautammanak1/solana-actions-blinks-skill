import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { WalletProviders } from "../components/WalletProviders";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

export const metadata: Metadata = {
  title: "Tip Jar — Solana Actions Demo",
  description: "Send SOL tips on devnet with a clean, one-click Solana Action experience.",
  openGraph: {
    title: "Tip Jar — Solana Actions Demo",
    description: "Connect wallet, pick an amount, confirm on Solana devnet.",
    url: "https://solana-actions-blinks-demo-nine.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans`}>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
