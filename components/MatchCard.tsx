"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

interface MatchCardProps {
  match: Match;
  onLockForward: () => void;
}

export default function MatchCard({ match, onLockForward }: MatchCardProps) {
  const { isConnected } = useAccount();
  const [isLoading, setIsLoading] = useState(false);

  const handleLockForward = async () => {
    if (!isConnected) return;
    
    setIsLoading(true);
    try {
      await onLockForward();
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "live":
        return "destructive";
      case "finished":
        return "secondary";
      default:
        return "default";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "live":
        return "LIVE";
      case "finished":
        return "FINISHED";
      default:
        return "UPCOMING";
    }
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] animate-slide-up">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-bold">⚽</span>
            </div>
            <CardTitle className="text-lg">{match.homeTeam} vs {match.awayTeam}</CardTitle>
          </div>
          <Badge variant={getStatusVariant(match.status)}>
            {getStatusText(match.status)}
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">
          {match.date} • {match.time}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              {match.homeLogo ? (
                <Image src={match.homeLogo} alt={match.homeTeam} width={24} height={24} className="w-6 h-6" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {match.homeTeam.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-semibold truncate">
              {match.homeTeam}
            </span>
          </div>
          
          <div className="px-3 py-1 bg-muted rounded-full mx-2">
            <span className="text-xs font-medium text-muted-foreground">VS</span>
          </div>
          
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <span className="font-semibold truncate">
              {match.awayTeam}
            </span>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
              {match.awayLogo ? (
                <Image src={match.awayLogo} alt={match.awayTeam} width={24} height={24} className="w-6 h-6" />
              ) : (
                <span className="text-xs font-bold text-muted-foreground">
                  {match.awayTeam.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Odds Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground mb-1">Current Odds</div>
              <div className="text-2xl font-bold text-primary">
                {(match.odds / 100).toFixed(1)}x
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground mb-1">Potential Return</div>
              <div className="text-sm font-semibold">
                +{(match.odds - 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <Button
            onClick={handleLockForward}
            disabled={!isConnected || isLoading || match.status !== "upcoming"}
            className="flex-1"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Lock Forward</span>
              </div>
            )}
          </Button>
          
          <Button asChild variant="outline" className="px-4">
            <Link href="/marketplace">
              <div className="flex items-center space-x-2">
                <span>🏪</span>
                <span>Marketplace</span>
              </div>
            </Link>
          </Button>
        </div>

        {/* Additional Info */}
        <div className="pt-3 border-t">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Lock your odds before the match starts</span>
            <span className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Encrypted stakes</span>
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}