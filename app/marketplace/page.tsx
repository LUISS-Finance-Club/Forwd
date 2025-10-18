"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWalletButton } from "@coinbase/onchainkit";
import Link from "next/link";

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

export default function Marketplace() {
  const { isConnected, address } = useAccount();
  const [forwardsForSale, setForwardsForSale] = useState<Forward[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [buyingForward, setBuyingForward] = useState<number | null>(null);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Mock data for demonstration - in real app, fetch from contract
  const mockForwardsForSale: Forward[] = [
    {
      id: 3,
      matchId: "match-1",
      owner: "0x1234567890123456789012345678901234567890",
      odds: 220, // 2.2x in basis points
      encryptedStakeRef: "encrypted-ref-789",
      forSale: true,
      price: 1500000000000000000, // 1.5 ETH in wei
      createdAt: Date.now() - 3600000, // 1 hour ago
    },
    {
      id: 4,
      matchId: "match-2",
      owner: "0x0987654321098765432109876543210987654321",
      odds: 190, // 1.9x in basis points
      encryptedStakeRef: "encrypted-ref-101",
      forSale: true,
      price: 800000000000000000, // 0.8 ETH in wei
      createdAt: Date.now() - 7200000, // 2 hours ago
    },
    {
      id: 5,
      matchId: "match-3",
      owner: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
      odds: 250, // 2.5x in basis points
      encryptedStakeRef: "encrypted-ref-202",
      forSale: true,
      price: 2000000000000000000, // 2 ETH in wei
      createdAt: Date.now() - 1800000, // 30 minutes ago
    },
  ];

  useEffect(() => {
    // Filter out forwards owned by current user
    const availableForwards = mockForwardsForSale.filter(forward => 
      !address || forward.owner.toLowerCase() !== address.toLowerCase()
    );
    setForwardsForSale(availableForwards);
    setIsLoading(false);
  }, [address]);

  const handleBuyForward = async (forwardId: number, price: number) => {
    if (!isConnected) return;

    setBuyingForward(forwardId);

    try {
      // TODO: Replace with actual contract address after deployment
      const contractAddress = "0x0000000000000000000000000000000000000000";
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            name: "buyForward",
            type: "function",
            stateMutability: "payable",
            inputs: [{ name: "_forwardId", type: "uint256" }],
            outputs: [],
          },
        ],
        functionName: "buyForward",
        args: [forwardId],
        value: BigInt(price),
      });
    } catch (err) {
      console.error("Buy transaction failed:", err);
    } finally {
      setBuyingForward(null);
    }
  };

  const formatOdds = (odds: number) => {
    return (odds / 100).toFixed(1);
  };

  const formatPrice = (price: number) => {
    return (price / 1e18).toFixed(2);
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

  const shortenAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <Link href="/" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-white mt-2">Marketplace</h1>
            <p className="text-blue-200">Buy and sell forward positions</p>
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

        {/* Success Message */}
        {isSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mb-6">
            <p className="text-green-200">Forward purchased successfully!</p>
            <Link href="/positions" className="text-green-300 hover:text-green-100 underline">
              View your positions →
            </Link>
          </div>
        )}

        {/* Marketplace Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{forwardsForSale.length}</div>
              <div className="text-blue-200 text-sm">Forwards for Sale</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {forwardsForSale.length > 0 ? 
                  (forwardsForSale.reduce((sum, f) => sum + f.price, 0) / 1e18).toFixed(1) : 
                  "0"
                }
              </div>
              <div className="text-blue-200 text-sm">Total Value (ETH)</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {forwardsForSale.length > 0 ? 
                  (forwardsForSale.reduce((sum, f) => sum + f.odds, 0) / forwardsForSale.length / 100).toFixed(1) : 
                  "0"
                }x
              </div>
              <div className="text-blue-200 text-sm">Average Odds</div>
            </div>
          </div>
        </div>

        {/* Forwards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading marketplace...</p>
          </div>
        ) : forwardsForSale.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Forwards Available</h2>
            <p className="text-blue-200 mb-6">There are currently no forwards listed for sale.</p>
            <Link 
              href="/matches"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Lock Your Own Forward
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forwardsForSale.map((forward) => (
              <div key={forward.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {getMatchName(forward.matchId)}
                  </h3>
                  <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <p className="text-blue-200">Odds</p>
                      <p className="text-white font-semibold">{formatOdds(forward.odds)}x</p>
                    </div>
                    <div>
                      <p className="text-blue-200">Price</p>
                      <p className="text-white font-semibold">{formatPrice(forward.price)} ETH</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-blue-200">Seller</p>
                    <p className="text-white font-mono">{shortenAddress(forward.owner)}</p>
                  </div>
                </div>

                {/* Stake Info */}
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-blue-200 text-sm">Stake Amount</p>
                    <p className="text-blue-200 text-sm">🔒 Encrypted</p>
                  </div>
                  <p className="text-blue-200 text-xs mt-1">
                    Only the seller can decrypt their stake amount
                  </p>
                </div>

                {/* Buy Button */}
                <button
                  onClick={() => handleBuyForward(forward.id, forward.price)}
                  disabled={!isConnected || isPending || isConfirming || buyingForward === forward.id}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  {buyingForward === forward.id ? "Processing..." : 
                   isPending ? "Confirming..." : 
                   isConfirming ? "Processing..." :
                   `Buy for ${formatPrice(forward.price)} ETH`}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-2xl font-semibold text-white mb-4">How the Marketplace Works</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl mb-2">🔍</div>
              <h4 className="text-lg font-semibold text-white mb-2">Browse Forwards</h4>
              <p className="text-blue-200 text-sm">
                Find forwards with odds and prices that match your trading strategy
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">💰</div>
              <h4 className="text-lg font-semibold text-white mb-2">Buy Positions</h4>
              <p className="text-blue-200 text-sm">
                Purchase forwards with ETH and instantly become the new owner
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2">🔒</div>
              <h4 className="text-lg font-semibold text-white mb-2">Privacy Protected</h4>
              <p className="text-blue-200 text-sm">
                Stake amounts remain encrypted - only owners can decrypt their stakes
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
