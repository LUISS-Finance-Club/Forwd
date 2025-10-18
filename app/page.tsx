"use client";
import { useEffect } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import Link from "next/link";
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
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileNav isConnected={isConnected} address={address} />
      
      <main className="mobile-container pt-4">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-bounce-in">
            <span className="text-3xl">⚽</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to PreStake</h1>
          <p className="text-gray-600 text-lg">
            Trade sports odds like markets
          </p>
        </div>

        {/* Wallet Connection */}
        {!isConnected && (
          <div className="card mb-8 animate-slide-up">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to start locking forwards and trading positions
              </p>
              <ConnectWallet />
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Link
            href="/matches"
            className="card-interactive p-6 text-center animate-slide-up"
            style={{ animationDelay: "100ms" }}
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">⚽</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Matches</h3>
            <p className="text-sm text-gray-600">Lock your odds</p>
          </Link>
          
          <Link
            href="/marketplace"
            className="card-interactive p-6 text-center animate-slide-up"
            style={{ animationDelay: "200ms" }}
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">🏪</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Marketplace</h3>
            <p className="text-sm text-gray-600">Trade positions</p>
          </Link>
          
          <Link
            href="/positions"
            className="card-interactive p-6 text-center animate-slide-up"
            style={{ animationDelay: "300ms" }}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📈</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Positions</h3>
            <p className="text-sm text-gray-600">View your forwards</p>
          </Link>
          
          <div className="card p-6 text-center animate-slide-up opacity-60" style={{ animationDelay: "400ms" }}>
            <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics</h3>
            <p className="text-sm text-gray-600">Coming soon</p>
          </div>
        </div>

        {/* Features */}
        <div className="card mb-8 animate-slide-up" style={{ animationDelay: "500ms" }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Why PreStake?</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600">🔒</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Encrypted Stakes</h3>
                  <p className="text-sm text-gray-600">Your stake amounts are encrypted using iExec DataProtector</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-blue-600">⚡</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Instant Trading</h3>
                  <p className="text-sm text-gray-600">Buy and sell forward positions instantly</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-purple-600">🌐</span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Decentralized</h3>
                  <p className="text-sm text-gray-600">Built on Base blockchain for transparency</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="card text-center p-4 animate-slide-up" style={{ animationDelay: "600ms" }}>
            <div className="text-2xl font-bold text-blue-600">5</div>
            <div className="text-xs text-gray-600">Active Matches</div>
          </div>
          <div className="card text-center p-4 animate-slide-up" style={{ animationDelay: "700ms" }}>
            <div className="text-2xl font-bold text-emerald-600">12</div>
            <div className="text-xs text-gray-600">Forwards Listed</div>
          </div>
          <div className="card text-center p-4 animate-slide-up" style={{ animationDelay: "800ms" }}>
            <div className="text-2xl font-bold text-purple-600">2.1x</div>
            <div className="text-xs text-gray-600">Avg Odds</div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="card animate-slide-up" style={{ animationDelay: "900ms" }}>
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Getting Started</h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-gray-700">Connect your wallet</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-gray-700">Browse available matches</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <span className="text-gray-700">Lock your forward position</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                <span className="text-gray-700">Trade or hold your position</span>
              </div>
            </div>
        </div>
      </div>
      </main>
    </div>
  );
}