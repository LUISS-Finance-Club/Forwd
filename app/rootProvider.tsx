"use client";
import { ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { http, createConfig } from "wagmi";
import { injected, coinbaseWallet } from "wagmi/connectors";
import "@coinbase/onchainkit/styles.css";

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected({ target: "metaMask" }),
    coinbaseWallet({ appName: "PreStake" }),
  ],
  transports: {
    [baseSepolia.id]: http(),
  },
  ssr: false,
});

export function RootProvider({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <OnchainKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={baseSepolia}
        >
          {children}
        </OnchainKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
