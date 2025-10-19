"use client";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { parseEther, formatEther } from "viem";
import ENSAddress from "./ENSAddress";

const MATCH_DATA = {
  1: { home: "Galatasaray", away: "Fenerbahçe", league: "Süper Lig" },
  2: { home: "Beşiktaş", away: "Trabzonspor", league: "Süper Lig" },
  4: { home: "AS Roma", away: "Lazio", league: "Serie A" },
  5: { home: "Juventus", away: "Inter Milan", league: "Serie A" },
  6: { home: "AC Milan", away: "Napoli", league: "Serie A" }
};

export default function MyForwards() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const [myForwards, setMyForwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sellingId, setSellingId] = useState(null);
  const [salePrice, setSalePrice] = useState("");
  const [processingCancel, setProcessingCancel] = useState(null);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const fetchForwards = async () => {
    if (!isConnected || !address || !publicClient) return;
    
    try {
      setLoading(true);
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'getAllForwards',
      });

      if (data && data.length > 0) {
        const filtered = data.map((forward, index) => ({ ...forward, id: index }))
          .filter(f => f.owner.toLowerCase() === address.toLowerCase());
        setMyForwards(filtered);
      } else {
        setMyForwards([]);
      }
    } catch (err) {
      console.error("Error fetching forwards:", err);
      setMyForwards([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address && publicClient) {
      fetchForwards();
    }
  }, [isConnected, address, publicClient]);

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
      
      setMyForwards(prev => 
        prev.map(f => 
          f.id === forwardId 
            ? { ...f, isForSale: true, premium: parseEther(salePrice) } 
            : f
        )
      );
      
      setSellingId(null);
      setSalePrice("");
      
      setTimeout(fetchForwards, 3000);
    } catch (err) {
      console.error("Error listing forward:", err);
      alert(`❌ Failed to list: ${err.message}`);
    }
  };

  const cancelSale = async (forwardId) => {
    if (!confirm("Cancel this sale listing?")) return;
    
    setProcessingCancel(forwardId);
    
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'cancelSale',
        args: [BigInt(forwardId)]
      });
      
      setMyForwards(prev => 
        prev.map(f => 
          f.id === forwardId 
            ? { ...f, isForSale: false, premium: 0n } 
            : f
        )
      );
      
      alert(`✅ Sale cancelled! Forward #${forwardId} is no longer for sale.`);
      
      setTimeout(() => {
        fetchForwards();
        setProcessingCancel(null);
      }, 5000);
      
    } catch (err) {
      console.error("Error cancelling sale:", err);
      alert(`❌ Failed: ${err.message}`);
      setProcessingCancel(null);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Please connect your wallet to view your forwards</h2>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h2>My Forwards ({myForwards.length})</h2>
        <button 
          onClick={fetchForwards} 
          disabled={loading}
          style={{ 
            padding: "8px 12px", 
            background: loading ? "#666" : "#0052FF", 
            border: "none", 
            borderRadius: "8px", 
            color: "white", 
            cursor: loading ? "not-allowed" : "pointer" 
          }}
        >
          {loading ? "⏳" : "🔄"} Refresh
        </button>
      </div>

      {/* Glossary */}
      <details style={{ background: "#1a1a1a", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #666", cursor: "pointer" }}>
        <summary style={{ fontWeight: "bold", color: "#0052FF", fontSize: "14px" }}>
          Glossary: What Do These Terms Mean?
        </summary>
        <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#ff4444", fontSize: "13px" }}>Forward Contract</strong>
            <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
              You locked in today's betting odds for a future match. Like buying concert tickets early before price goes up!
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#ffaa00", fontSize: "13px" }}>Locked Odds</strong>
            <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
              The multiplier you secured. If you bet 1 ETH at 2.5x and win, you get 2.5 ETH back.
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#00ff00", fontSize: "13px" }}>For Sale / Premium</strong>
            <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
              You can sell your locked position to others on the marketplace. Premium = your asking price.
            </p>
          </div>
          <div>
            <strong style={{ color: "#0052FF", fontSize: "13px" }}>Why Would I Sell?</strong>
            <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
              Maybe odds got WORSE after you locked (good for you!). Someone else might pay extra to buy your better odds. That's profit without even betting!
            </p>
          </div>
        </div>
      </details>

      {loading ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>⏳ Loading your forwards...</h3>
        </div>
      ) : myForwards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>No forwards yet!</h3>
          <p style={{ color: "#888" }}>Lock your first forward to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {myForwards.map((forward) => (
            <div 
              key={forward.id} 
              style={{ 
                background: "#1a1a1a", 
                border: forward.isForSale ? "2px solid #00ff00" : "1px solid #333", 
                borderRadius: "12px", 
                padding: "20px",
                opacity: processingCancel === forward.id ? 0.6 : 1
              }}
            >
              {forward.isForSale && (
                <div style={{ 
                  display: "inline-block", 
                  padding: "5px 12px", 
                  background: "#00ff00", 
                  color: "black", 
                  borderRadius: "15px", 
                  fontSize: "11px", 
                  fontWeight: "bold", 
                  marginBottom: "10px" 
                }}>
                  FOR SALE
                </div>
              )}

              <h3 style={{ margin: "0 0 15px 0", fontSize: "18px" }}>
                Forward #{forward.id}
                {MATCH_DATA[Number(forward.matchId)] && 
                  ` - ${MATCH_DATA[Number(forward.matchId)].home} vs ${MATCH_DATA[Number(forward.matchId)].away}`
                }
              </h3>

              <div style={{ display: "grid", gap: "10px", marginBottom: "15px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#0a0a0a", borderRadius: "8px" }}>
                  <span style={{ color: "#888" }}>Owner:</span>
                  <ENSAddress address={forward.owner} />
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#0a0a0a", borderRadius: "8px" }}>
                  <span style={{ color: "#888" }}>Locked Odds:</span>
                  <strong style={{ color: "#0052FF" }}>{(Number(forward.lockedOdds) / 1000).toFixed(2)}x</strong>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#0a0a0a", borderRadius: "8px" }}>
                  <span style={{ color: "#888" }}>Stake:</span>
                  <strong style={{ color: "#fff" }}>{formatEther(forward.stakeAmount)} ETH</strong>
                </div>

                {MATCH_DATA[Number(forward.matchId)] && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "10px", background: "#0a0a0a", borderRadius: "8px" }}>
                    <span style={{ color: "#888" }}>Match:</span>
                    <span style={{ color: "#fff", fontSize: "13px" }}>{MATCH_DATA[Number(forward.matchId)].league}</span>
                  </div>
                )}
              </div>

              {forward.isForSale && (
                <div style={{ padding: "12px", background: "#0a3d0a", borderRadius: "8px", marginBottom: "15px", border: "1px solid #00ff00" }}>
                  <p style={{ color: "#00ff00", fontWeight: "bold", margin: "0 0 5px 0" }}>
                    Listed for: {formatEther(forward.premium)} ETH
                  </p>
                  <p style={{ color: "#888", fontSize: "12px", margin: 0 }}>
                    Your position is visible on the marketplace
                  </p>
                </div>
              )}

              {!forward.isForSale ? (
                sellingId === forward.id ? (
                  <div style={{ marginTop: "15px" }}>
                    <label style={{ display: "block", marginBottom: "8px", color: "#0052FF", fontSize: "13px" }}>
                      Set Sale Price (ETH)
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      placeholder="0.01"
                      value={salePrice}
                      onChange={(e) => setSalePrice(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px",
                        borderRadius: "8px",
                        border: "1px solid #333",
                        background: "#0a0a0a",
                        color: "white",
                        fontSize: "14px",
                        marginBottom: "10px"
                      }}
                    />
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() => listForSale(forward.id)}
                        disabled={isPending || isConfirming}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: isPending || isConfirming ? "#666" : "#00ff00",
                          color: isPending || isConfirming ? "white" : "black",
                          border: "none",
                          borderRadius: "8px",
                          cursor: isPending || isConfirming ? "not-allowed" : "pointer",
                          fontWeight: "bold"
                        }}
                      >
                        {isPending ? "⏳ Listing..." : isConfirming ? "⌛ Confirming..." : "✅ Confirm Sale"}
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
                    Sell This Forward
                  </button>
                )
              ) : (
                <button
                  onClick={() => cancelSale(forward.id)}
                  disabled={processingCancel === forward.id}
                  style={{
                    width: "100%",
                    marginTop: "15px",
                    padding: "12px",
                    background: processingCancel === forward.id ? "#666" : "#ff4444",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: processingCancel === forward.id ? "not-allowed" : "pointer",
                    fontWeight: "bold"
                  }}
                >
                  {processingCancel === forward.id ? "⏳ Cancelling..." : "❌ Cancel Sale"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
