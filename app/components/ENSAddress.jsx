'use client';
import { useState, useEffect } from 'react';
import { reverseResolveENS, formatAddressSync } from '../utils/ens';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com')
});

export default function ENSAddress({ address, showAvatar = false }) {
  const [displayName, setDisplayName] = useState(formatAddressSync(address));
  const [avatar, setAvatar] = useState(null);
  const [isENS, setIsENS] = useState(false);
  
  useEffect(() => {
    if (!address) return;
    
    // Resolve ENS name
    reverseResolveENS(address).then(ensName => {
      if (ensName) {
        setDisplayName(ensName);
        setIsENS(true);
        
        // Get avatar if requested
        if (showAvatar) {
          ensClient.getEnsAvatar({ name: ensName }).then(avatarUrl => {
            if (avatarUrl) setAvatar(avatarUrl);
          });
        }
      }
    });
  }, [address, showAvatar]);
  
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {showAvatar && avatar && (
        <img 
          src={avatar} 
          alt="ENS Avatar" 
          style={{ 
            width: '24px', 
            height: '24px', 
            borderRadius: '50%' 
          }} 
        />
      )}
      <span style={{ 
        fontFamily: isENS ? 'monospace' : 'inherit',
        color: isENS ? '#0052FF' : 'inherit',
        fontWeight: isENS ? 'bold' : 'normal'
      }}>
        {displayName}
      </span>
    </span>
  );
}
