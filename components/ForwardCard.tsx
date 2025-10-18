"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatPrice, formatOdds, shortenAddress, getMatchDisplayName, type Forward } from "../lib/marketplace";
import { decryptStake, isMockEncryptedRef, formatStakeAmount, DecryptionResult } from "../lib/iexec";

interface ForwardCardProps {
  forward: Forward;
  onBuy: () => void;
  disabled?: boolean;
  isBuying?: boolean;
}

export default function ForwardCard({ 
  forward, 
  onBuy, 
  disabled = false, 
  isBuying = false
}: ForwardCardProps) {
  const { address } = useAccount();
  const [showDetails, setShowDetails] = useState(false);
  const [decryptedStake, setDecryptedStake] = useState<string | null>(null);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);

  const isOwner = address?.toLowerCase() === forward.owner.toLowerCase();
  const canBuy = forward.forSale && !isOwner && !disabled && !isBuying;

  useEffect(() => {
    if (isOwner && isMockEncryptedRef(forward.encryptedStakeRef)) {
      const fetchDecryptedStake = async () => {
        setIsDecrypting(true);
        setDecryptionError(null);
        try {
          const result: DecryptionResult = await decryptStake(forward.encryptedStakeRef);
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
  }, [isOwner, forward.encryptedStakeRef]);

  const handleBuyClick = () => {
    if (canBuy) {
      onBuy();
    }
  };

  return (
    <div className="group relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200">
      {/* Gradient Header */}
      <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 p-4 text-white">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <h3 className="font-bold text-lg leading-tight mb-1">
              {getMatchDisplayName(forward.matchId)}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                Forward #{forward.forwardId}
              </span>
              {isOwner && (
                <span className="bg-emerald-500/20 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium">
                  Your Forward
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-80">
              {new Date(forward.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
            <div className="text-xs text-blue-600 font-medium mb-1">Odds</div>
            <div className="text-xl font-bold text-blue-700">
              {formatOdds(forward.odds)}x
            </div>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
            <div className="text-xs text-emerald-600 font-medium mb-1">Price</div>
            <div className="text-xl font-bold text-emerald-700">
              {formatPrice(forward.price)}
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 border border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Seller</span>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">
                  {forward.owner.slice(2, 4).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-mono text-gray-900">
                {shortenAddress(forward.owner)}
              </span>
            </div>
          </div>
        </div>

        {/* Stake Information */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-3 mb-4 border border-purple-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-purple-700">Stake Amount</span>
            {isOwner ? (
              isDecrypting ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
                  <span className="text-xs text-purple-600">Decrypting...</span>
                </div>
              ) : decryptedStake ? (
                <span className="text-sm font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">
                  {decryptedStake}
                </span>
              ) : decryptionError ? (
                <span className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-lg">Error</span>
              ) : (
                <span className="text-sm text-purple-600">🔒 Encrypted</span>
              )
            ) : (
              <span className="text-sm text-purple-600">🔒 Encrypted</span>
            )}
          </div>
          
          <div className="text-xs text-purple-600">
            {isOwner
              ? "Your stake is decrypted"
              : "Only the owner can decrypt their stake amount"}
          </div>
          
          {decryptionError && (
            <div className="text-xs text-red-600 bg-red-50 rounded-lg p-2 mt-2 border border-red-200">
              {decryptionError}
            </div>
          )}
        </div>

        {/* Details Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2"
          >
            <span>{showDetails ? "Hide" : "Show"} Details</span>
            <span className={`transform transition-transform duration-200 ${showDetails ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>
          
          {showDetails && (
            <div className="mt-3 bg-gray-50 rounded-xl p-3 text-xs border border-gray-200 animate-slide-up">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Forward ID:</span>
                  <span className="font-mono text-gray-900">#{forward.forwardId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Match ID:</span>
                  <span className="font-mono text-gray-900">{forward.matchId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Encrypted Ref:</span>
                  <span className="font-mono text-gray-900 text-xs break-all">
                    {forward.encryptedStakeRef.slice(0, 20)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="text-gray-900">
                    {new Date(forward.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="space-y-2">
          {isOwner ? (
            <div className="bg-blue-100 border border-blue-300 rounded-xl p-3 text-center">
              <div className="text-sm font-medium text-blue-800">You own this forward</div>
              <div className="text-xs text-blue-600 mt-1">
                View in <a href="/positions" className="underline hover:text-blue-800">Positions</a>
              </div>
            </div>
          ) : !forward.forSale ? (
            <div className="bg-gray-100 border border-gray-300 rounded-xl p-3 text-center">
              <div className="text-sm text-gray-600">Not for Sale</div>
            </div>
          ) : (
            <button
              onClick={handleBuyClick}
              disabled={disabled || isBuying}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:transform-none"
            >
              {isBuying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <span className="text-lg">💰</span>
                  <span>Buy for {formatPrice(forward.price)}</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${forward.forSale ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              <span className="text-gray-600">
                {forward.forSale ? 'Available' : 'Not for Sale'}
              </span>
            </div>
            
            {isBuying && (
              <div className="flex items-center space-x-1 text-amber-600">
                <div className="animate-pulse w-2 h-2 bg-amber-600 rounded-full"></div>
                <span>Processing</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}