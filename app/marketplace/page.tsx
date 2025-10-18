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
  formatPrice,
  shortenAddress,
  buyForwardContractCall,
  type MarketplaceFilters 
} from "../../lib/marketplace";
import ForwardCard from "../../components/ForwardCard";

export default function Marketplace() {
  const { isConnected, address } = useAccount();
  const [filters, setFilters] = useState<MarketplaceFilters>({
    sortBy: 'newest',
    sortOrder: 'desc',
  });
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [buyError, setBuyError] = useState<string>("");

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

  const handleBuy = async (forwardId: number, price: number) => {
    if (!isConnected) {
      setBuyError("Please connect your wallet to buy forwards");
      return;
    }

    setBuyingId(forwardId);
    setBuyError("");

    try {
      await buyForwardContractCall(forwardId, price.toString());
      // Refetch data to update the marketplace
      refetch();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Purchase failed";
      setBuyError(errorMessage);
      console.error("Buy error:", err);
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

  const totalValue = availableForwards.reduce((sum, forward) => sum + forward.price, 0);
  const averageOdds = availableForwards.length > 0 
    ? availableForwards.reduce((sum, forward) => sum + forward.odds, 0) / availableForwards.length / 100
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div className="flex-1">
            <Link href="/" className="text-blue-200 hover:text-white transition-colors text-sm sm:text-base">
              ← Back to Home
            </Link>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mt-2">Marketplace</h1>
            <p className="text-blue-200 text-sm sm:text-base">Buy and sell forward positions</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {isConnected ? (
              <div className="text-white text-right sm:text-left">
                <p className="text-xs sm:text-sm text-blue-200">Connected as:</p>
                <p className="font-mono text-sm sm:text-base">{shortenAddress(address || "")}</p>
              </div>
            ) : (
              <div className="w-full sm:w-auto">
                <ConnectWallet />
              </div>
            )}
          </div>
        </header>

        {/* Error Message */}
        {buyError && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 mb-6">
            <p className="text-red-200">{buyError}</p>
            <button 
              onClick={() => setBuyError("")}
              className="text-red-300 hover:text-red-100 text-sm underline mt-1"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Marketplace Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{availableForwards.length}</div>
              <div className="text-blue-200 text-sm">Forwards for Sale</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {formatPrice(totalValue)}
              </div>
              <div className="text-blue-200 text-sm">Total Value (ETH)</div>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">
                {averageOdds.toFixed(1)}x
              </div>
              <div className="text-blue-200 text-sm">Average Odds</div>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 mb-8">
          <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Filters & Sorting</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Match Filter */}
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Match</label>
              <select
                value={filters.matchId || ""}
                onChange={(e) => updateFilter('matchId', e.target.value || undefined)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Min Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.minPrice || ""}
                onChange={(e) => updateFilter('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Max Price (ETH)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={filters.maxPrice || ""}
                onChange={(e) => updateFilter('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10.00"
              />
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-blue-200 text-sm font-medium mb-2">Sort By</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-') as [MarketplaceFilters['sortBy'], MarketplaceFilters['sortOrder']];
                  updateFilter('sortBy', sortBy);
                  updateFilter('sortOrder', sortOrder);
                }}
                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="newest-desc">Newest First</option>
                <option value="newest-asc">Oldest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="odds-asc">Odds: Low to High</option>
                <option value="odds-desc">Odds: High to Low</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-center sm:justify-end">
            <button
              onClick={clearFilters}
              className="text-blue-300 hover:text-blue-100 text-sm underline px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Forwards List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
            <p className="text-blue-200 mt-4">Loading marketplace...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold text-white mb-4">Error Loading Marketplace</h2>
            <p className="text-blue-200 mb-6">Failed to load marketplace data. Please try again.</p>
            <button
              onClick={() => refetch()}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Retry
            </button>
          </div>
        ) : availableForwards.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-2xl font-semibold text-white mb-4">No Forwards Available</h2>
            <p className="text-blue-200 mb-6">
              {filters.matchId || filters.minPrice || filters.maxPrice 
                ? "No forwards match your current filters." 
                : "There are currently no forwards listed for sale."
              }
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={clearFilters}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Clear Filters
              </button>
              <Link 
                href="/matches"
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
              >
                Lock Your Own Forward
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableForwards.map((forward) => (
              <ForwardCard
                key={forward.forwardId}
                forward={forward}
                onBuy={() => handleBuy(forward.forwardId, forward.price)}
                disabled={buyingId === forward.forwardId}
                isBuying={buyingId === forward.forwardId}
                currentUser={address}
              />
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