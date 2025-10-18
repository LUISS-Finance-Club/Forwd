"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { formatEther } from "viem";
import ENSProfile from './ENSProfile';

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const [forSaleForwards, setForSaleForwards] = useState([]);
  const [filteredForwards, setFilteredForwards] = useState([]);
  const [searchENS, setSearchENS] = useState('');
  
  const { data: allForwards } = useReadContract({
    address: CONTRACT_ADDRESS_V2,
    abi: CONTRACT_ABI_V2,
    functionName: "getAllForwards",
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (allForwards) {
      // ✅ FIXED: Show ALL forwards that are for sale (including your own)
      const filtered = allForwards
        .map((forward, index) => ({ ...forward, id: index }))
        .filter(f => f.isForSale); // Only filter by isForSale
      setForSaleForwards(filtered);
      setFilteredForwards(filtered);
    }
  }, [allForwards]);

  // ENS Search filter
  useEffect(() => {
    if (!searchENS) {
      setFilteredForwards(forSaleForwards);
      return;
    }
    
    const search = searchENS.toLowerCase();
    const filtered = forSaleForwards.filter(forward => 
      forward.owner.toLowerCase().includes(search) ||
      (forward.ensName && forward.ensName.toLowerCase().includes(search))
    );
    setFilteredForwards(filtered);
  }, [searchENS, forSaleForwards]);

  const buyForward = async (forwardId, premium) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: "buyForward",
        args: [BigInt(forwardId)],
        value: premium,
      });
      alert(`✅ Forward #${forwardId} purchased!`);
      
      // Refresh after 3 seconds
      setTimeout(() => window.location.reload(), 3000);
    } catch (error) {
      console.error(error);
      alert(`Failed to buy: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Please connect your wallet to view marketplace</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>🛒 Marketplace ({forSaleForwards.length} available)</h2>
      </div>

      {/* ENS SEARCH BOX */}
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="🔍 Search by ENS name (e.g., vitalik.eth) or address (0x...)"
          value={searchENS}
          onChange={(e) => setSearchENS(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid #333',
            background: '#1a1a1a',
            color: 'white',
            fontSize: '16px'
          }}
        />
        {searchENS && (
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            Found {filteredForwards.length} forward(s) matching "{searchENS}"
          </p>
        )}
      </div>

      {filteredForwards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>🛒 {searchENS ? 'No forwards match your search' : 'No forwards for sale yet!'}</h2>
          <p>{searchENS ? 'Try a different search term' : 'Be the first to list one'}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredForwards.map((forward) => {
            const isOwnForward = forward.owner.toLowerCase() === address?.toLowerCase();
            
            return (
              <div
                key={forward.id}
                style={{
                  background: "#1a1a1a",
                  border: isOwnForward ? "2px solid #0052FF" : "1px solid #00ff00",
                  borderRadius: "12px",
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                  <h3>Forward #{forward.id}</h3>
                  <div style={{ display: "flex", gap: "10px" }}>
                    {isOwnForward && (
                      <span style={{
                        padding: "5px 15px",
                        background: "#0052FF",
                        color: "white",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        👤 YOUR LISTING
                      </span>
                    )}
                    <span style={{
                      padding: "5px 15px",
                      background: "#00ff00",
                      color: "black",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "bold"
                    }}>
                      🟢 FOR SALE
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "grid", gap: "10px" }}>
                  <p>⚽ <strong>Match ID:</strong> {forward.matchId.toString()}</p>
                  <p>📊 <strong>Locked Odds:</strong> {(Number(forward.lockedOdds) / 1000).toFixed(2)}x</p>
                  <p>💰 <strong>Price:</strong> {formatEther(forward.premium)} ETH</p>
                  
                  {/* ENS PROFILE */}
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>👤 Seller:</strong>
                    <ENSProfile address={forward.owner} />
                  </div>
                </div>

                {isOwnForward ? (
                  <div style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "15px",
                    background: "#333",
                    borderRadius: "8px",
                    textAlign: "center",
                    color: "#888"
                  }}>
                    📝 This is your listing - Go to "My Forwards" to cancel
                  </div>
                ) : (
                  <button
                    onClick={() => buyForward(forward.id, forward.premium)}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      padding: "15px",
                      background: "#0052FF",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}
                  >
                    🛒 Buy for {formatEther(forward.premium)} ETH
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
