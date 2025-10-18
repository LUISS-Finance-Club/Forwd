"use client";
import { useState, useEffect } from "react";
import { useAccount, useWalletClient } from "wagmi";
import { BrowserProvider, Contract, parseEther } from "ethers";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { encryptStakeAmount } from "../utils/iexec";

export default function LockForward() {
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [matchId, setMatchId] = useState("");
  const [odds, setOdds] = useState("");
  const [stakeAmount, setStakeAmount] = useState("0.0001");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const lockForward = async () => {
    if (!isConnected || !walletClient) {
      alert("Please connect your wallet first!");
      return;
    }

    if (!matchId || !odds || !stakeAmount) {
      alert("Please fill in all fields!");
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Starting forward lock with REAL iExec...");
      
      // ✅ FIX: Get provider from walletClient for Coinbase Wallet
      // Create a custom provider that wraps Wagmi's transport
      const provider = new BrowserProvider(walletClient, 'any');
      
      console.log("✅ Provider created from Coinbase Wallet");
      console.log("🔐 Encrypting with REAL iExec DataProtector...");
      
      // REAL iExec encryption
      const protectedDataAddress = await encryptStakeAmount(
        parseFloat(stakeAmount),
        provider
      );
      
      console.log("✅ Encrypted! Address:", protectedDataAddress);

      // Call V2 contract with ethers v6
      const signer = await provider.getSigner();
      const contract = new Contract(
        CONTRACT_ADDRESS_V2,
        CONTRACT_ABI_V2,
        signer
      );

      const oddsScaled = Math.floor(parseFloat(odds) * 1000);

      console.log("📝 Locking on blockchain...");
      const tx = await contract.lockForward(
        parseInt(matchId),
        oddsScaled,
        protectedDataAddress,
        { value: parseEther("0.0001") }
      );

      console.log("⏳ Waiting for confirmation...");
      await tx.wait();

      console.log("✅ Forward locked with REAL iExec encryption!");
      alert(`✅ Forward locked with REAL iExec encryption!`);
      
      setMatchId("");
      setOdds("");
      setStakeAmount("0.0001");
      
    } catch (error) {
      console.error("❌ Error:", error);
      alert(`Failed: ${error.message || error}`);
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
      <p style={{ fontSize: "14px", color: "#0052FF", marginBottom: "20px" }}>
        🔐 Stake encrypted with iExec (private!)
      </p>
      
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
        <small style={{ color: "#0052FF", fontSize: "12px" }}>
          ⚠️ Encrypted with iExec TEE
        </small>
      </div>

      <button
        onClick={lockForward}
        disabled={!isConnected || !walletClient || loading}
        suppressHydrationWarning
        style={{
          width: "100%",
          padding: "15px",
          background: isConnected && walletClient && !loading ? "#0052FF" : "#666",
          color: "white",
          border: "none",
          borderRadius: "12px",
          fontSize: "18px",
          cursor: isConnected && walletClient && !loading ? "pointer" : "not-allowed",
          fontWeight: "bold"
        }}
      >
        {loading ? "🔐 Encrypting & Locking..." : "🔒 Lock Forward (iExec Protected)"}
      </button>

      {!isConnected && (
        <p style={{ textAlign: "center", color: "#ff6b6b", marginTop: "15px" }}>
          ⚠️ Connect your wallet first
        </p>
      )}
    </div>
  );
}
