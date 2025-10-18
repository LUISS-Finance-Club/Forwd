"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { decryptStake, isMockEncryptedRef, formatStakeAmount, DecryptionResult } from "../lib/iexec";

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

interface PositionCardProps {
  position: Position;
  onListForSale: () => void;
  onDecryptStake: () => void;
}

export default function PositionCard({ position, onListForSale, onDecryptStake }: PositionCardProps) {
  const { address } = useAccount();
  const isOwner = address?.toLowerCase() === position.owner.toLowerCase();
  
  const [decryptedStake, setDecryptedStake] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [isListing, setIsListing] = useState(false);

  useEffect(() => {
    if (isOwner && isMockEncryptedRef(position.encryptedStakeRef)) {
      const fetchDecryptedStake = async () => {
        setIsDecrypting(true);
        setDecryptionError(null);
        try {
          const result: DecryptionResult = await decryptStake(position.encryptedStakeRef);
          if (result.success && result.data) {
            setDecryptedStake(formatStakeAmount(result.data.stakeAmount));
          } else {
            setDecryptionError(result.error || "Failed to decrypt stake.");
          }
        } catch (error) {
          console.error("Error decrypting stake:", error);
          setDecryptionError("Error decrypting stake.");
        } finally {
          setIsDecrypting(false);
        }
      };
      fetchDecryptedStake();
    } else {
      setDecryptedStake(null);
      setDecryptionError(null);
    }
  }, [isOwner, position.encryptedStakeRef]);

  const handleListForSale = async () => {
    setIsListing(true);
    try {
      await onListForSale();
    } finally {
      setIsListing(false);
    }
  };

  const handleDecryptStake = async () => {
    setIsDecrypting(true);
    setDecryptionError(null);
    try {
      await onDecryptStake();
      const result: DecryptionResult = await decryptStake(position.encryptedStakeRef);
      if (result.success && result.data) {
        setDecryptedStake(formatStakeAmount(result.data.stakeAmount));
      } else {
        setDecryptionError(result.error || "Failed to decrypt stake.");
      }
    } catch (error) {
      console.error("Error decrypting stake:", error);
      setDecryptionError("Error decrypting stake.");
    } finally {
      setIsDecrypting(false);
    }
  };

  const getMatchDisplayName = (matchId: string) => {
    const matchNames: Record<string, string> = {
      "match-1": "Manchester United vs Liverpool",
      "match-2": "Barcelona vs Real Madrid",
      "match-3": "Arsenal vs Chelsea",
      "match-4": "Bayern Munich vs Borussia Dortmund",
      "match-5": "PSG vs Marseille",
    };
    return matchNames[matchId] || `Match ${matchId.split('-')[1]}`;
  };

  const formatOdds = (odds: number) => {
    return (odds / 100).toFixed(2);
  };

  const formatPrice = (price: bigint) => {
    return `${parseFloat((price / BigInt(10**18)).toString()).toFixed(2)} ETH`;
  };

  return (
    <div className="card-interactive animate-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {getMatchDisplayName(position.matchId)}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="badge badge-primary">
                Forward #{position.forwardId}
              </span>
              {position.forSale && (
                <span className="badge badge-success">
                  Listed for Sale
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {new Date(position.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Odds Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Locked Odds</div>
              <div className="text-xl font-bold text-blue-600">
                {formatOdds(position.odds)}x
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Potential Return</div>
              <div className="text-sm font-semibold text-gray-900">
                +{(position.odds - 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Stake Information */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Stake Amount</span>
            {isOwner ? (
              isDecrypting ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-4 h-4"></div>
                  <span className="text-xs text-gray-500">Decrypting...</span>
                </div>
              ) : decryptedStake ? (
                <span className="text-sm font-semibold text-emerald-600">
                  {decryptedStake}
                </span>
              ) : decryptionError ? (
                <button
                  onClick={handleDecryptStake}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Retry Decryption
                </button>
              ) : (
                <button
                  onClick={handleDecryptStake}
                  className="btn-ghost btn-sm text-xs"
                >
                  🔓 Decrypt
                </button>
              )
            ) : (
              <span className="text-sm text-gray-500">🔒 Encrypted</span>
            )}
          </div>
          
          {decryptionError && (
            <div className="text-xs text-red-600 bg-red-50 rounded p-2">
              {decryptionError}
            </div>
          )}
          
          <div className="text-xs text-gray-500">
            {isOwner
              ? "Your encrypted stake amount"
              : "Only the owner can decrypt their stake"}
          </div>
        </div>

        {/* Sale Information */}
        {position.forSale && (
          <div className="bg-emerald-50 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-emerald-700 mb-1">Listed Price</div>
                <div className="text-lg font-bold text-emerald-600">
                  {formatPrice(position.price)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-emerald-700 mb-1">Status</div>
                <div className="text-sm font-semibold text-emerald-600">
                  For Sale
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          {isOwner ? (
            <div className="flex space-x-2">
              {!position.forSale ? (
                <button
                  onClick={handleListForSale}
                  disabled={isListing}
                  className="btn-secondary btn-md flex-1 touch-manipulation"
                >
                  {isListing ? (
                    <div className="flex items-center space-x-2">
                      <div className="spinner w-4 h-4"></div>
                      <span>Listing...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>💰</span>
                      <span>List for Sale</span>
                    </div>
                  )}
                </button>
              ) : (
                <div className="flex-1 bg-emerald-100 border border-emerald-300 rounded-lg p-3 text-center">
                  <div className="text-sm font-medium text-emerald-800">
                    Listed for {formatPrice(position.price)}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => window.location.href = `/marketplace`}
                className="btn-outline btn-md px-4 touch-manipulation"
              >
                <div className="flex items-center space-x-2">
                  <span>🏪</span>
                  <span>Marketplace</span>
                </div>
              </button>
            </div>
          ) : (
            <div className="bg-gray-100 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">
                You don&apos;t own this forward
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Created: {new Date(position.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Encrypted</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
