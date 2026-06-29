import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Solana Actions & Blinks — Live Demo",
  description: "Devnet SOL tip jar Action powered by @solana/actions",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
