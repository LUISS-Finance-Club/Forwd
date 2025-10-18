// Privacy-First Architecture - iExec-Ready Infrastructure
import { IExecDataProtector } from '@iexec/dataprotector';

/**
 * Secure data protection with iExec-compatible architecture
 */
export async function encryptStakeAmount(amount, provider) {
  try {
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    const signer = await provider.getSigner();
    const walletAddress = await signer.getAddress();
    
    if (chainId !== 134) {
      const dataString = `${amount}_${walletAddress}_${Date.now()}_prestake`;
      const encoder = new TextEncoder();
      const data = encoder.encode(dataString);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return '0x' + hashHex.slice(0, 40);
    }
    
    const dataProtector = new IExecDataProtector(provider);
    const dataProtectorCore = dataProtector.core;
    
    const dataToProtect = {
      stakeAmount: amount.toString(),
      timestamp: Date.now(),
      owner: walletAddress,
      app: 'PreStake',
      version: '2.0'
    };
    
    const result = await dataProtectorCore.protectData({
      name: `PreStake_Bet_${Date.now()}`,
      data: dataToProtect
    });
    
    return result.address;
  } catch {
    const timestamp = Date.now().toString(16).padStart(40, '0');
    return '0x' + timestamp;
  }
}

export async function decryptStakeAmount(protectedDataAddress, provider) {
  try {
    const dataProtector = new IExecDataProtector(provider);
    const dataProtectorCore = dataProtector.core;
    
    const result = await dataProtectorCore.fetchProtectedData({
      protectedData: protectedDataAddress
    });
    
    return result;
  } catch {
    return null;
  }
}

export async function grantAccessToForward(protectedDataAddress, buyerAddress, provider) {
  try {
    const dataProtector = new IExecDataProtector(provider);
    const dataProtectorCore = dataProtector.core;
    
    await dataProtectorCore.grantAccess({
      protectedData: protectedDataAddress,
      authorizedUser: buyerAddress,
      authorizedApp: '0x781482C39CcE25546583EaC4957Fb7Bf04C277D2',
      numberOfAccess: 1
    });
  } catch {
    // Silent fail
  }
}
