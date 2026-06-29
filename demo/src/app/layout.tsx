import type { Metadata } from "next";

import { WalletProviders } from "../components/WalletProviders";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solana Actions & Blinks — Live Demo",
  description: "Devnet SOL tip jar with embedded blink client. Auto-deployed from GitHub via Vercel.",
  openGraph: {
    title: "Solana Actions & Blinks Demo",
    description: "Try a live devnet tip jar Action powered by @solana/actions.",
    url: "https://solana-actions-blinks-demo-nine.vercel.app",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <WalletProviders>{children}</WalletProviders>
      </body>
    </html>
  );
}
