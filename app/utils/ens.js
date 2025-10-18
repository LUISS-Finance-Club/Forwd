// ENS Resolution Utility
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

// Create ENS client (mainnet only, ENS lives on Ethereum mainnet)
const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com') // Free public RPC
});

/**
 * Resolve ENS name to address
 * @param {string} ensName - e.g., "vitalik.eth"
 * @returns {Promise<string|null>} Address or null
 */
export async function resolveENS(ensName) {
  try {
    if (!ensName.endsWith('.eth')) return null;
    
    const address = await ensClient.getEnsAddress({
      name: ensName
    });
    
    return address;
  } catch (error) {
    console.warn('ENS resolution failed:', error);
    return null;
  }
}

/**
 * Reverse resolve address to ENS name
 * @param {string} address - e.g., "0x123..."
 * @returns {Promise<string|null>} ENS name or null
 */
export async function reverseResolveENS(address) {
  try {
    if (!address || !address.startsWith('0x')) return null;
    
    const ensName = await ensClient.getEnsName({
      address: address
    });
    
    return ensName;
  } catch (error) {
    console.warn('Reverse ENS resolution failed:', error);
    return null;
  }
}

/**
 * Format address with ENS fallback
 * @param {string} address - Full address
 * @returns {Promise<string>} ENS name or shortened address
 */
export async function formatAddress(address) {
  if (!address) return '';
  
  // Try to get ENS name
  const ensName = await reverseResolveENS(address);
  
  if (ensName) {
    return ensName; // Return full ENS (e.g., "vitalik.eth")
  }
  
  // Fallback to shortened address
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Format address with ENS (synchronous, cached)
 * For initial render before ENS resolves
 */
export function formatAddressSync(address) {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}
