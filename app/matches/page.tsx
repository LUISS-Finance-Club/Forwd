"use client";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Link from "next/link";

// Mock data for demonstration
const mockMatches = [
  {
    id: "match-1",
    homeTeam: "Manchester United",
    awayTeam: "Liverpool",
    date: "2024-01-15",
    time: "15:00",
    currentOdds: 2.1,
  },
  {
    id: "match-2", 
    homeTeam: "Barcelona",
    awayTeam: "Real Madrid",
    date: "2024-01-20",
    time: "20:00",
    currentOdds: 1.8,
  },
  {
    id: "match-3",
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    date: "2024-01-25",
    time: "18:30",
    currentOdds: 2.5,
  },
];

export default function Matches() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mt-2">Available Matches</h1>
            <p className="text-blue-200">Lock your odds early and trade positions</p>
          </div>
          <div className="flex items-center gap-4">
            {isConnected ? (
              <div className="text-white">
                <p className="text-sm text-blue-200">Wallet Connected</p>
              </div>
            ) : (
              <ConnectWallet />
            )}
          </div>
        </header>

        {/* Matches Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockMatches.map((match) => (
            <div key={match.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
              <div className="text-center mb-4">
                <h3 className="text-xl font-semibold text-white mb-2">
                  {match.homeTeam} vs {match.awayTeam}
                </h3>
                <p className="text-blue-200 text-sm">
                  {match.date} at {match.time}
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-blue-200 text-sm mb-1">Current Odds</p>
                  <p className="text-2xl font-bold text-white">{match.currentOdds}x</p>
                </div>
                
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (isConnected) {
                        window.location.href = `/lock/${match.id}`;
                      }
                    }}
                    disabled={!isConnected}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isConnected ? "Lock Forward" : "Connect Wallet to Lock"}
                  </button>
                  
                  <Link 
                    href={`/marketplace?match=${match.id}`}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    View Marketplace
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-2xl font-semibold text-white mb-4">How Forward Locking Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h4 className="text-lg font-semibold text-white mb-2">1. Lock Odds</h4>
              <p className="text-blue-200 text-sm">
                Lock current odds with an encrypted stake amount using iExec DataProtector
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <h4 className="text-lg font-semibold text-white mb-2">2. Trade Positions</h4>
              <p className="text-blue-200 text-sm">
                Buy and sell forward positions as odds change in the marketplace
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h4 className="text-lg font-semibold text-white mb-2">3. Profit from Movement</h4>
              <p className="text-blue-200 text-sm">
                Profit from odds movement rather than game outcomes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
