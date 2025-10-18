"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect } from "wagmi";
import { ConnectWalletButton } from "@coinbase/onchainkit";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Link from "next/link";

export default function Home() {
  const { address, isConnected } = useAccount();
  const { isFrameReady, setFrameReady, context } = useMiniKit();

  // Initialize the miniapp
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white">PreStake</h1>
            <p className="text-blue-200">Sports Finance Platform</p>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="text-white">
                <p className="text-sm text-blue-200">Connected as:</p>
                <p className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
              </div>
            ) : (
              <ConnectWalletButton />
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-6xl font-bold text-white mb-6">
              Trade Sports Odds Like Markets
            </h2>
            <p className="text-xl text-blue-200 mb-12 max-w-2xl mx-auto">
              Lock odds early, trade positions, and profit from odds movement rather than game outcomes. 
              The future of ethical DeFi betting on Base.
            </p>

            {/* Navigation Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <Link href="/matches" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl mb-4">⚽</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Available Matches</h3>
                  <p className="text-blue-200">Browse upcoming matches and lock your odds</p>
                </div>
              </Link>

              <Link href="/positions" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-xl font-semibold text-white mb-2">My Positions</h3>
                  <p className="text-blue-200">View and manage your forward positions</p>
                </div>
              </Link>

              <Link href="/marketplace" className="group">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all duration-300 border border-white/20">
                  <div className="text-4xl mb-4">🏪</div>
                  <h3 className="text-xl font-semibold text-white mb-2">Marketplace</h3>
                  <p className="text-blue-200">Buy and sell forward positions</p>
                </div>
              </Link>
            </div>

            {/* Features */}
            <div className="grid md:grid-cols-2 gap-8 text-left">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-4">🔒 Privacy First</h3>
                <p className="text-blue-200">
                  Your stake amounts are encrypted using iExec DataProtector, ensuring privacy 
                  while maintaining transparency in odds and ownership.
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
                <h3 className="text-2xl font-semibold text-white mb-4">⚡ Base Powered</h3>
                <p className="text-blue-200">
                  Built on Base for fast, cheap transactions. Connect with Coinbase Wallet 
                  or any Ethereum-compatible wallet.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
