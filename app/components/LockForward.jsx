"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract } from "wagmi";
import { parseEther } from "viem";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";

export default function LockForward() {
  const { address, isConnected } = useAccount();
  const { writeContract } = useWriteContract();
  
  const [matchId, setMatchId] = useState("");
  const [odds, setOdds] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.0001");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Fix hydration - only render interactive elements after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const lockForward = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!matchId || !odds || !stakeAmount) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "lockForward",
        args: [
          BigInt(matchId),
          BigInt(Math.floor(parseFloat(odds) * 100)),
          `encrypted_match_${matchId}_${Date.now()}`
        ],
        value: parseEther(stakeAmount),
        chainId: 84532,
      });

      alert(`✅ Forward locked! Check "My Forwards" tab!`);
      
      setMatchId("");
      setOdds("");
      setStakeAmount("0.0001");
      
    } catch (error) {
      console.error("Lock forward error:", error);
      alert(`Failed to lock forward: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) {
    return (
      <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
        <h2>🔒 Lock Forward Position</h2>
        <p style={{ textAlign: "center", color: "#666" }}>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "0 auto" }}>
      <h2>🔒 Lock Forward Position</h2>
      
      <div style={{ marginBottom: "15px" }}>
        <label>Match ID:</label>
        <input
          type="number"
          value={matchId}
          onChange={(e) => setMatchId(e.target.value)}
          placeholder="e.g., 1"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white"
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Current Odds:</label>
        <input
          type="number"
          step="0.01"
          value={odds}
          onChange={(e) => setOdds(e.target.value)}
          placeholder="e.g., 2.50"
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white"
          }}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Stake Amount (ETH):</label>
        <input
          type="number"
          step="0.0001"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginTop: "5px",
            borderRadius: "8px",
            border: "1px solid #333",
            background: "#1a1a1a",
            color: "white"
          }}
        />
      </div>

      <button
        onClick={lockForward}
        disabled={!isConnected || loading}
        suppressHydrationWarning
        style={{
          width: "100%",
          padding: "15px",
          background: isConnected && !loading ? "#0052FF" : "#666",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          cursor: isConnected && !loading ? "pointer" : "not-allowed",
          fontWeight: "bold"
        }}
      >
        {loading ? "⏳ Locking..." : "🚀 Lock Forward (Private)"}
      </button>
    </div>
  );
}
