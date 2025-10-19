"use client";
import { useState, useEffect } from "react";
import { useAccount, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS_V3, CONTRACT_ABI_V3 } from "../utils/contractV3";
import { parseEther, formatEther } from "viem";
import ENSProfileCard from './ENSProfileCard';

const MATCHES = [
  { id: 1, homeTeam: "Galatasaray", awayTeam: "Fenerbahçe", homeOdds: 2.1, drawOdds: 3.3, awayOdds: 1.9, league: "Süper Lig" },
  { id: 2, homeTeam: "Beşiktaş", awayTeam: "Trabzonspor", homeOdds: 1.7, drawOdds: 3.4, awayOdds: 2.4, league: "Süper Lig" },
  { id: 4, homeTeam: "AS Roma", awayTeam: "Lazio", homeOdds: 2.0, drawOdds: 3.2, awayOdds: 1.9, league: "Serie A" },
  { id: 5, homeTeam: "Juventus", awayTeam: "Inter Milan", homeOdds: 1.9, drawOdds: 3.4, awayOdds: 2.1, league: "Serie A" },
  { id: 6, homeTeam: "AC Milan", awayTeam: "Napoli", homeOdds: 1.8, drawOdds: 3.5, awayOdds: 2.2, league: "Serie A" },
];

const MATCH_DATA = {
  1: { home: "Galatasaray", away: "Fenerbahçe", league: "Süper Lig" },
  2: { home: "Beşiktaş", away: "Trabzonspor", league: "Süper Lig" },
  4: { home: "AS Roma", away: "Lazio", league: "Serie A" },
  5: { home: "Juventus", away: "Inter Milan", league: "Serie A" },
  6: { home: "AC Milan", away: "Napoli", league: "Serie A" }
};

export default function BuyOptions() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const [view, setView] = useState("buy");
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [optionPremium, setOptionPremium] = useState("0.001");
  const [myOptions, setMyOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchMyOptions = async () => {
    if (!isConnected || !address || !publicClient) return;
    try {
      setLoading(true);
      const data = await publicClient.readContract({
        address: CONTRACT_ADDRESS_V3,
        abi: CONTRACT_ABI_V3,
        functionName: 'getAllOptions',
      });
      if (data && data.length > 0) {
        const filtered = data.map((option, index) => ({ ...option, id: index }))
          .filter(o => o.holder.toLowerCase() === address.toLowerCase());
        setMyOptions(filtered);
      } else {
        setMyOptions([]);
      }
    } catch (err) {
      console.error("Error fetching options:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mounted && isConnected && view === "myoptions") {
      fetchMyOptions();
    }
  }, [mounted, isConnected, address, publicClient, view]);

  const buyOption = async () => {
    if (!selectedMatch || !selectedOutcome || !optionPremium) {
      alert("Please select match, outcome, and premium!");
      return;
    }
    const match = MATCHES.find(m => m.id === selectedMatch);
    let odds;
    if (selectedOutcome === 'home') odds = match.homeOdds;
    else if (selectedOutcome === 'draw') odds = match.drawOdds;
    else odds = match.awayOdds;
    const oddsScaled = Math.floor(odds * 1000);
    const expiryTimestamp = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V3,
        abi: CONTRACT_ABI_V3,
        functionName: 'buyOption',
        args: [BigInt(selectedMatch), BigInt(oddsScaled), BigInt(expiryTimestamp)],
        value: parseEther(optionPremium)
      });
    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  const exerciseOption = async (optionId) => {
    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V3,
        abi: CONTRACT_ABI_V3,
        functionName: 'exerciseOption',
        args: [BigInt(optionId), `0x${Date.now().toString(16).padStart(40, '0')}`]
      });
      alert(`✅ Option #${optionId} exercised!`);
      setTimeout(fetchMyOptions, 3000);
    } catch (err) {
      console.error(err);
      alert(`❌ Failed: ${err.message}`);
    }
  };

  if (!isConnected) {
    return <div style={{ textAlign: "center", padding: "40px" }}><h2>Connect wallet to use options</h2></div>;
  }

  return (
    <div style={{ paddingBottom: selectedMatch && view === "buy" ? "100px" : "0" }}>
      {/* Toggle between Buy and My Options */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button onClick={() => setView("buy")} style={{ flex: 1, padding: "12px", background: view === "buy" ? "#0052FF" : "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>
          Buy Options
        </button>
        <button onClick={() => setView("myoptions")} style={{ flex: 1, padding: "12px", background: view === "myoptions" ? "#0052FF" : "#2a2a2a", border: "1px solid #333", borderRadius: "8px", color: "white", cursor: "pointer", fontWeight: "bold" }}>
          My Options ({myOptions.length})
        </button>
      </div>

      {/* BUY OPTIONS VIEW */}
      {view === "buy" && (
        <>
          <h2>Buy Betting Options</h2>
          <p style={{ color: "#888", marginBottom: "20px", fontSize: "12px" }}>
            Options give you the RIGHT (not obligation) to bet. If odds get worse, use it. If odds get better, ignore it!
          </p>
          
          {/* EDUCATIONAL EXPLAINER - MATCHING FONT SIZES */}
          <details style={{ background: "#1a1a1a", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #666", cursor: "pointer" }}>
            <summary style={{ fontWeight: "bold", color: "#0052FF", fontSize: "14px" }}>
              Real Example: What If Odds Change?
            </summary>
            <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#ff4444", fontSize: "13px" }}>Scenario A: Odds Get WORSE (1.50 → 1.30)</strong>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
                  You locked Galatasaray at 1.50 for 0.001 ETH. Star player confirmed fit → Team favored → Odds drop to 1.30. Your move: Exercise your option! Bet at your 1.50. Result: €100 bet wins €150 vs market's €130 = Save €20!
                </p>
              </div>

              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#ffaa00", fontSize: "13px" }}>Scenario B: Odds Get BETTER (1.50 → 1.80)</strong>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
                  You locked Galatasaray at 1.50 for 0.001 ETH. Star player injured → Team weakened → Odds rise to 1.80. Your move: Let option expire! Bet at market's 1.80. Result: Only lose 0.001 ETH premium (cheap insurance!)
                </p>
              </div>

              <div>
                <strong style={{ color: "#00ff00", fontSize: "13px" }}>What You're Learning</strong>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
                  This is exactly how stock options work! Pay small premium for the RIGHT (not obligation) to buy/sell at a set price. If market moves against you, walk away. You're learning real derivatives trading through sports!
                </p>
              </div>
            </div>
          </details>

          {/* HOW OPTIONS WORK */}
          <details style={{ background: "#1a1a1a", padding: "15px", borderRadius: "12px", marginBottom: "20px", border: "1px solid #666", cursor: "pointer" }}>
            <summary style={{ fontWeight: "bold", color: "#0052FF", fontSize: "14px" }}>
              How Options Work
            </summary>
            <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
              <div style={{ marginBottom: "15px" }}>
                <strong style={{ color: "#ff4444", fontSize: "13px" }}>Basic Mechanics</strong>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
                  Pay small premium (e.g., 0.001 ETH) to get the RIGHT to bet at locked odds for 7 days. If odds worsen → Exercise. If odds improve → Ignore, bet at market rate.
                </p>
              </div>
              <div>
                <strong style={{ color: "#ffaa00", fontSize: "13px" }}>Risk Management</strong>
                <p style={{ color: "#888", fontSize: "12px", marginTop: "5px", marginBottom: 0 }}>
                  Maximum loss = premium paid. Unlimited upside potential. This is how professionals hedge volatility risk in traditional markets!
                </p>
              </div>
            </div>
          </details>

          {/* MATCHES */}
          <div style={{ display: "grid", gap: "20px" }}>
            {MATCHES.map((match) => (
              <div key={match.id} style={{ background: "#1a1a1a", border: selectedMatch === match.id ? "2px solid #0052FF" : "1px solid #333", borderRadius: "16px", padding: "20px" }}>
                <div style={{ marginBottom: "10px" }}>
                  <h3 style={{ margin: "0 0 5px 0" }}>{match.homeTeam} vs {match.awayTeam}</h3>
                  <div style={{ fontSize: "11px", color: "#0052FF" }}>{match.league}</div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px" }}>
                  <button onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('home'); }} style={{ padding: "15px 10px", background: selectedMatch === match.id && selectedOutcome === 'home' ? "#0052FF" : "#2a2a2a", border: "1px solid #444", borderRadius: "10px", color: "white", cursor: "pointer" }}>
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>HOME</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{match.homeOdds.toFixed(2)}x</div>
                  </button>
                  <button onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('draw'); }} style={{ padding: "15px 10px", background: selectedMatch === match.id && selectedOutcome === 'draw' ? "#0052FF" : "#2a2a2a", border: "1px solid #444", borderRadius: "10px", color: "white", cursor: "pointer" }}>
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>DRAW</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{match.drawOdds.toFixed(2)}x</div>
                  </button>
                  <button onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('away'); }} style={{ padding: "15px 10px", background: selectedMatch === match.id && selectedOutcome === 'away' ? "#0052FF" : "#2a2a2a", border: "1px solid #444", borderRadius: "10px", color: "white", cursor: "pointer" }}>
                    <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>AWAY</div>
                    <div style={{ fontSize: "18px", fontWeight: "bold" }}>{match.awayOdds.toFixed(2)}x</div>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* PREMIUM INPUT */}
          {selectedMatch && (
            <div style={{ marginTop: "20px", padding: "20px", background: "#0a0a0a", border: "2px solid #0052FF", borderRadius: "12px" }}>
              <h3 style={{ marginTop: 0 }}>Option Premium</h3>
              <input 
                type="number" 
                step="0.0001" 
                value={optionPremium} 
                onChange={(e) => setOptionPremium(e.target.value)} 
                style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #333", background: "#1a1a1a", color: "white", fontSize: "16px" }} 
              />
            </div>
          )}

          {/* STICKY BUTTON */}
          {selectedMatch && (
            <div style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "15px 20px",
              background: "#0a0a0a",
              borderTop: "2px solid #0052FF",
              zIndex: 1000,
              boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.5)"
            }}>
              <button 
                onClick={buyOption} 
                disabled={isPending || isConfirming} 
                style={{ 
                  width: "100%", 
                  maxWidth: "600px",
                  margin: "0 auto",
                  display: "block",
                  padding: "15px", 
                  background: isPending || isConfirming ? "#666" : "#00ff00", 
                  color: isPending || isConfirming ? "white" : "black", 
                  border: "none", 
                  borderRadius: "12px", 
                  cursor: isPending || isConfirming ? "not-allowed" : "pointer", 
                  fontWeight: "bold", 
                  fontSize: "16px" 
                }}
              >
                {isPending ? "Confirming..." : isConfirming ? "Processing..." : isSuccess ? "Bought!" : `Buy Option for ${optionPremium} ETH`}
              </button>
            </div>
          )}
        </>
      )}

      {/* MY OPTIONS VIEW */}
      {view === "myoptions" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h2>My Options ({myOptions.length})</h2>
            <button onClick={fetchMyOptions} disabled={loading} style={{ padding: "8px 12px", background: loading ? "#666" : "#0052FF", border: "none", borderRadius: "8px", color: "white", cursor: loading ? "not-allowed" : "pointer" }}>
              {loading ? "⏳" : "🔄"} Refresh
            </button>
          </div>
          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}><h3>⏳ Loading...</h3></div>
          ) : myOptions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}><h3>No options yet!</h3><p>Buy your first option to get started</p></div>
          ) : (
            <div style={{ display: "grid", gap: "20px" }}>
              {myOptions.map((option) => {
                const now = Date.now() / 1000;
                const isExpired = now > Number(option.expiry);
                const timeLeft = Number(option.expiry) - now;
                const daysLeft = Math.floor(timeLeft / 86400);
                return (
                  <div key={option.id} style={{ background: "#1a1a1a", border: option.exercised ? "2px solid #00ff00" : isExpired ? "2px solid #ff4444" : "1px solid #333", borderRadius: "12px", padding: "20px" }}>
                    <h3 style={{ margin: "0 0 10px 0" }}>
                      {MATCH_DATA[Number(option.matchId)] ? `${MATCH_DATA[Number(option.matchId)].home} vs ${MATCH_DATA[Number(option.matchId)].away}` : `Option #${option.id}`}
                    </h3>
                    <p>Strike Odds: {(Number(option.strikeOdds) / 1000).toFixed(2)}x</p>
                    <p>Premium Paid: {formatEther(option.optionPremium)} ETH</p>
                    <p>Time Left: {isExpired ? "Expired" : option.exercised ? "Exercised" : `${daysLeft}d left`}</p>
                    {!option.exercised && !isExpired && (
                      <button onClick={() => exerciseOption(option.id)} style={{ width: "100%", marginTop: "10px", padding: "12px", background: "#00ff00", color: "black", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>
                        Exercise Option
                      </button>
                    )}
                    {option.exercised && <div style={{ marginTop: "10px", padding: "10px", background: "#0a3d0a", borderRadius: "8px", color: "#00ff00", textAlign: "center" }}>Exercised - Forward Created</div>}
                    {isExpired && !option.exercised && <div style={{ marginTop: "10px", padding: "10px", background: "#3d0a0a", borderRadius: "8px", color: "#ff4444", textAlign: "center" }}>Expired - Lost Premium</div>}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
