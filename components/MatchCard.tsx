"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAccount } from "wagmi";

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-800";
      case "finished":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
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
    <div className="card-interactive animate-slide-up">
      <div className="p-4">
        {/* Match Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span className={`badge ${getStatusColor(match.status)}`}>
              {getStatusText(match.status)}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">{match.date}</div>
            <div className="text-xs text-gray-500">{match.time}</div>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3 flex-1">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {match.homeLogo ? (
                <Image src={match.homeLogo} alt={match.homeTeam} width={24} height={24} className="w-6 h-6" />
              ) : (
                <span className="text-xs font-bold text-gray-600">
                  {match.homeTeam.charAt(0)}
                </span>
              )}
            </div>
            <span className="font-semibold text-gray-900 truncate">
              {match.homeTeam}
            </span>
          </div>
          
          <div className="px-3 py-1 bg-gray-100 rounded-full mx-2">
            <span className="text-xs font-medium text-gray-600">VS</span>
          </div>
          
          <div className="flex items-center space-x-3 flex-1 justify-end">
            <span className="font-semibold text-gray-900 truncate">
              {match.awayTeam}
            </span>
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              {match.awayLogo ? (
                <Image src={match.awayLogo} alt={match.awayTeam} width={24} height={24} className="w-6 h-6" />
              ) : (
                <span className="text-xs font-bold text-gray-600">
                  {match.awayTeam.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Odds Display */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-3 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-600 mb-1">Current Odds</div>
              <div className="text-2xl font-bold text-blue-600">
                {(match.odds / 100).toFixed(1)}x
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-600 mb-1">Potential Return</div>
              <div className="text-sm font-semibold text-gray-900">
                +{(match.odds - 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={handleLockForward}
            disabled={!isConnected || isLoading || match.status !== "upcoming"}
            className="btn-primary btn-md flex-1 touch-manipulation"
          >
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="spinner w-4 h-4"></div>
                <span>Processing...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Lock Forward</span>
              </div>
            )}
          </button>
          
          <Link
            href="/marketplace"
            className="btn-outline btn-md px-4 touch-manipulation"
          >
            <div className="flex items-center space-x-2">
              <span>🏪</span>
              <span>Marketplace</span>
            </div>
          </Link>
        </div>

        {/* Additional Info */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Lock your odds before the match starts</span>
            <span className="flex items-center space-x-1">
              <span>🔒</span>
              <span>Encrypted stakes</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
