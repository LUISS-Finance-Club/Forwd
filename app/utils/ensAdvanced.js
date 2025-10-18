import { createPublicClient, http, normalize } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com')
});

/**
 * Get ENS avatar image
 */
export async function getENSAvatar(address) {
  try {
    const avatar = await ensClient.getEnsAvatar({
      name: normalize(address)
    });
    return avatar;
  } catch {
    return null;
  }
}

/**
 * Get ENS text records (Twitter, Discord, etc.)
 */
export async function getENSTextRecords(ensName) {
  try {
    const records = await Promise.all([
      ensClient.getEnsText({ name: normalize(ensName), key: 'com.twitter' }),
      ensClient.getEnsText({ name: normalize(ensName), key: 'com.discord' }),
      ensClient.getEnsText({ name: normalize(ensName), key: 'url' }),
      ensClient.getEnsText({ name: normalize(ensName), key: 'description' })
    ]);
    
    return {
      twitter: records[0],
      discord: records[1],
      url: records[2],
      description: records[3]
    };
  } catch {
    return null;
  }
}
