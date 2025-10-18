"use client";
import { useState, useMemo } from "react";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";
import Link from "next/link";
import { 
  getMarketForwards, 
  filterForwards, 
  getUniqueMatchIds,
  getMatchDisplayName,
  buyForwardContractCall,
  type MarketplaceFilters 
} from "../../lib/marketplace";
import ForwardCard from "../../components/ForwardCard";
import MobileNav from "../../components/MobileNav";

export default function MarketplacePage() {
  const { isConnected, address } = useAccount();
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sortBy: 'newest',
    sortOrder: 'desc',
  });
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buyError, setBuyError] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch marketplace data with React Query
  const { 
    data: forwards = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['marketForwards'],
    queryFn: getMarketForwards,
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Get unique match IDs for filter dropdown
  const matchIds = useMemo(() => getUniqueMatchIds(forwards), [forwards]);

  // Filter and sort forwards
  const filteredForwards = useMemo(() => {
    return filterForwards(forwards, filters);
  }, [forwards, filters]);

  // Filter out forwards owned by current user
  const availableForwards = useMemo(() => {
    if (!address) return filteredForwards;
    return filteredForwards.filter(forward => 
      forward.owner.toLowerCase() !== address.toLowerCase()
    );
  }, [filteredForwards, address]);

  const handleBuy = async (forwardId: number, price: bigint) => {
    if (!isConnected) {
      setBuyError("Please connect your wallet to buy forwards.");
      return;
    }
    
    setBuyingId(forwardId);
    setBuyError("");
    
    try {
      // Simulate contract call for now
      await buyForwardContractCall(forwardId, price.toString());
      refetch();
    } catch (e: unknown) {
      console.error("Buy transaction failed:", e);
      setBuyError(e instanceof Error ? e.message : "Failed to buy forward.");
    } finally {
      setBuyingId(null);
    }
  };

  const updateFilter = (key: keyof MarketplaceFilters, value: string | number | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      sortBy: 'newest',
      sortOrder: 'desc',
    });
  };

  const totalValue = availableForwards.reduce((sum, f) => sum + f.price, 0);
  const averageOdds = availableForwards.length > 0
    ? availableForwards.reduce((sum, f) => sum + f.odds, 0) / availableForwards.length
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <MobileNav isConnected={isConnected} address={address} />
      
      <main className="mobile-container pt-4">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Marketplace</h1>
          <p className="text-gray-600">Buy and sell forward positions</p>
        </div>

        {/* Wallet Connection Prompt */}
        {!isConnected && (
          <div className="card mb-6 animate-bounce-in">
            <div className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-2xl">🔗</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Connect Your Wallet</h3>
              <p className="text-sm text-gray-600 mb-4">
                Connect your wallet to buy forwards and start trading
              </p>
              <ConnectWallet />
            </div>
          </div>
        )}

        {/* Error Message */}
        {buyError && (
          <div className="card mb-6 animate-slide-up">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-red-600 text-xs">!</span>
                </div>
                <div className="flex-1">
                  <p className="text-red-800 text-sm">{buyError}</p>
                  <button 
                    onClick={() => setBuyError("")} 
                    className="text-red-600 hover:text-red-800 underline mt-2 text-xs"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Marketplace Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-2xl font-bold mb-1">{availableForwards.length}</div>
            <div className="text-blue-100 text-xs font-medium">For Sale</div>
          </div>
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-2xl font-bold mb-1">
              {totalValue.toFixed(2)} ETH
            </div>
            <div className="text-emerald-100 text-xs font-medium">Total Value</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg">
            <div className="text-2xl font-bold mb-1">
              {averageOdds.toFixed(1)}x
            </div>
            <div className="text-purple-100 text-xs font-medium">Avg Odds</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Filters & Sorting</h3>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="btn-ghost btn-sm"
              >
                <span>{showFilters ? "Hide" : "Show"} Filters</span>
              </button>
            </div>
            
            {showFilters && (
              <div className="space-y-4 animate-slide-up">
                {/* Match Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Match</label>
                  <select
                    value={filters.matchId || ""}
                    onChange={(e) => updateFilter('matchId', e.target.value || undefined)}
                    className="input"
                  >
                    <option value="">All Matches</option>
                    {matchIds.map(matchId => (
                      <option key={matchId} value={matchId}>
                        {getMatchDisplayName(matchId)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.minPrice || ""}
                      onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="input"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (ETH)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={filters.maxPrice || ""}
                      onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="input"
                      placeholder="10.00"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-') as [MarketplaceFilters['sortBy'], MarketplaceFilters['sortOrder']];
                      updateFilter('sortBy', sortBy);
                      updateFilter('sortOrder', sortOrder);
                    }}
                    className="input"
                  >
                    <option value="newest-desc">Newest First</option>
                    <option value="newest-asc">Oldest First</option>
                    <option value="price-asc">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="odds-asc">Odds: Low to High</option>
                    <option value="odds-desc">Odds: High to Low</option>
                  </select>
                </div>
                
                <div className="flex justify-center">
                  <button
                    onClick={clearFilters}
                    className="btn-outline btn-sm"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Forwards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="spinner w-12 h-12 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading marketplace...</p>
          </div>
        ) : error ? (
          <div className="card text-center py-12">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">⚠️</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Marketplace</h2>
            <p className="text-gray-600 mb-6">{error.message}</p>
            <button onClick={() => refetch()} className="btn-primary btn-md">
              Try Again
            </button>
          </div>
        ) : availableForwards.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏪</span>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">No Forwards Available</h2>
            <p className="text-gray-600 mb-6">
              There are currently no forwards listed for sale matching your criteria.
            </p>
            <Link
              href="/matches"
              className="btn-primary btn-md touch-manipulation"
            >
              <div className="flex items-center space-x-2">
                <span>⚽</span>
                <span>Lock Your Own Forward</span>
              </div>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {availableForwards.map((forward, index) => (
              <div
                key={forward.forwardId}
                className="animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <ForwardCard
                  forward={forward}
                  onBuy={() => handleBuy(forward.forwardId, BigInt(Math.floor(forward.price * 10**18)))}
                  disabled={!isConnected || buyingId === forward.forwardId}
                  isBuying={buyingId === forward.forwardId}
                />
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8">
          <div className="card">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3">
                <Link
                  href="/matches"
                  className="btn-outline btn-md touch-manipulation"
                >
                  <div className="flex items-center space-x-2">
                    <span>⚽</span>
                    <span>Lock Forward</span>
                  </div>
                </Link>
                <Link
                  href="/positions"
                  className="btn-outline btn-md touch-manipulation"
                >
                  <div className="flex items-center space-x-2">
                    <span>📈</span>
                    <span>My Positions</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-6 mb-8">
          <div className="card">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-3">How the Marketplace Works</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-blue-600">🔍</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Browse Forwards</div>
                    <div className="text-sm text-gray-600">Find forwards with odds and prices that match your trading strategy</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-emerald-600">💰</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Buy Positions</div>
                    <div className="text-sm text-gray-600">Purchase forwards with ETH and instantly become the new owner</div>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-purple-600">🔒</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">Privacy Protected</div>
                    <div className="text-sm text-gray-600">Stake amounts remain encrypted - only owners can decrypt their stakes</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}