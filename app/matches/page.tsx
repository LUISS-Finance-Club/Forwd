"use client";
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import MatchCard from "../../components/MatchCard";
import MobileNav from "../../components/MobileNav";

interface Match {
  id: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo?: string;
  awayLogo?: string;
  date: string;
  time: string;
  odds: number;
  status: "upcoming" | "live" | "finished";
}

export default function MatchesPage() {
  const { isConnected, address } = useAccount();
  const [selectedFilter, setSelectedFilter] = useState<"all" | "upcoming" | "live">("all");

  // Enhanced mock data with more realistic match information
  const mockMatches: Match[] = useMemo(() => [
    {
      id: "match-1",
      homeTeam: "Manchester United",
      awayTeam: "Liverpool",
      homeLogo: "/api/placeholder/32/32",
      awayLogo: "/api/placeholder/32/32",
      date: "Today",
      time: "15:30",
      odds: 210,
      status: "upcoming"
    },
    {
      id: "match-2",
      homeTeam: "Barcelona",
      awayTeam: "Real Madrid",
      homeLogo: "/api/placeholder/32/32",
      awayLogo: "/api/placeholder/32/32",
      date: "Tomorrow",
      time: "20:00",
      odds: 180,
      status: "upcoming"
    },
    {
      id: "match-3",
      homeTeam: "Arsenal",
      awayTeam: "Chelsea",
      homeLogo: "/api/placeholder/32/32",
      awayLogo: "/api/placeholder/32/32",
      date: "Dec 20",
      time: "17:30",
      odds: 195,
      status: "upcoming"
    },
    {
      id: "match-4",
      homeTeam: "Bayern Munich",
      awayTeam: "Borussia Dortmund",
      homeLogo: "/api/placeholder/32/32",
      awayLogo: "/api/placeholder/32/32",
      date: "Dec 22",
      time: "18:30",
      odds: 165,
      status: "upcoming"
    },
    {
      id: "match-5",
      homeTeam: "PSG",
      awayTeam: "Marseille",
      homeLogo: "/api/placeholder/32/32",
      awayLogo: "/api/placeholder/32/32",
      date: "Dec 25",
      time: "21:00",
      odds: 250,
      status: "upcoming"
    }
  ], []);

  const filteredMatches = useMemo(() => {
    if (selectedFilter === "all") return mockMatches;
    return mockMatches.filter(match => match.status === selectedFilter);
  }, [mockMatches, selectedFilter]);

  const handleLockForward = async (matchId: string) => {
    // Navigate to lock page
    window.location.href = `/lock/${matchId}`;
  };

  const filterButtons = [
    { key: "all" as const, label: "All Matches", count: mockMatches.length },
    { key: "upcoming" as const, label: "Upcoming", count: mockMatches.filter(m => m.status === "upcoming").length },
    { key: "live" as const, label: "Live", count: mockMatches.filter(m => m.status === "live").length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileNav isConnected={isConnected} address={address} />
      
      <main className="mobile-container pt-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Available Matches</h1>
          <p className="text-gray-600">Lock your odds before the match starts</p>
        </div>

        {/* Filter Buttons */}
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {filterButtons.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key)}
              className={`btn-sm whitespace-nowrap ${
                selectedFilter === filter.key
                  ? "btn-primary"
                  : "btn-outline"
              }`}
            >
              {filter.label}
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                {filter.count}
              </span>
            </button>
          ))}
        </div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <div className="card mb-6 animate-bounce-in">
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect your wallet to lock forwards and start trading
              </p>
              <ConnectWallet />
            </div>
          </div>
        )}

        {/* Matches List */}
        <div className="space-y-4">
          {filteredMatches.length === 0 ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">⚽</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No Matches Found</h3>
              <p className="text-sm text-gray-600">
                No matches match your current filter. Try selecting a different filter.
              </p>
            </div>
          ) : (
            filteredMatches.map((match, index) => (
              <div
                key={match.id}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <MatchCard
                  match={match}
                  onLockForward={() => handleLockForward(match.id)}
                />
              </div>
            ))
          )}
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="card">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/marketplace"
                  className="btn-outline btn-md touch-manipulation"
                >
                  <div className="flex items-center space-x-2">
                    <span>🏪</span>
                    <span>Browse Marketplace</span>
                  </div>
                </Link>
                <Link
                  href="/positions"
                  className="btn-outline btn-md touch-manipulation"
                >
                  <div className="flex items-center space-x-2">
                    <span>📈</span>
                    <span>My Positions</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 mb-8">
          <div className="card">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How It Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Choose a Match</div>
                    <div className="text-sm text-gray-600">Select from upcoming matches</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Lock Your Odds</div>
                    <div className="text-sm text-gray-600">Secure your stake with encrypted data</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Trade or Hold</div>
                    <div className="text-sm text-gray-600">Sell your position or wait for the match</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}