"use client";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { parseEther, formatEther } from "viem";

export default function MyForwards() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const [myForwards, setMyForwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchForwards = async () => {
    if (!isConnected || !address || !publicClient) {
      console.log("Not ready to fetch:", { isConnected, address, publicClient: !!publicClient });
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      console.log("=== FETCHING FORWARDS ===");
      console.log("Contract:", CONTRACT_ADDRESS);
      console.log("Connected address:", address);

      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getAllForwards',
      });

      console.log("Raw contract data:", data);

      if (!data || data.length === 0) {
        console.log("No forwards exist yet");
        setMyForwards([]);
        return;
      }

      const filtered = data
        .map((forward, index) => {
          console.log(`Forward ${index}:`, forward);
          return { ...forward, id: index };
        })
        .filter(f => f.owner.toLowerCase() === address.toLowerCase());

      console.log("My forwards after filter:", filtered);
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
        <button 
          onClick={fetchForwards}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#0052FF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          🔄 Try Again
        </button>
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
        <p style={{ color: "#666", fontSize: "14px", marginTop: "20px" }}>
          Connected wallet: {address}
        </p>
        <button 
          onClick={fetchForwards}
          style={{
            marginTop: "20px",
            padding: "10px 20px",
            background: "#0052FF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer"
          }}
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>📊 My Forwards ({myForwards.length})</h2>
        <button 
          onClick={fetchForwards}
          disabled={loading}
          style={{
            padding: "10px 20px",
            background: "#0052FF",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            opacity: loading ? 0.5 : 1
          }}
        >
          {loading ? "⏳ Loading..." : "🔄 Refresh"}
        </button>
      </div>
      
      <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>
        {myForwards.map((forward) => (
          <div
            key={forward.id}
            style={{
              background: "#1a1a1a",
              border: "1px solid #333",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            <h3>Forward #{forward.id}</h3>
            <p>⚽ <strong>Match ID:</strong> {forward.matchId?.toString()}</p>
            <p>📊 <strong>Locked Odds:</strong> {forward.lockedOdds ? (Number(forward.lockedOdds) / 100).toFixed(2) : 'N/A'}x</p>
            <p>👤 <strong>Owner:</strong> {forward.owner}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
