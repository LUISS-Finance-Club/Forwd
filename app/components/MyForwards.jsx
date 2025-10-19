"use client";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { formatEther, parseEther } from "viem";
import ENSAddress from "./ENSAddress";

const MATCH_DATA = {
  1: { home: "Galatasaray", away: "Fenerbahçe", league: "Süper Lig - Intercontinental Derby" },
  2: { home: "Beşiktaş", away: "Trabzonspor", league: "Süper Lig" },
  3: { home: "Fenerbahçe", away: "Başakşehir", league: "Süper Lig" },
  4: { home: "AS Roma", away: "Lazio", league: "Serie A - Derby della Capitale" },
  5: { home: "Juventus", away: "Inter Milan", league: "Serie A - Derby d'Italia" },
  6: { home: "AC Milan", away: "Napoli", league: "Serie A" },
  7: { home: "Atalanta", away: "Fiorentina", league: "Serie A" },
  8: { home: "Galatasaray", away: "Beşiktaş", league: "Süper Lig" },
  9: { home: "Fenerbahçe", away: "Trabzonspor", league: "Süper Lig" },
  10: { home: "Sivasspor", away: "Antalyaspor", league: "Süper Lig" },
  11: { home: "Bologna", away: "Udinese", league: "Serie A" },
  12: { home: "Torino", away: "Monza", league: "Serie A" },
  13: { home: "Salernitana", away: "Empoli", league: "Serie A" },
  14: { home: "Galatasaray", away: "Manchester United", league: "UEFA Champions League" },
  15: { home: "Inter Milan", away: "Barcelona", league: "UEFA Champions League" }
};

export default function MyForwards() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { writeContract } = useWriteContract();
  
  const [myForwards, setMyForwards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [sellingId, setSellingId] = useState(null);
  const [salePrice, setSalePrice] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchForwards = async () => {
    if (!isConnected || !address || !publicClient) return;

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

  const filterByTime = (forwards) => {
    if (timeFilter === "all") return forwards;
    if (timeFilter === "2h") return forwards.slice(-2);
    if (timeFilter === "24h") return forwards.slice(-5);
    if (timeFilter === "7d") return forwards.slice(-10);
    return forwards;
  };

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
      setTimeout(fetchForwards, 3000);
    } catch (err) {
      console.error("Error listing forward:", err);
      alert(`❌ Failed to list: ${err.message}`);
    }
  };

  const cancelSale = async (forwardId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'cancelSale',
        args: [BigInt(forwardId)]
      });
      
      alert(`✅ Sale cancelled for Forward #${forwardId}`);
      setTimeout(fetchForwards, 3000);
    } catch (err) {
      console.error("Error cancelling sale:", err);
      alert(`❌ Failed to cancel: ${err.message}`);
    }
  };

  if (!mounted) return <div style={{ textAlign: "center", padding: "40px" }}>Loading...</div>;
  if (!isConnected) return <div style={{ textAlign: "center", padding: "40px" }}><h2>Please connect your wallet</h2></div>;
  if (error) return <div style={{ textAlign: "center", padding: "40px" }}><h2 style={{ color: "#ff4444" }}>❌ Error loading forwards</h2><p>{error}</p><button onClick={fetchForwards} style={{ padding: "10px 20px", background: "#0052FF", border: "none", borderRadius: "8px", color: "white", cursor: "pointer" }}>🔄 Try Again</button></div>;
  if (loading) return <div style={{ textAlign: "center", padding: "40px" }}><h2>⏳ Loading forwards...</h2></div>;

  if (myForwards.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>📭 No forwards yet!</h2>
        <p>Lock your first forward to get started</p>
        <button onClick={fetchForwards} style={{ marginTop: "20px", padding: "10px 20px", background: "#0052FF", border: "none", borderRadius: "8px", color: "white", cursor: "pointer" }}>🔄 Refresh</button>
      </div>
    );
  }

  const filteredForwards = filterByTime(myForwards);

  return (
    <div>
      {/* 🎓 FINANCIAL GLOSSARY */}
      <details style={{ background: "#1a1a1a", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #666", cursor: "pointer" }}>
        <summary style={{ fontWeight: "bold", color: "#0052FF", fontSize: "16px" }}>
          📖 Financial Terms Explained
        </summary>
        <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#00ff00" }}>Forward Contract:</strong>
            <p style={{ color: "#888", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
              Agreement to buy/sell at a set price on a future date. You locked betting odds today for a match next week.
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#00ff00" }}>Premium:</strong>
            <p style={{ color: "#888", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
              The price to buy someone's position. If vitalik.eth wants 0.01 ETH to sell his forward, that's the premium.
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#00ff00" }}>Liquidity:</strong>
            <p style={{ color: "#888", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
              How easily you can buy/sell. High liquidity = many buyers/sellers. Our marketplace creates liquidity for betting positions!
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#00ff00" }}>Hedging:</strong>
            <p style={{ color: "#888", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
              Reducing risk. If you're unsure about your bet, sell your forward early to lock in some profit and reduce exposure.
            </p>
          </div>
          <div>
            <strong style={{ color: "#00ff00" }}>Secondary Market:</strong>
            <p style={{ color: "#888", fontSize: "14px", marginTop: "5px", marginBottom: 0 }}>
              Where you trade existing positions. Like the stock market where you buy/sell shares, but for betting positions!
            </p>
          </div>
        </div>
      </details>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
        <h2>📊 My Forwards ({myForwards.length})</h2>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} style={{ padding: "8px 12px", background: "#1a1a1a", border: "1px solid #333", borderRadius: "8px", color: "white", cursor: "pointer", fontSize: "14px" }}>
            <option value="all">All Time</option>
            <option value="2h">Last 2 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
          <button onClick={fetchForwards} disabled={loading} style={{ padding: "8px 12px", background: loading ? "#666" : "#0052FF", border: "none", borderRadius: "8px", color: "white", cursor: loading ? "not-allowed" : "pointer", fontSize: "14px" }}>
            {loading ? "⏳" : "🔄"} Refresh
          </button>
        </div>
      </div>

      {timeFilter !== "all" && <p style={{ color: "#888", fontSize: "14px", marginBottom: "15px" }}>Showing {filteredForwards.length} of {myForwards.length} forwards</p>}
      
      <div style={{ display: "grid", gap: "20px" }}>
        {filteredForwards.map((forward) => (
          <div key={forward.id} style={{ background: "#1a1a1a", border: forward.isForSale ? "2px solid #00ff00" : "1px solid #333", borderRadius: "12px", padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "flex-start", gap: "10px" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: "0 0 5px 0", fontSize: "18px" }}>
                  {MATCH_DATA[Number(forward.matchId)] 
                    ? `${MATCH_DATA[Number(forward.matchId)].home} vs ${MATCH_DATA[Number(forward.matchId)].away}`
                    : `Forward #${forward.id}`
                  }
                </h3>
                {MATCH_DATA[Number(forward.matchId)] && (
                  <div style={{ fontSize: "11px", color: "#0052FF" }}>
                    {MATCH_DATA[Number(forward.matchId)].league}
                  </div>
                )}
              </div>
              {forward.isForSale && (
                <span style={{ padding: "5px 12px", background: "#00ff00", color: "black", borderRadius: "20px", fontSize: "11px", fontWeight: "bold", whiteSpace: "nowrap" }}>
                  🟢 FOR SALE
                </span>
              )}
            </div>
            
            <div style={{ display: "grid", gap: "8px", marginBottom: "15px" }}>
              <p style={{ margin: 0 }}>📊 <strong>Locked Odds:</strong> {forward.lockedOdds ? (Number(forward.lockedOdds) / 1000).toFixed(2) : 'N/A'}x</p>
              <p style={{ margin: 0, fontSize: "12px", color: "#888" }}>🔐 Protected: {forward.protectedDataAddress?.slice(0, 10)}...{forward.protectedDataAddress?.slice(-8)}</p>
            </div>
            
            {forward.isForSale ? (
              <>
                <p style={{ color: "#00ff00", fontWeight: "bold", marginTop: "10px" }}>💰 Listed for: {formatEther(forward.premium)} ETH</p>
                <button onClick={() => cancelSale(forward.id)} style={{ width: "100%", marginTop: "15px", padding: "12px", background: "#ff4444", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                  ❌ Cancel Sale
                </button>
              </>
            ) : sellingId === forward.id ? (
              <div style={{ marginTop: "15px" }}>
                <input type="number" step="0.001" placeholder="Price in ETH (e.g., 0.01)" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#0a0a0a", color: "white", marginBottom: "10px" }} />
                <div style={{ display: "flex", gap: "10px" }}>
                  <button onClick={() => listForSale(forward.id)} style={{ flex: 1, padding: "12px", background: "#0052FF", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>✅ List for Sale</button>
                  <button onClick={() => { setSellingId(null); setSalePrice(""); }} style={{ flex: 1, padding: "12px", background: "#666", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Cancel</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setSellingId(forward.id)} style={{ width: "100%", marginTop: "15px", padding: "12px", background: "#00ff00", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>💰 Sell This Forward</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
