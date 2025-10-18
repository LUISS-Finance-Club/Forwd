"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS, CONTRACT_ABI } from "../utils/contract";
import { formatEther } from "viem";

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const [forSaleForwards, setForSaleForwards] = useState([]);
  
  const { data: allForwards } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: "getAllForwards",
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    if (allForwards) {
      const filtered = allForwards
        .map((forward, index) => ({ ...forward, id: index }))
        .filter(f => f.isForSale && f.owner.toLowerCase() !== address?.toLowerCase());
      setForSaleForwards(filtered);
    }
  }, [allForwards, address]);

  const buyForward = async (forwardId, premium) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: "buyForward",
        args: [BigInt(forwardId)],
        value: premium,
      });
      alert(`✅ Forward #${forwardId} purchased!`);
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

  if (forSaleForwards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>🛒 No forwards for sale yet!</h2>
        <p>Be the first to list one</p>
      </div>
    );
  }

  return (
    <div>
      <h2>🛒 Marketplace ({forSaleForwards.length} available)</h2>
      <div style={{ display: "grid", gap: "20px", marginTop: "30px" }}>
        {forSaleForwards.map((forward) => (
          <div
            key={forward.id}
            style={{
              background: "#1a1a1a",
              border: "1px solid #00ff00",
              borderRadius: "12px",
              padding: "20px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
              <h3>Forward #{forward.id}</h3>
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
            
            <div style={{ display: "grid", gap: "10px" }}>
              <p>⚽ <strong>Match ID:</strong> {forward.matchId.toString()}</p>
              <p>📊 <strong>Locked Odds:</strong> {(Number(forward.lockedOdds) / 100).toFixed(2)}x</p>
              <p>💰 <strong>Price:</strong> {ethers.formatEther(forward.premium)} ETH</p>
              <p>👤 <strong>Seller:</strong> {forward.owner.substring(0, 6)}...{forward.owner.substring(38)}</p>
            </div>

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
              🛒 Buy for {ethers.formatEther(forward.premium)} ETH
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
