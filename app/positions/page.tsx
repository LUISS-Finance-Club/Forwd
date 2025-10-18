"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import { DataProtector } from "@iexec/dataprotector";

interface Forward {
  id: number;
  matchId: string;
  owner: string;
  odds: number;
  encryptedStakeRef: string;
  forSale: boolean;
  price: number;
  createdAt: number;
}

export default function Positions() {
  const { isConnected, address } = useAccount();
  const [userForwards, setUserForwards] = useState<Forward[]>([]);
  const [decryptedStakes, setDecryptedStakes] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState<Record<number, boolean>>({});

  // Mock data for demonstration - in real app, fetch from contract
  const mockForwards: Forward[] = [
    {
      id: 1,
      matchId: "match-1",
      owner: address || "0x0000000000000000000000000000000000000000",
      odds: 210, // 2.1x in basis points
      encryptedStakeRef: "encrypted-ref-123",
      forSale: false,
      price: 0,
      createdAt: Date.now() - 86400000, // 1 day ago
    },
    {
      id: 2,
      matchId: "match-2", 
      owner: address || "0x0000000000000000000000000000000000000000",
      odds: 180, // 1.8x in basis points
      encryptedStakeRef: "encrypted-ref-456",
      forSale: true,
      price: 1000000000000000000, // 1 ETH in wei
      createdAt: Date.now() - 172800000, // 2 days ago
    },
  ];

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
  }, [isConnected, address]);

  const decryptStake = async (forwardId: number, encryptedRef: string) => {
    setIsDecrypting(prev => ({ ...prev, [forwardId]: true }));
    
    try {
      const dataProtector = new DataProtector({
        apiUrl: process.env.NEXT_PUBLIC_IEXEC_API_URL || "https://v7.bellecour.iex.ec/api",
      });

      const stake = await dataProtector.getData(encryptedRef);
      setDecryptedStakes(prev => ({ ...prev, [forwardId]: stake.stakeAmount }));
    } catch (err) {
      console.error("Decryption failed:", err);
    } finally {
      setIsDecrypting(prev => ({ ...prev, [forwardId]: false }));
    }
  };

  const formatOdds = (odds: number) => {
    return (odds / 100).toFixed(1);
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getMatchName = (matchId: string) => {
    const matchNames: Record<string, string> = {
      "match-1": "Manchester United vs Liverpool",
      "match-2": "Barcelona vs Real Madrid", 
      "match-3": "Bayern Munich vs Borussia Dortmund",
    };
    return matchNames[matchId] || matchId;
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Connect Your Wallet</h1>
          <p className="text-blue-200 mb-6">Connect your wallet to view your forward positions</p>
          <ConnectWallet />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mt-2">My Positions</h1>
            <p className="text-blue-200">View and manage your forward positions</p>
          </div>
          <div className="text-white">
            <p className="text-sm text-blue-200">Connected as:</p>
            <p className="font-mono">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
          </div>
        </header>

        {/* Positions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading your positions...</p>
          </div>
        ) : userForwards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Positions Yet</h2>
            <p className="text-blue-200 mb-6">You haven't locked any forwards yet.</p>
            <Link 
              href="/matches"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Browse Matches
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userForwards.map((forward) => (
              <div key={forward.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {getMatchName(forward.matchId)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-blue-200">Odds</p>
                      <p className="text-white font-semibold">{formatOdds(forward.odds)}x</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Created</p>
                      <p className="text-white font-semibold">{formatDate(forward.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Stake Information */}
                <div className="bg-white/5 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-blue-200 text-sm">Stake Amount</p>
                    {decryptedStakes[forward.id] ? (
                      <p className="text-white font-semibold">{decryptedStakes[forward.id]} ETH</p>
                    ) : (
                      <button
                        onClick={() => decryptStake(forward.id, forward.encryptedStakeRef)}
                        disabled={isDecrypting[forward.id]}
                        className="text-blue-300 hover:text-blue-100 text-sm disabled:opacity-50"
                      >
                        {isDecrypting[forward.id] ? "Decrypting..." : "🔓 Decrypt"}
                      </button>
                    )}
                  </div>
                  {!decryptedStakes[forward.id] && (
                    <p className="text-blue-200 text-xs">🔒 Encrypted with iExec</p>
                  )}
                </div>

                {/* Status and Actions */}
                <div className="space-y-2">
                  {forward.forSale ? (
                    <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3">
                      <p className="text-yellow-200 text-sm font-semibold">Listed for Sale</p>
                      <p className="text-yellow-300 text-sm">{forward.price / 1e18} ETH</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200">
                        List for Sale
                      </button>
                      <Link 
                        href={`/marketplace?forward=${forward.id}`}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 text-center block"
                      >
                        View in Marketplace
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-2xl font-semibold text-white mb-4">Managing Your Positions</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔓</div>
              <h4 className="text-lg font-semibold text-white mb-2">Decrypt Stakes</h4>
              <p className="text-blue-200 text-sm">
                Only you can decrypt your stake amounts using your wallet signature
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h4 className="text-lg font-semibold text-white mb-2">List for Sale</h4>
              <p className="text-blue-200 text-sm">
                List your forwards on the marketplace to trade with other users
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">📈</div>
              <h4 className="text-lg font-semibold text-white mb-2">Track Performance</h4>
              <p className="text-blue-200 text-sm">
                Monitor how your locked odds compare to current market odds
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
