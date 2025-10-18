import { useState } from "react";
import { formatPrice, formatOdds, shortenAddress, getMatchDisplayName } from "../lib/marketplace";
import { type Forward } from "../lib/marketplace";

interface ForwardCardProps {
  forward: Forward;
  onBuy: () => void;
  disabled?: boolean;
  isBuying?: boolean;
  currentUser?: string;
}

export default function ForwardCard({ 
  forward, 
  onBuy, 
  disabled = false, 
  isBuying = false,
  currentUser 
}: ForwardCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const isOwner = currentUser && forward.owner.toLowerCase() === currentUser.toLowerCase();
  const canBuy = forward.forSale && !isOwner && !disabled;

  const handleBuyClick = () => {
    if (canBuy) {
      onBuy();
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 group">
      {/* Header */}
      <div className="mb-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-blue-100 transition-colors leading-tight">
            {getMatchDisplayName(forward.matchId)}
          </h3>
          {isOwner && (
            <span className="bg-blue-500/20 text-blue-200 text-xs px-2 py-1 rounded-full whitespace-nowrap ml-2">
              Your Forward
            </span>
          )}
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-3 text-sm">
          <div className="bg-white/5 rounded-lg p-2 sm:p-3">
            <p className="text-blue-200 text-xs mb-1">Odds</p>
            <p className="text-white font-semibold text-base sm:text-lg">{formatOdds(forward.odds)}x</p>
          </div>
          <div className="bg-white/5 rounded-lg p-2 sm:p-3">
            <p className="text-blue-200 text-xs mb-1">Price</p>
            <p className="text-white font-semibold text-base sm:text-lg">{formatPrice(forward.price)}</p>
          </div>
        </div>
      </div>

      {/* Seller Info */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-blue-200">Seller</span>
          <span className="text-white font-mono">{shortenAddress(forward.owner)}</span>
        </div>
      </div>

      {/* Stake Information */}
      <div className="bg-white/5 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-blue-200 text-sm">Stake Amount</p>
          <div className="flex items-center gap-2">
            <span className="text-blue-200 text-sm">🔒</span>
            <span className="text-blue-200 text-sm">Encrypted</span>
          </div>
        </div>
        <p className="text-blue-200 text-xs">
          {isOwner 
            ? "You can decrypt this stake in your positions" 
            : "Only the seller can decrypt their stake amount"
          }
        </p>
      </div>

      {/* Details Toggle */}
      <div className="mb-4">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="text-blue-300 hover:text-blue-100 text-sm flex items-center gap-1 transition-colors"
        >
          <span>{showDetails ? "Hide" : "Show"} Details</span>
          <span className={`transform transition-transform ${showDetails ? 'rotate-180' : ''}`}>
            ▼
          </span>
        </button>
        
        {showDetails && (
          <div className="mt-3 bg-white/5 rounded-lg p-3 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-200">Forward ID:</span>
                <span className="text-white font-mono">#{forward.forwardId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Match ID:</span>
                <span className="text-white font-mono">{forward.matchId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-200">Encrypted Ref:</span>
                <span className="text-white font-mono text-xs break-all">
                  {forward.encryptedStakeRef.slice(0, 20)}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Button */}
      <div className="space-y-2">
        {isOwner ? (
          <div className="w-full bg-blue-600/20 border border-blue-500/50 rounded-lg p-3 text-center">
            <p className="text-blue-200 text-sm">This is your forward</p>
            <p className="text-blue-300 text-xs mt-1">
              View in <a href="/positions" className="underline hover:text-blue-100">Positions</a>
            </p>
          </div>
        ) : !forward.forSale ? (
          <div className="w-full bg-gray-600/20 border border-gray-500/50 rounded-lg p-3 text-center">
            <p className="text-gray-300 text-sm">Not for Sale</p>
          </div>
        ) : (
          <button
            onClick={handleBuyClick}
            disabled={disabled || isBuying}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-sm sm:text-base"
          >
            {isBuying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Processing...</span>
              </>
            ) : (
              <>
                <span className="text-base sm:text-lg">💰</span>
                <span className="truncate">Buy for {formatPrice(forward.price)}</span>
              </>
            )}
          </button>
        )}
        
        {/* Additional Info */}
        <div className="text-center">
          <p className="text-blue-200 text-xs">
            {isOwner 
              ? "You own this forward position" 
              : forward.forSale 
                ? "Click to purchase this forward" 
                : "This forward is not available for purchase"
            }
          </p>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${forward.forSale ? 'bg-green-400' : 'bg-gray-400'}`}></div>
          <span className="text-blue-200">
            {forward.forSale ? 'Available' : 'Not for Sale'}
          </span>
        </div>
        
        {isBuying && (
          <div className="flex items-center gap-1 text-yellow-300">
            <div className="animate-pulse w-2 h-2 bg-yellow-300 rounded-full"></div>
            <span>Processing</span>
          </div>
        )}
      </div>
    </div>
  );
}
