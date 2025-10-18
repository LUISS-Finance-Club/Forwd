"use client";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { formatEther, parseEther } from "viem";
import ENSAddress from "./ENSAddress";

export default function MyForwards() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  
  const [myForwards, setMyForwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // For selling
  const [sellingId, setSellingId] = useState(null);
  const [salePrice, setSalePrice] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchForwards = async () => {
    if (!isConnected || !address || !publicClient) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'getAllForwards',
      });

      if (!data || data.length === 0) {
        setMyForwards([]);
        return;
      }

      const filtered = data
        .map((forward, index) => ({ ...forward, id: index }))
        .filter(f => f.owner.toLowerCase() === address.toLowerCase());

      setMyForwards(filtered);

    } catch (err) {
      console.error("Error fetching forwards:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isConnected) {
      fetchForwards();
    }
  }, [mounted, isConnected, address, publicClient]);

  // List forward for sale
  const listForSale = async (forwardId) => {
    if (!salePrice || parseFloat(salePrice) <= 0) {
      alert("Please enter a valid price!");
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'listForSale',
        args: [BigInt(forwardId), parseEther(salePrice)]
      });
      
      alert(`✅ Forward #${forwardId} listed for ${salePrice} ETH!`);
      setSellingId(null);
      setSalePrice("");
      
      // Refresh after 3 seconds
      setTimeout(fetchForwards, 3000);
    } catch (err) {
      console.error("Error listing forward:", err);
      alert(`❌ Failed to list: ${err.message}`);
    }
  };

  // Cancel sale
  const cancelSale = async (forwardId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'cancelSale',
        args: [BigInt(forwardId)]
      });
      
      alert(`✅ Sale cancelled for Forward #${forwardId}`);
      
      // Refresh after 3 seconds
      setTimeout(fetchForwards, 3000);
    } catch (err) {
      console.error("Error cancelling sale:", err);
      alert(`❌ Failed to cancel: ${err.message}`);
    }
  };

  if (!mounted) {
    return <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>;
  }

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Please connect your wallet</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2 style={{ color: "#ff4444" }}>❌ Error loading forwards</h2>
        <p>{error}</p>
        <button onClick={fetchForwards}>🔄 Try Again</button>
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>⏳ Loading forwards...</h2>
      </div>
    );
  }

  if (myForwards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>📭 No forwards yet!</h2>
        <p>Lock your first forward to get started</p>
        <p style={{ color: "#0052FF", fontSize: "14px", marginTop: "20px" }}>
          🔐 Using V2 contract with iExec encryption
        </p>
        <p style={{ color: "#666", fontSize: "12px" }}>
          Connected: <ENSAddress address={address} />
        </p>
        <button onClick={fetchForwards}>🔄 Refresh</button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📊 My Forwards ({myForwards.length})</h2>
        <button onClick={fetchForwards} disabled={loading}>
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
      </div>
      
      <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>
        {myForwards.map((forward) => (
          <div
            key={forward.id}
            style={{
              background: "#1a1a1a",
              border: forward.isForSale ? "2px solid #00ff00" : "1px solid #333",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>Forward #{forward.id}</h3>
              {forward.isForSale && (
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
              )}
            </div>
            
            <p>⚽ <strong>Match ID:</strong> {forward.matchId?.toString()}</p>
            <p>📊 <strong>Locked Odds:</strong> {forward.lockedOdds ? (Number(forward.lockedOdds) / 1000).toFixed(2) : 'N/A'}x</p>
            <p>🔐 <strong>Protected Data:</strong> {forward.protectedDataAddress?.slice(0, 10)}...{forward.protectedDataAddress?.slice(-8)}</p>
            <p>👤 <strong>Owner:</strong> <ENSAddress address={forward.owner} /></p>
            
            {forward.isForSale ? (
              <>
                <p style={{ color: "#00ff00", fontWeight: "bold", marginTop: "10px" }}>
                  💰 Listed for: {formatEther(forward.premium)} ETH
                </p>
                <button
                  onClick={() => cancelSale(forward.id)}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    padding: "12px",
                    background: "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: "bold"
                  }}
                >
                  ❌ Cancel Sale
                </button>
              </>
            ) : sellingId === forward.id ? (
              <div style={{ marginTop: "15px" }}>
                <input
                  type="number"
                  step="0.001"
                  placeholder="Price in ETH (e.g., 0.01)"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "1px solid #333",
                    background: "#0a0a0a",
                    color: "white",
                    marginBottom: "10px"
                  }}
                />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => listForSale(forward.id)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#0052FF",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    ✅ List for Sale
                  </button>
                  <button
                    onClick={() => {
                      setSellingId(null);
                      setSalePrice("");
                    }}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "#666",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold"
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setSellingId(forward.id)}
                style={{
                  width: "100%",
                  marginTop: "15px",
                  padding: "12px",
                  background: "#00ff00",
                  color: "black",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                💰 Sell This Forward
              </button>
            )}
            
            <p style={{ fontSize: "12px", color: "#0052FF", marginTop: "10px" }}>
              ✅ Stake encrypted with iExec-ready architecture
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
