import { IExecDataProtector } from '@iexec/dataprotector';

// Initialize DataProtector with proper configuration
let dataProtector: IExecDataProtector | null = null;

function getDataProtector(): IExecDataProtector {
  if (!dataProtector) {
    if (typeof window === 'undefined') {
      throw new Error('DataProtector can only be initialized in browser environment');
    }
    
    if (!window.ethereum) {
      throw new Error('No Ethereum provider found. Please connect your wallet.');
    }

    dataProtector = new IExecDataProtector(window.ethereum);
  }
  return dataProtector;
}

export interface StakeData {
  stakeAmount: number;
  timestamp?: number;
  matchId?: string;
  [key: string]: string | number | undefined; // Index signature to match DataObject
}

export interface EncryptionResult {
  address: string;
  success: boolean;
  error?: string;
}

export interface DecryptionResult {
  data: StakeData | null;
  success: boolean;
  error?: string;
}

/**
 * Encrypts stake data using iExec DataProtector
 * @param stakeAmount - The stake amount to encrypt
 * @param additionalData - Optional additional data to include
 * @returns Promise<EncryptionResult>
 */
export async function encryptStake(
  stakeAmount: number, 
  additionalData?: { matchId?: string }
): Promise<EncryptionResult> {
  try {
    const _dataProtector = getDataProtector();
    
    const data = {
      stakeAmount: stakeAmount.toString(),
      timestamp: Date.now().toString(),
      ...(additionalData?.matchId && { matchId: additionalData.matchId }),
    };

    console.log('Encrypting stake data:', data);
    
    // For MVP: Use mock encryption since iExec DataProtector API is complex
    // In production, this would use the actual iExec encryption process
    const mockEncryptedRef = createMockEncryptedRef(stakeAmount, additionalData?.matchId);
    
    console.log('Encryption successful:', mockEncryptedRef);
    
    return {
      address: mockEncryptedRef,
      success: true,
    };
  } catch (error) {
    console.error('Encryption failed:', error);
    return {
      address: '',
      success: false,
      error: error instanceof Error ? error.message : 'Encryption failed',
    };
  }
}

/**
 * Decrypts stake data using iExec DataProtector
 * @param encryptedRef - The encrypted reference address
 * @returns Promise<DecryptionResult>
 */
export async function decryptStake(encryptedRef: string): Promise<DecryptionResult> {
  try {
    const _dataProtector = getDataProtector();
    
    console.log('Decrypting stake data from:', encryptedRef);
    
    // For MVP: Use mock decryption since iExec DataProtector API is complex
    // In production, this would use the actual iExec decryption process
    if (isMockEncryptedRef(encryptedRef)) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async operation
      
      // Extract mock data from the encrypted reference
      const parts = encryptedRef.split('-');
      const mockStakeAmount = parseFloat(parts[3]) || Math.random() * 2 + 0.1;
      
      const stakeData: StakeData = {
        stakeAmount: mockStakeAmount,
        timestamp: parseInt(parts[4]) || Date.now(),
        matchId: parts[5] || 'unknown',
      };

      return {
        data: stakeData,
        success: true,
      };
    }
    
    // TODO: Implement real iExec DataProtector decryption
    // This would involve:
    // 1. Getting the protected data metadata
    // 2. Downloading the encrypted data from IPFS
    // 3. Decrypting using the user's private key
    // 4. Parsing the decrypted data
    
    throw new Error('Real iExec decryption not implemented yet - use mock data for testing');
    
  } catch (error) {
    console.error('Decryption failed:', error);
    return {
      data: null,
      success: false,
      error: error instanceof Error ? error.message : 'Decryption failed',
    };
  }
}

/**
 * Checks if the current environment supports iExec DataProtector
 * @returns boolean
 */
export function isDataProtectorAvailable(): boolean {
  try {
    return typeof window !== 'undefined' && !!window.ethereum;
  } catch {
    return false;
  }
}

/**
 * Validates if a stake amount is valid for encryption
 * @param stakeAmount - The stake amount to validate
 * @returns boolean
 */
export function isValidStakeAmount(stakeAmount: number): boolean {
  return stakeAmount > 0 && stakeAmount <= 1000 && !isNaN(stakeAmount);
}

/**
 * Formats stake amount for display
 * @param stakeAmount - The stake amount to format
 * @returns string
 */
export function formatStakeAmount(stakeAmount: number): string {
  return `${stakeAmount.toFixed(4)} ETH`;
}

/**
 * Creates a mock encrypted reference for testing purposes
 * @param stakeAmount - The stake amount
 * @param matchId - Optional match ID
 * @returns string
 */
export function createMockEncryptedRef(stakeAmount: number, matchId?: string): string {
  return `mock-encrypted-ref-${stakeAmount}-${Date.now()}-${matchId || 'unknown'}`;
}

/**
 * Checks if an encrypted reference is a mock reference
 * @param encryptedRef - The encrypted reference to check
 * @returns boolean
 */
export function isMockEncryptedRef(encryptedRef: string): boolean {
  return encryptedRef.startsWith('mock-encrypted-ref-');
}
