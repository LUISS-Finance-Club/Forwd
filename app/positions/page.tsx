"use client";
import { useState, useEffect, useMemo } from "react";
import { useAccount } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import PositionCard from "../../components/PositionCard";
import MobileNav from "../../components/MobileNav";

interface Position {
  forwardId: number;
  matchId: string;
  odds: number;
  owner: string;
  encryptedStakeRef: string;
  forSale: boolean;
  price: bigint;
  createdAt: number;
}

export default function PositionsPage() {
  const { isConnected, address } = useAccount();
  const [userForwards, setUserForwards] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "for-sale" | "not-for-sale">("all");

  // Enhanced mock data for demonstration
  const mockForwards: Position[] = useMemo(() => [
    {
      forwardId: 1,
      matchId: "match-1",
      owner: address || "0x0000000000000000000000000000000000000000",
      odds: 210, // 2.1x in basis points
      encryptedStakeRef: "mock-encrypted-ref-1.5-1700000000000-match-1",
      forSale: false,
      price: BigInt(0),
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      forwardId: 2,
      matchId: "match-2", 
      owner: address || "0x0000000000000000000000000000000000000000",
      odds: 180, // 1.8x in basis points
      encryptedStakeRef: "mock-encrypted-ref-0.8-1700000000000-match-2",
      forSale: true,
      price: BigInt("1000000000000000000"), // 1 ETH in wei
      createdAt: Date.now() - 172800000, // 2 days ago
    },
    {
      forwardId: 3,
      matchId: "match-3",
      owner: address || "0x0000000000000000000000000000000000000000",
      odds: 250, // 2.5x in basis points
      encryptedStakeRef: "mock-encrypted-ref-2.0-1700000000000-match-3",
      forSale: false,
      price: BigInt(0),
      createdAt: Date.now() - 259200000, // 3 days ago
    },
  ], [address]);

  useEffect(() => {
    if (isConnected && address) {
      // Filter forwards owned by current user
      const userOwnedForwards = mockForwards.filter(forward => 
        forward.owner.toLowerCase() === address.toLowerCase()
      );
      setUserForwards(userOwnedForwards);
      setIsLoading(false);
    } else {
      setUserForwards([]);
      setIsLoading(false);
    }
  }, [isConnected, address, mockForwards]);

  const filteredForwards = useMemo(() => {
    if (selectedFilter === "all") return userForwards;
    if (selectedFilter === "for-sale") return userForwards.filter(f => f.forSale);
    return userForwards.filter(f => !f.forSale);
  }, [userForwards, selectedFilter]);

  const handleListForSale = async (forwardId: number) => {
    // Simulate listing for sale
    console.log(`Listing forward ${forwardId} for sale`);
    // In real app, this would call the smart contract
  };

  const handleDecryptStake = async (forwardId: number) => {
    // This is handled by the PositionCard component
    console.log(`Decrypting stake for forward ${forwardId}`);
  };

  const filterButtons = [
    { key: "all" as const, label: "All Positions", count: userForwards.length },
    { key: "for-sale" as const, label: "For Sale", count: userForwards.filter(f => f.forSale).length },
    { key: "not-for-sale" as const, label: "Not For Sale", count: userForwards.filter(f => !f.forSale).length }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileNav isConnected={isConnected} address={address} />
      
      <main className="mobile-container pt-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">My Positions</h1>
          <p className="text-gray-600">View and manage your forward positions</p>
        </div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <div className="card mb-8 animate-bounce-in">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🔗</span>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                Connect your wallet to view your forward positions
              </p>
              <ConnectWallet />
            </div>
          </div>
        )}

        {/* Filter Buttons */}
        {isConnected && userForwards.length > 0 && (
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
        )}

        {/* Positions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner w-12 h-12 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading your positions...</p>
          </div>
        ) : !isConnected ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Connect to View Positions</h2>
            <p className="text-gray-600 mb-6">Connect your wallet to see your forward positions</p>
            <ConnectWallet />
          </div>
        ) : filteredForwards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📊</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {userForwards.length === 0 ? "No Positions Yet" : "No Matching Positions"}
            </h2>
            <p className="text-gray-600 mb-6">
              {userForwards.length === 0 
                ? "You haven't locked any forwards yet."
                : "No positions match your current filter."
              }
            </p>
            {userForwards.length === 0 && (
              <Link
                href="/matches"
                className="btn-primary btn-md touch-manipulation"
              >
                <div className="flex items-center space-x-2">
                  <span>⚽</span>
                  <span>Browse Matches</span>
                </div>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredForwards.map((position, index) => (
              <div
                key={position.forwardId}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PositionCard
                  position={position}
                  onListForSale={() => handleListForSale(position.forwardId)}
                  onDecryptStake={() => handleDecryptStake(position.forwardId)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        {isConnected && userForwards.length > 0 && (
          <div className="mt-8">
            <div className="card">
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    href="/matches"
                    className="btn-outline btn-md touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <span>⚽</span>
                      <span>Lock More</span>
                    </div>
                  </Link>
                  <Link
                    href="/marketplace"
                    className="btn-outline btn-md touch-manipulation"
                  >
                    <div className="flex items-center space-x-2">
                      <span>🏪</span>
                      <span>Browse Market</span>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div className="mt-6 mb-8">
          <div className="card">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Managing Your Positions</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600">🔓</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Decrypt Stakes</div>
                    <div className="text-sm text-gray-600">Only you can decrypt your stake amounts using your wallet signature</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600">💰</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">List for Sale</div>
                    <div className="text-sm text-gray-600">List your forwards on the marketplace to trade with other users</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600">📈</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Track Performance</div>
                    <div className="text-sm text-gray-600">Monitor how your locked odds compare to current market odds</div>
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