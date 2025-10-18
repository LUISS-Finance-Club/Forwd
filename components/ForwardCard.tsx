"use client";
import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { formatPrice, formatOdds, shortenAddress, getMatchDisplayName, type Forward } from "../lib/marketplace";
import { decryptStake, isMockEncryptedRef, formatStakeAmount, DecryptionResult } from "../lib/iexec";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    }
  }, [isOwner, forward.encryptedStakeRef]);

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] bg-white/10 backdrop-blur-sm border-white/20">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-t-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚽</span>
            </div>
            <CardTitle className="text-lg text-white">
              {getMatchDisplayName(forward.matchId)}
            </CardTitle>
          </div>
          <Badge variant={forward.forSale ? "default" : "secondary"}>
            {forward.forSale ? "Available" : "Not for Sale"}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between text-white/80">
          <span className="text-sm">Odds: {formatOdds(forward.odds)}</span>
          <span className="text-sm">{formatTimeAgo(forward.createdAt)}</span>
        </div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Price and Owner Info */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">Price</div>
            <div className="text-xl font-bold text-primary">{formatPrice(forward.price)}</div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Owner</div>
            <div className="text-sm font-mono">{shortenAddress(forward.owner)}</div>
          </div>
        </div>

        {/* Stake Information */}
        <div className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-emerald-600">🔒</span>
              <span className="text-sm font-medium">Encrypted Stake</span>
            </div>
            {isOwner && decryptedStake && (
              <div className="text-sm font-semibold text-emerald-600">
                {decryptedStake}
              </div>
            )}
          </div>
          
          {isOwner && isDecrypting && (
            <div className="mt-2 text-xs text-muted-foreground">
              Decrypting...
            </div>
          )}
          
          {isOwner && decryptionError && (
            <div className="mt-2 text-xs text-destructive">
              {decryptionError}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex space-x-2">
          {canBuy ? (
            <Button 
              onClick={onBuy}
              disabled={disabled || isBuying}
              className="flex-1"
            >
              {isBuying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Buying...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>💰</span>
                  <span>Buy Now</span>
                </div>
              )}
            </Button>
          ) : isOwner ? (
            <Button variant="outline" className="flex-1" disabled>
              <div className="flex items-center space-x-2">
                <span>👤</span>
                <span>You Own This</span>
              </div>
            </Button>
          ) : (
            <Button variant="outline" className="flex-1" disabled>
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Not for Sale</span>
              </div>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide" : "Show"} Details
          </Button>
        </div>

        {/* Additional Details */}
        {showDetails && (
          <div className="pt-3 border-t space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Forward ID</div>
                <div className="font-mono">#{forward.forwardId}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Created</div>
                <div>{new Date(forward.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            <div className="text-sm">
              <div className="text-muted-foreground mb-1">Encrypted Reference</div>
              <div className="font-mono text-xs bg-muted p-2 rounded break-all">
                {forward.encryptedStakeRef}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}