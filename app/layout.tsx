import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { RootProvider } from "./rootProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PreStake - Lock the Line Before It Moves",
  description: "Privacy-preserving sports betting forwards on Base",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
