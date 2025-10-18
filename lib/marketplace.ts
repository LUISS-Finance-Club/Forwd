// import { ethers } from 'ethers';

// Contract ABI - in real app, this would be imported from deployed contract
// const BETTING_FORWARDS_ABI = [
//   "function getForwardsForSale() external view returns (tuple(uint256 forwardId, string matchId, uint256 odds, address owner, string encryptedStakeRef, bool forSale, uint256 price)[])",
//   "function buyForward(uint256 forwardId) external payable",
//   "function getUserForwards(address user) external view returns (tuple(uint256 forwardId, string matchId, uint256 odds, address owner, string encryptedStakeRef, bool forSale, uint256 price)[])",
//   "function getMatchForwards(string matchId) external view returns (tuple(uint256 forwardId, string matchId, uint256 odds, address owner, string encryptedStakeRef, bool forSale, uint256 price)[])",
// ];

export interface Forward {
  forwardId: number;
  matchId: string;
  odds: number;
  owner: string;
  encryptedStakeRef: string;
  forSale: boolean;
  price: number;
}

export interface MarketplaceFilters {
  matchId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price' | 'newest' | 'odds';
  sortOrder?: 'asc' | 'desc';
}

/**
 * Mock function to fetch forwards for sale from contract
 * In production, this would connect to the actual smart contract
 */
export async function getMarketForwards(): Promise<Forward[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Mock data for demonstration
  const mockForwards: Forward[] = [
    {
      forwardId: 1,
      matchId: "match-1",
      odds: 210,
      owner: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
      encryptedStakeRef: "mock-encrypted-ref-1.5-1734567890123-match-1",
      forSale: true,
      price: 0.15,
    },
    {
      forwardId: 2,
      matchId: "match-2",
      odds: 180,
      owner: "0x8ba1f109551bD432803012645Hac136c",
      encryptedStakeRef: "mock-encrypted-ref-2.1-1734567890124-match-2",
      forSale: true,
      price: 0.25,
    },
    {
      forwardId: 3,
      matchId: "match-1",
      odds: 195,
      owner: "0x1234567890123456789012345678901234567890",
      encryptedStakeRef: "mock-encrypted-ref-0.8-1734567890125-match-1",
      forSale: true,
      price: 0.12,
    },
    {
      forwardId: 4,
      matchId: "match-3",
      odds: 250,
      owner: "0x9876543210987654321098765432109876543210",
      encryptedStakeRef: "mock-encrypted-ref-3.2-1734567890126-match-3",
      forSale: true,
      price: 0.35,
    },
    {
      forwardId: 5,
      matchId: "match-2",
      odds: 165,
      owner: "0x5555555555555555555555555555555555555555",
      encryptedStakeRef: "mock-encrypted-ref-1.8-1734567890127-match-2",
      forSale: true,
      price: 0.18,
    },
  ];

  return mockForwards;
}

/**
 * Filter forwards based on criteria
 */
export function filterForwards(forwards: Forward[], filters: MarketplaceFilters): Forward[] {
  let filtered = [...forwards];

  // Filter by match ID
  if (filters.matchId) {
    filtered = filtered.filter(forward => forward.matchId === filters.matchId);
  }

  // Filter by price range
  if (filters.minPrice !== undefined) {
    filtered = filtered.filter(forward => forward.price >= filters.minPrice!);
  }
  if (filters.maxPrice !== undefined) {
    filtered = filtered.filter(forward => forward.price <= filters.maxPrice!);
  }

  // Sort forwards
  if (filters.sortBy) {
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (filters.sortBy) {
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'odds':
          comparison = a.odds - b.odds;
          break;
        case 'newest':
          // Mock: use forwardId as proxy for creation time
          comparison = b.forwardId - a.forwardId;
          break;
      }
      
      return filters.sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  return filtered;
}

/**
 * Get unique match IDs from forwards
 */
export function getUniqueMatchIds(forwards: Forward[]): string[] {
  const matchIds = new Set(forwards.map(forward => forward.matchId));
  return Array.from(matchIds);
}

/**
 * Format price for display
 */
export function formatPrice(price: number): string {
  return `${price.toFixed(4)} ETH`;
}

/**
 * Format odds for display
 */
export function formatOdds(odds: number): string {
  return (odds / 100).toFixed(1);
}

/**
 * Shorten wallet address for display
 */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Mock function to buy a forward
 * In production, this would call the actual smart contract
 */
export async function buyForwardContractCall(forwardId: number, priceInWei: string): Promise<void> {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock success - in production, this would handle actual transaction
  console.log(`Buying forward ${forwardId} for ${priceInWei} wei`);
  
  // Simulate occasional failure for testing
  if (Math.random() < 0.1) {
    throw new Error('Transaction failed: Insufficient funds');
  }
}

/**
 * Get match display name
 */
export function getMatchDisplayName(matchId: string): string {
  const matchNames: Record<string, string> = {
    'match-1': 'Manchester United vs Liverpool',
    'match-2': 'Barcelona vs Real Madrid',
    'match-3': 'Arsenal vs Chelsea',
  };
  
  return matchNames[matchId] || `Match ${matchId}`;
}
