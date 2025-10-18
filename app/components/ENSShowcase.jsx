'use client';
import ENSProfile from './ENSProfile';

export default function ENSShowcase() {
  const famousAddresses = [
    { address: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045', label: 'Vitalik Buterin' },
    { address: '0x983110309620D911731Ac0932219af06091b6744', label: 'ENS Founder' },
    { address: '0x225f137127d9067788314bc7fcc1f36746a3c3B5', label: 'Lido Finance' }
  ];
  
  return (
    <div style={{ 
      padding: '30px',
      background: '#0a0a0a',
      borderRadius: '16px',
      border: '1px solid #333'
    }}>
      <h2 style={{ marginBottom: '10px' }}>🎯 ENS Integration Showcase</h2>
      <p style={{ color: '#888', marginBottom: '30px' }}>
        PreStake supports full ENS profiles with avatars, social links, and rich metadata
      </p>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        {famousAddresses.map(({ address, label }) => (
          <div key={address}>
            <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>{label}</p>
            <ENSProfile address={address} />
          </div>
        ))}
      </div>
      
      <div style={{ 
        marginTop: '30px',
        padding: '20px',
        background: '#1a1a1a',
        borderRadius: '12px',
        border: '1px solid #0052FF'
      }}>
        <h3 style={{ fontSize: '16px', marginBottom: '10px' }}>✅ ENS Features Implemented:</h3>
        <ul style={{ fontSize: '14px', color: '#888', lineHeight: '1.8' }}>
          <li>✅ Reverse ENS resolution (address → .eth name)</li>
          <li>✅ ENS avatar display (NFT & image support)</li>
          <li>✅ ENS text records (Twitter, Discord, description)</li>
          <li>✅ Rich profile cards with social metadata</li>
          <li>✅ Automatic fallback for non-ENS addresses</li>
          <li>✅ Free ENS lookup (no API costs)</li>
        </ul>
      </div>
    </div>
  );
}
