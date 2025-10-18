"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { ConnectWalletButton } from "@coinbase/onchainkit";
import Link from "next/link";
import { DataProtector } from "@iexec/dataprotector";

interface LockFormData {
  matchId: string;
  odds: number;
  stakeAmount: number;
}

export default function LockPage({ params }: { params: { id: string } }) {
  const { isConnected, address } = useAccount();
  const [formData, setFormData] = useState<LockFormData>({
    matchId: params.id,
    odds: 0,
    stakeAmount: 0,
  });
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [encryptedRef, setEncryptedRef] = useState<string>("");
  const [error, setError] = useState<string>("");

  // Mock match data - in real app, fetch from API
  const matchData = {
    "match-1": { homeTeam: "Manchester United", awayTeam: "Liverpool", currentOdds: 2.1 },
    "match-2": { homeTeam: "Barcelona", awayTeam: "Real Madrid", currentOdds: 1.8 },
    "match-3": { homeTeam: "Bayern Munich", awayTeam: "Borussia Dortmund", currentOdds: 2.5 },
  };

  const match = matchData[params.id as keyof typeof matchData];

  useEffect(() => {
    if (match) {
      setFormData(prev => ({ ...prev, odds: match.currentOdds }));
    }
  }, [match]);

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleEncryptStake = async () => {
    if (!formData.stakeAmount || formData.stakeAmount <= 0) {
      setError("Please enter a valid stake amount");
      return;
    }

    setIsEncrypting(true);
    setError("");

    try {
      // Initialize iExec DataProtector
      const dataProtector = new DataProtector({
        apiUrl: process.env.NEXT_PUBLIC_IEXEC_API_URL || "https://v7.bellecour.iex.ec/api",
      });

      // Encrypt stake data
      const data = { stakeAmount: formData.stakeAmount };
      const result = await dataProtector.protectData({ data });
      
      setEncryptedRef(result.address);
      console.log("Encrypted stake reference:", result.address);
    } catch (err) {
      console.error("Encryption failed:", err);
      setError("Failed to encrypt stake data. Please try again.");
    } finally {
      setIsEncrypting(false);
    }
  };

  const handleLockForward = async () => {
    if (!encryptedRef) {
      setError("Please encrypt your stake first");
      return;
    }

    setIsLocking(true);
    setError("");

    try {
      // TODO: Replace with actual contract address after deployment
      const contractAddress = "0x0000000000000000000000000000000000000000";
      
      writeContract({
        address: contractAddress as `0x${string}`,
        abi: [
          {
            name: "lockForward",
            type: "function",
            stateMutability: "nonpayable",
            inputs: [
              { name: "_matchId", type: "string" },
              { name: "_odds", type: "uint256" },
              { name: "_encryptedStakeRef", type: "string" },
            ],
            outputs: [{ name: "", type: "uint256" }],
          },
        ],
        functionName: "lockForward",
        args: [formData.matchId, Math.floor(formData.odds * 100), encryptedRef],
      });
    } catch (err) {
      console.error("Contract call failed:", err);
      setError("Failed to lock forward. Please try again.");
    } finally {
      setIsLocking(false);
    }
  };

  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Match Not Found</h1>
          <Link href="/matches" className="text-blue-200 hover:text-white">
            ← Back to Matches
          </Link>
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
            <Link href="/matches" className="text-blue-200 hover:text-white transition-colors">
              ← Back to Matches
            </Link>
            <h1 className="text-4xl font-bold text-white mt-2">Lock Forward</h1>
            <p className="text-blue-200">Lock odds for {match.homeTeam} vs {match.awayTeam}</p>
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

        {/* Main Form */}
        <div className="max-w-2xl mx-auto">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="space-y-6">
              {/* Match Info */}
              <div className="bg-white/5 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4">Match Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-blue-200 text-sm">Teams</p>
                    <p className="text-white font-semibold">{match.homeTeam} vs {match.awayTeam}</p>
                  </div>
                  <div>
                    <p className="text-blue-200 text-sm">Current Odds</p>
                    <p className="text-white font-semibold">{match.currentOdds}x</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Odds to Lock (multiplier)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="1.0"
                    value={formData.odds}
                    onChange={(e) => setFormData(prev => ({ ...prev, odds: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter odds multiplier"
                  />
                </div>

                <div>
                  <label className="block text-blue-200 text-sm font-medium mb-2">
                    Stake Amount (ETH)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={formData.stakeAmount}
                    onChange={(e) => setFormData(prev => ({ ...prev, stakeAmount: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter stake amount"
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-200">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {isSuccess && (
                <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                  <p className="text-green-200">Forward locked successfully!</p>
                  <Link href="/positions" className="text-green-300 hover:text-green-100 underline">
                    View your positions →
                  </Link>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                {!encryptedRef ? (
                  <button
                    onClick={handleEncryptStake}
                    disabled={!isConnected || isEncrypting || !formData.stakeAmount}
                    className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                  >
                    {isEncrypting ? "Encrypting..." : "Encrypt Stake"}
                  </button>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                      <p className="text-green-200 text-sm">✅ Stake encrypted successfully</p>
                      <p className="text-green-300 text-xs font-mono">{encryptedRef.slice(0, 20)}...</p>
                    </div>
                    
                    <button
                      onClick={handleLockForward}
                      disabled={!isConnected || isPending || isConfirming}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      {isPending ? "Confirming..." : isConfirming ? "Processing..." : "Lock Forward"}
                    </button>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <h4 className="text-blue-200 font-semibold mb-2">🔒 Privacy Notice</h4>
                <p className="text-blue-200 text-sm">
                  Your stake amount is encrypted using iExec DataProtector and only you can decrypt it. 
                  The encrypted reference is stored on-chain for transparency while keeping your stake private.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
