"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MobileNav from "../components/MobileNav";

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { isFrameReady, setFrameReady } = useMiniKit();

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-emerald-50 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-lg font-bold">⚽</span>
            </div>
            <span className="text-xl font-bold">PreStake</span>
          </div>
          <ConnectWallet />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <section className="text-center py-12">
          <Badge variant="secondary" className="mb-4">
            🚀 Now Live on Base
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-6">
            Trade Sports Futures
            <br />
            <span className="text-primary">Like Stocks</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Lock in your predictions, trade positions, and profit from sports outcomes 
            with encrypted privacy and decentralized security.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/matches">
                Browse Matches
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/marketplace">
                View Marketplace
              </Link>
            </Button>
          </div>
        </section>

        {/* Wallet Connection */}
        {!isConnected && (
          <Card className="mb-8 animate-slide-up">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔗</span>
                </div>
                <CardTitle className="text-xl mb-2">Connect Your Wallet</CardTitle>
                <CardDescription className="mb-6">
                  Connect your wallet to start locking forwards and trading positions
                </CardDescription>
                <ConnectWallet />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Grid */}
        <section className="py-12">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose PreStake?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600">🔒</span>
                  </div>
                  <CardTitle className="text-lg">Encrypted Privacy</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Your stake amounts are encrypted using iExec DataProtector, 
                  ensuring complete privacy while maintaining transparency.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-600">📈</span>
                  </div>
                  <CardTitle className="text-lg">Trade Like Stocks</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Buy and sell forward contracts in a liquid marketplace. 
                  Your positions can be traded before the match even starts.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                    <span className="text-purple-600">⚡</span>
                  </div>
                  <CardTitle className="text-lg">Instant Settlement</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Built on Base for fast, cheap transactions. 
                  No waiting for confirmations or high gas fees.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">$0</div>
                <CardDescription>Platform Fees</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">24/7</div>
                <CardDescription>Trading Hours</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">100%</div>
                <CardDescription>Decentralized</CardDescription>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-primary">Base</div>
                <CardDescription>Network</CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Mobile Navigation */}
      <MobileNav isConnected={isConnected} address={address} />
    </div>
  );
}