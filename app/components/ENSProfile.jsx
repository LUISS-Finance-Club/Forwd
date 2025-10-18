'use client';
import { useState, useEffect } from 'react';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com')
});

export default function ENSProfile({ address }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function loadProfile() {
      try {
        const ensName = await ensClient.getEnsName({ address });
        
        if (ensName) {
          const [avatar, twitter, discord, description] = await Promise.all([
            ensClient.getEnsAvatar({ name: ensName }).catch(() => null),
            ensClient.getEnsText({ name: ensName, key: 'com.twitter' }).catch(() => null),
            ensClient.getEnsText({ name: ensName, key: 'com.discord' }).catch(() => null),
            ensClient.getEnsText({ name: ensName, key: 'description' }).catch(() => null)
          ]);
          
          setProfile({ ensName, avatar, twitter, discord, description });
        }
      } catch (error) {
        console.log('No ENS profile');
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [address]);
  
  if (loading) return <div style={{ fontSize: '12px', color: '#666' }}>Loading profile...</div>;
  if (!profile) return <div style={{ fontSize: '12px', color: '#666' }}>{address?.slice(0, 6)}...{address?.slice(-4)}</div>;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      padding: '10px',
      background: '#1a1a1a',
      borderRadius: '8px',
      border: '1px solid #0052FF'
    }}>
      {profile.avatar && (
        <img 
          src={profile.avatar} 
          alt="Avatar" 
          style={{ width: '40px', height: '40px', borderRadius: '50%' }} 
        />
      )}
      <div>
        <div style={{ fontWeight: 'bold', color: '#0052FF' }}>{profile.ensName}</div>
        {profile.description && (
          <div style={{ fontSize: '12px', color: '#888' }}>{profile.description.slice(0, 50)}...</div>
        )}
        <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
          {profile.twitter && `🐦 @${profile.twitter} `}
          {profile.discord && `💬 ${profile.discord}`}
        </div>
      </div>
    </div>
  );
}
