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
    <div className="card-interactive animate-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {getMatchDisplayName(forward.matchId)}
            </h3>
            <div className="flex items-center space-x-2">
              <span className="badge badge-primary">
                Forward #{forward.forwardId}
              </span>
              {isOwner && (
                <span className="badge badge-success">
                  Your Forward
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">
              {new Date(forward.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Odds and Price Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-gray-600 mb-1">Odds</div>
              <div className="text-xl font-bold text-blue-600">
                {formatOdds(forward.odds)}x
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-600 mb-1">Price</div>
              <div className="text-xl font-bold text-purple-600">
                {formatPrice(forward.price)}
              </div>
            </div>
          </div>
        </div>

        {/* Seller Info */}
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Seller</span>
            <span className="text-sm font-mono text-gray-900">
              {shortenAddress(forward.owner)}
            </span>
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
                <span className="text-xs text-red-600">Error</span>
              ) : (
                <span className="text-sm text-gray-500">🔒 Encrypted</span>
              )
            ) : (
              <span className="text-sm text-gray-500">🔒 Encrypted</span>
            )}
          </div>
          
          <div className="text-xs text-gray-500">
            {isOwner
              ? "Your stake is decrypted"
              : "Only the owner can decrypt their stake amount"}
          </div>
          
          {decryptionError && (
            <div className="text-xs text-red-600 bg-red-50 rounded p-2 mt-2">
              {decryptionError}
            </div>
          )}
        </div>

        {/* Details Toggle */}
        <div className="mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="btn-ghost btn-sm text-xs w-full"
          >
            <div className="flex items-center justify-center space-x-2">
              <span>{showDetails ? "Hide" : "Show"} Details</span>
              <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </div>
          </button>
          
          {showDetails && (
            <div className="mt-3 bg-gray-50 rounded-lg p-3 text-xs animate-slide-up">
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
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 text-center">
              <div className="text-sm font-medium text-blue-800">You own this forward</div>
              <div className="text-xs text-blue-600 mt-1">
                View in <a href="/positions" className="underline hover:text-blue-800">Positions</a>
              </div>
            </div>
          ) : !forward.forSale ? (
            <div className="bg-gray-100 border border-gray-300 rounded-lg p-3 text-center">
              <div className="text-sm text-gray-600">Not for Sale</div>
            </div>
          ) : (
            <button
              onClick={handleBuyClick}
              disabled={disabled || isBuying}
              className="btn-secondary btn-md w-full touch-manipulation"
            >
              {isBuying ? (
                <div className="flex items-center space-x-2">
                  <div className="spinner w-4 h-4"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Buy for {formatPrice(forward.price)}</span>
                </div>
              )}
            </button>
          )}
        </div>

        {/* Status Indicators */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${forward.forSale ? 'bg-emerald-400' : 'bg-gray-400'}`}></div>
              <span>{forward.forSale ? 'Available' : 'Not for Sale'}</span>
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