"use client";
import { useState, useEffect } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { parseEther } from "viem";

const INITIAL_MATCHES = [
  { id: 1, homeTeam: "Galatasaray", awayTeam: "Fenerbahçe", homeOdds: 2.1, drawOdds: 3.3, awayOdds: 1.9, date: "Oct 21, 2025 20:00", league: "Süper Lig" },
  { id: 2, homeTeam: "Beşiktaş", awayTeam: "Trabzonspor", homeOdds: 1.7, drawOdds: 3.4, awayOdds: 2.4, date: "Oct 21, 2025 18:00", league: "Süper Lig" },
  { id: 3, homeTeam: "AS Roma", awayTeam: "Lazio", homeOdds: 2.0, drawOdds: 3.2, awayOdds: 1.9, date: "Oct 22, 2025 20:45", league: "Serie A" },
  { id: 4, homeTeam: "Juventus", awayTeam: "Inter Milan", homeOdds: 1.9, drawOdds: 3.4, awayOdds: 2.1, date: "Oct 23, 2025 20:45", league: "Serie A" },
  { id: 5, homeTeam: "AC Milan", awayTeam: "Napoli", homeOdds: 1.8, drawOdds: 3.5, awayOdds: 2.2, date: "Oct 23, 2025 18:00", league: "Serie A" },
];

const ACTIVITY_TEMPLATES = [
  { user: "vitalik.eth", action: "locked", match: "Galatasaray HOME", odds: "2.1x", type: "lock" },
  { user: "brantly.eth", action: "sold forward for", profit: "+0.02 ETH", type: "sell" },
  { user: "lido.eth", action: "locked", match: "Roma AWAY", odds: "2.0x", type: "lock" },
  { user: "0x7a2b...4f3c", action: "won", profit: "0.15 ETH", match: "Juventus", type: "win" },
  { user: "0x3e9a...2d1b", action: "lost position on", match: "Beşiktaş DRAW", type: "loss" },
  { user: "coinbase.eth", action: "locked", match: "AC Milan HOME", odds: "1.8x", type: "lock" },
  { user: "0x8f3d...9a2c", action: "sold forward for", profit: "+0.05 ETH", type: "sell" },
  { user: "ens.eth", action: "locked", match: "Inter Milan AWAY", odds: "2.1x", type: "lock" },
];

// Helper function to generate initial history
const generateInitialHistory = (baseOdds, points = 20) => {
  const history = [];
  let current = { home: baseOdds.home, draw: baseOdds.draw, away: baseOdds.away };
  
  for (let i = 0; i < points; i++) {
    const changeHome = (Math.random() - 0.5) * 0.2;
    const changeDraw = (Math.random() - 0.5) * 0.2;
    const changeAway = (Math.random() - 0.5) * 0.2;
    
    current = {
      home: Math.max(1.01, Math.min(5.0, current.home + changeHome)),
      draw: Math.max(2.0, Math.min(6.0, current.draw + changeDraw)),
      away: Math.max(1.01, Math.min(5.0, current.away + changeAway)),
      time: Date.now() - (points - i) * 3000
    };
    
    history.push(current);
  }
  
  return history;
};

export default function LockForward() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContract, isPending } = useWriteContract();
  
  const [matches, setMatches] = useState(INITIAL_MATCHES);
  const [oddsHistory, setOddsHistory] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [selectedOutcome, setSelectedOutcome] = useState(null);
  const [stakeAmount, setStakeAmount] = useState("");
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [focusedGraph, setFocusedGraph] = useState(1);
  const [activityFeed, setActivityFeed] = useState([]);
  const [showPopup, setShowPopup] = useState(false);

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // INITIALIZE WITH PRE-POPULATED GRAPH DATA
  useEffect(() => {
    const initialHistory = {};
    INITIAL_MATCHES.forEach(match => {
      initialHistory[`match-${match.id}`] = generateInitialHistory({
        home: match.homeOdds,
        draw: match.drawOdds,
        away: match.awayOdds
      });
    });
    setOddsHistory(initialHistory);
  }, []);

  // Generate activity feed
  useEffect(() => {
    const generateActivity = () => {
      const template = ACTIVITY_TEMPLATES[Math.floor(Math.random() * ACTIVITY_TEMPLATES.length)];
      const timestamp = new Date();
      return { ...template, timestamp, id: Date.now() };
    };

    setActivityFeed([generateActivity(), generateActivity(), generateActivity()]);

    const interval = setInterval(() => {
      setActivityFeed(prev => [generateActivity(), ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  // Live odds with MORE VOLATILITY
  useEffect(() => {
    const interval = setInterval(() => {
      setMatches(prevMatches =>
        prevMatches.map(match => {
          const shouldChange = Math.random() < 0.7;
          if (!shouldChange) return match;

          const changeHome = (Math.random() - 0.5) * 0.25;
          const changeDraw = (Math.random() - 0.5) * 0.25;
          const changeAway = (Math.random() - 0.5) * 0.25;

          const newMatch = {
            ...match,
            homeOdds: Math.max(1.01, Math.min(5.0, match.homeOdds + changeHome)),
            drawOdds: Math.max(2.0, Math.min(6.0, match.drawOdds + changeDraw)),
            awayOdds: Math.max(1.01, Math.min(5.0, match.awayOdds + changeAway)),
          };

          setOddsHistory(prev => {
            const key = `match-${match.id}`;
            const history = prev[key] || [];
            return {
              ...prev,
              [key]: [...history.slice(-50), {
                home: newMatch.homeOdds,
                draw: newMatch.drawOdds,
                away: newMatch.awayOdds,
                time: Date.now()
              }]
            };
          });

          return newMatch;
        })
      );
      setLastUpdate(new Date());
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Show popup on success
  useEffect(() => {
    if (isSuccess) {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 5000);
    }
  }, [isSuccess]);

  const renderFullChart = (matchId) => {
    const history = oddsHistory[`match-${matchId}`] || [];
    if (history.length < 2) return null;

    const width = 100;
    const height = 60;
    const padding = 5;

    const allValues = [...history.map(h => h.home), ...history.map(h => h.draw), ...history.map(h => h.away)];
    const max = Math.max(...allValues);
    const min = Math.min(...allValues);
    const range = max - min || 1;

    const createPath = (type, color) => {
      const values = history.map(h => h[type]);
      const points = values.map((val, i) => {
        const x = padding + (i / (values.length - 1)) * (width - 2 * padding);
        const y = padding + (1 - (val - min) / range) * (height - 2 * padding);
        return `${x},${y}`;
      }).join(' ');

      return (
        <polyline
          key={type}
          points={points}
          fill="none"
          stroke={color}
          strokeWidth="2"
        />
      );
    };

    // Grid lines - 3 horizontal lines
    const gridLines = [0.25, 0.5, 0.75].map((ratio, i) => {
      const y = padding + ratio * (height - 2 * padding);
      return (
        <line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#333"
          strokeWidth="0.5"
          strokeDasharray="2,2"
        />
      );
    });

    const latestHome = history[history.length - 1].home;
    const latestDraw = history[history.length - 1].draw;
    const latestAway = history[history.length - 1].away;

    return (
      <div style={{ flex: 1 }}>
        <svg width="100%" height="150" viewBox={`0 0 ${width} ${height}`} style={{ background: "#0a0a0a", borderRadius: "8px" }}>
          {gridLines}
          {createPath('home', '#0052FF')}
          {createPath('draw', '#888')}
          {createPath('away', '#00ff00')}
        </svg>
        <div style={{ display: "flex", justifyContent: "space-around", marginTop: "8px", fontSize: "11px" }}>
          <div style={{ color: "#0052FF" }}>Home: {latestHome.toFixed(2)}x</div>
          <div style={{ color: "#888" }}>Draw: {latestDraw.toFixed(2)}x</div>
          <div style={{ color: "#00ff00" }}>Away: {latestAway.toFixed(2)}x</div>
        </div>
      </div>
    );
  };


  const lockForward = async () => {
    if (!selectedMatch || !selectedOutcome || !stakeAmount) {
      alert("Please select a match, outcome, and enter stake amount!");
      return;
    }

    try {
      const match = matches.find(m => m.id === selectedMatch);
      let odds;
      
      if (selectedOutcome === 'home') odds = match.homeOdds;
      else if (selectedOutcome === 'draw') odds = match.drawOdds;
      else odds = match.awayOdds;

      const oddsScaled = Math.floor(odds * 1000);

      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: 'lockForward',
        args: [
          BigInt(selectedMatch),
          BigInt(oddsScaled),
          `0x${Date.now().toString(16).padStart(40, '0')}`
        ],
        value: parseEther(stakeAmount)
      });

    } catch (error) {
      console.error(error);
      alert(`Error: ${error.message}`);
    }
  };

  if (!isConnected) {
    return (
      <div style={{ textAlign: "center", padding: "40px" }}>
        <h2>Please connect your wallet to lock forwards</h2>
      </div>
    );
  }

  const newsText = "     BREAKING: Icardi confirmed starting lineup Galatasaray odds fell 0.2x     LIVE UPDATE: Roma leads Lazio 1-0 at 65 minutes Away odds rising     WEATHER ALERT: Heavy rain expected in Milano for AC Milan match could affect gameplay     WHALE ACTIVITY: vitalik.eth just locked 0.5 ETH position on Juventus at 1.9x odds     HIGH VOLUME: Beşiktaş vs Trabzonspor seeing 300% more betting volume than usual     VOLATILITY WARNING: Fenerbahçe odds moved 0.4x in last hour showing high market uncertainty     INJURY REPORT: Inter Milan defender Bastoni doubtful for Sunday match odds adjusting     CONFIRMED: Napoli striker Osimhen returns from suspension team odds improving     SHARP MONEY: 70% of large bets placed on Galatasaray despite lower odds institutional interest     BREAKING: Icardi confirmed starting lineup Galatasaray odds fell 0.2x     LIVE UPDATE: Roma leads Lazio 1-0 at 65 minutes Away odds rising     ";

  return (
    <div style={{ paddingBottom: "100px" }}>
      {/* SUCCESS POPUP */}
      {showPopup && (
        <div style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          background: "#0a3d0a",
          border: "2px solid #00ff00",
          borderRadius: "12px",
          padding: "30px",
          zIndex: 10000,
          boxShadow: "0 8px 32px rgba(0, 255, 0, 0.3)",
          minWidth: "300px",
          textAlign: "center"
        }}>
          <div style={{ fontSize: "48px", marginBottom: "15px" }}>✅</div>
          <h3 style={{ color: "#00ff00", margin: "0 0 10px 0" }}>Forward Locked!</h3>
          <p style={{ color: "#888", fontSize: "12px", margin: "0 0 15px 0" }}>
            TX: {hash?.slice(0, 10)}...{hash?.slice(-8)}
          </p>
          <button onClick={() => setShowPopup(false)} style={{
            padding: "10px 20px",
            background: "#00ff00",
            color: "black",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold"
          }}>
            Close
          </button>
        </div>
      )}

      {showPopup && (
        <div onClick={() => setShowPopup(false)} style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.7)",
          zIndex: 9999
        }} />
      )}

      {/* FASTER NEWS SCROLL - 8s instead of 15s */}
      <div style={{ 
        background: "linear-gradient(90deg, #0052FF 0%, #0066FF 100%)", 
        color: "white", 
        padding: "10px 0", 
        marginBottom: "15px", 
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 82, 255, 0.3)",
        overflow: "hidden"
      }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center",
          whiteSpace: "nowrap",
          animation: "scroll 8s linear infinite"
        }}>
          <span style={{ 
            background: "#ff4444", 
            padding: "3px 8px", 
            borderRadius: "4px", 
            fontSize: "9px", 
            fontWeight: "bold",
            marginLeft: "15px",
            marginRight: "15px"
          }}>
            LIVE
          </span>
          <div style={{ fontSize: "11px", fontWeight: "500" }}>
            {newsText}{newsText}{newsText}
          </div>
        </div>
      </div>

      {/* PORTFOLIO + TERMINAL */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "15px" }}>
        <div style={{ padding: "12px", background: "#1a1a1a", borderRadius: "10px", border: "1px solid #0052FF" }}>
          <h3 style={{ margin: "0 0 10px 0", fontSize: "12px", color: "#0052FF" }}>Portfolio</h3>
          <div style={{ display: "grid", gap: "6px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#888" }}>Locked:</span>
              <strong style={{ color: "#fff" }}>0.00 ETH</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#888" }}>Positions:</span>
              <strong style={{ color: "#fff" }}>0</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#888" }}>Potential:</span>
              <strong style={{ color: "#00ff00" }}>0.00 ETH</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px" }}>
              <span style={{ color: "#888" }}>Risk:</span>
              <strong style={{ color: "#ff4444" }}>0.00 ETH</strong>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px", background: "#0a0a0a", borderRadius: "10px", border: "1px solid #0052FF" }}>
          <h2 style={{ margin: "0 0 4px 0", fontSize: "14px" }}>Live Terminal</h2>
          <p style={{ margin: "0 0 8px 0", fontSize: "10px", color: "#888" }}>
            Study charts, lock when ready
          </p>
          <div style={{ display: "flex", gap: "10px", fontSize: "10px" }}>
            <div>
              <span style={{ color: "#888" }}>Status:</span>{" "}
              <strong style={{ color: "#00ff00" }}>LIVE</strong>
            </div>
            <div>
              <span style={{ color: "#888" }}>Update:</span>{" "}
              <strong>2s</strong>
            </div>
            <div>
              <span style={{ color: "#888" }}>Last:</span>{" "}
              <strong>{lastUpdate.toLocaleTimeString()}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* ACTIVITY FEED - MORE FREQUENT */}
      <div style={{ background: "#1a1a1a", padding: "12px", borderRadius: "10px", marginBottom: "15px", border: "1px solid #333" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
          Live Activity
          <span style={{ fontSize: "8px", color: "#00ff00", background: "#0a3d0a", padding: "2px 5px", borderRadius: "3px" }}>REAL-TIME</span>
        </h3>
        <div style={{ display: "grid", gap: "5px", maxHeight: "120px", overflowY: "auto" }}>
          {activityFeed.map((activity, idx) => (
            <div key={activity.id} style={{ 
              padding: "6px", 
              background: "#0a0a0a", 
              borderRadius: "5px", 
              fontSize: "10px", 
              color: "#888", 
              borderLeft: `2px solid ${activity.type === 'lock' ? '#0052FF' : activity.type === 'sell' || activity.type === 'win' ? '#00ff00' : '#ff4444'}`,
              animation: idx === 0 ? "fadeIn 0.5s ease-out" : "none"
            }}>
              <span style={{ color: "#0052FF", fontWeight: "bold" }}>{activity.user}</span> {activity.action} {activity.match && <strong style={{ color: "#fff" }}>{activity.match}</strong>} {activity.odds && `at ${activity.odds}`} {activity.profit && <strong style={{ color: activity.type === 'win' || activity.type === 'sell' ? "#00ff00" : "#ff4444" }}>{activity.profit}</strong>}
              <div style={{ fontSize: "8px", color: "#666", marginTop: "2px" }}>{idx * 8} sec ago</div>
            </div>
          ))}
        </div>
      </div>

      {/* CHARTS PANEL WITH DROPDOWN */}
      <div style={{ background: "#1a1a1a", padding: "15px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #333" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <h3 style={{ margin: 0, fontSize: "13px" }}>
            Odds Analysis
            <span style={{ fontSize: "9px", color: "#888", fontWeight: "normal", marginLeft: "8px" }}>
              (Blue=Home, Gray=Draw, Green=Away)
            </span>
          </h3>
          
          <select 
            value={focusedGraph} 
            onChange={(e) => setFocusedGraph(Number(e.target.value))}
            style={{
              padding: "6px 10px",
              background: "#2a2a2a",
              border: "1px solid #444",
              borderRadius: "6px",
              color: "white",
              cursor: "pointer",
              fontSize: "11px"
            }}
          >
            {matches.map(match => (
              <option key={match.id} value={match.id}>
                {match.homeTeam} vs {match.awayTeam}
              </option>
            ))}
          </select>
        </div>

        {matches.filter(m => m.id === focusedGraph).map(match => (
          <div key={match.id} style={{ background: "#0a0a0a", padding: "12px", borderRadius: "8px" }}>
            <div style={{ marginBottom: "8px" }}>
              <div style={{ fontSize: "12px", fontWeight: "bold" }}>{match.homeTeam} vs {match.awayTeam}</div>
              <div style={{ fontSize: "9px", color: "#0052FF" }}>{match.league} • {match.date}</div>
            </div>
            {renderFullChart(match.id)}
            <div style={{ marginTop: "8px", fontSize: "9px", color: "#666", textAlign: "center" }}>
              Rising = losing favor • Falling = gaining favor
            </div>
          </div>
        ))}
      </div>

      {/* Educational - Compact */}
      <div style={{ background: "#1a1a1a", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #0052FF" }}>
        <h3 style={{ marginTop: 0, marginBottom: "10px", fontSize: "12px" }}>Chart Reading</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px" }}>
          <div>
            <h4 style={{ color: "#0052FF", fontSize: "11px", margin: "0 0 3px 0" }}>Falling Line</h4>
            <p style={{ color: "#888", fontSize: "10px", margin: 0 }}>Team favored. Lock NOW!</p>
          </div>
          <div>
            <h4 style={{ color: "#00ff00", fontSize: "11px", margin: "0 0 3px 0" }}>Rising Line</h4>
            <p style={{ color: "#888", fontSize: "10px", margin: 0 }}>Losing favor. WAIT or avoid.</p>
          </div>
          <div>
            <h4 style={{ color: "#ffaa00", fontSize: "11px", margin: "0 0 3px 0" }}>Flat Line</h4>
            <p style={{ color: "#888", fontSize: "10px", margin: 0 }}>Market calm. Safe to lock.</p>
          </div>
        </div>
      </div>

      {/* MATCH CARDS */}
      <h3 style={{ marginBottom: "15px", fontSize: "16px" }}>Lock Your Position</h3>
      <div style={{ display: "grid", gap: "20px" }}>
        {matches.map((match) => {
          const history = oddsHistory[`match-${match.id}`];
          const prevOdds = history && history.length > 1 ? history[history.length - 2] : null;

          const getIndicator = (current, prev) => {
            if (!prev) return { symbol: "→", color: "#888" };
            if (current > prev) return { symbol: "↑", color: "#00ff00" };
            if (current < prev) return { symbol: "↓", color: "#ff4444" };
            return { symbol: "→", color: "#888" };
          };

          return (
            <div
              key={match.id}
              style={{
                background: "#1a1a1a",
                border: selectedMatch === match.id ? "2px solid #0052FF" : "1px solid #333",
                borderRadius: "16px",
                padding: "20px"
              }}
            >
              <div style={{ marginBottom: "15px", borderBottom: "1px solid #333", paddingBottom: "10px" }}>
                <div style={{ fontSize: "11px", color: "#0052FF", marginBottom: "5px" }}>{match.league}</div>
                <h3 style={{ fontSize: "18px", margin: "5px 0" }}>{match.homeTeam} vs {match.awayTeam}</h3>
                <div style={{ fontSize: "11px", color: "#888" }}>{match.date}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "15px" }}>
                <button
                  onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('home'); }}
                  style={{
                    padding: "15px 10px",
                    background: selectedMatch === match.id && selectedOutcome === 'home' ? "#0052FF" : "#2a2a2a",
                    border: "1px solid #444",
                    borderRadius: "10px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>HOME</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>{match.homeOdds.toFixed(2)}x</span>
                    <span style={{ fontSize: "13px", color: getIndicator(match.homeOdds, prevOdds?.home).color }}>
                      {getIndicator(match.homeOdds, prevOdds?.home).symbol}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>{match.homeTeam}</div>
                </button>

                <button
                  onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('draw'); }}
                  style={{
                    padding: "15px 10px",
                    background: selectedMatch === match.id && selectedOutcome === 'draw' ? "#0052FF" : "#2a2a2a",
                    border: "1px solid #444",
                    borderRadius: "10px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>DRAW</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>{match.drawOdds.toFixed(2)}x</span>
                    <span style={{ fontSize: "13px", color: getIndicator(match.drawOdds, prevOdds?.draw).color }}>
                      {getIndicator(match.drawOdds, prevOdds?.draw).symbol}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>Tie</div>
                </button>

                <button
                  onClick={() => { setSelectedMatch(match.id); setSelectedOutcome('away'); }}
                  style={{
                    padding: "15px 10px",
                    background: selectedMatch === match.id && selectedOutcome === 'away' ? "#0052FF" : "#2a2a2a",
                    border: "1px solid #444",
                    borderRadius: "10px",
                    color: "white",
                    cursor: "pointer"
                  }}
                >
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "5px" }}>AWAY</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
                    <span style={{ fontSize: "18px", fontWeight: "bold" }}>{match.awayOdds.toFixed(2)}x</span>
                    <span style={{ fontSize: "13px", color: getIndicator(match.awayOdds, prevOdds?.away).color }}>
                      {getIndicator(match.awayOdds, prevOdds?.away).symbol}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#888", marginTop: "5px" }}>{match.awayTeam}</div>
                </button>
              </div>

              {selectedMatch === match.id && (
                <div style={{ marginTop: "15px", padding: "15px", background: "#0a0a0a", borderRadius: "10px", border: "1px solid #0052FF" }}>
                  <label style={{ display: "block", marginBottom: "10px", color: "#0052FF", fontSize: "13px" }}>Stake (ETH)</label>
                  <input
                    type="number"
                    step="0.001"
                    placeholder="0.01"
                    value={stakeAmount}
                    onChange={(e) => setStakeAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #333",
                      background: "#1a1a1a",
                      color: "white",
                      fontSize: "14px"
                    }}
                  />
                  <div style={{ fontSize: "11px", color: "#888", marginTop: "8px" }}>
                    Locking: <strong>{selectedOutcome === 'home' ? match.homeTeam : selectedOutcome === 'draw' ? 'Draw' : match.awayTeam}</strong> at <strong>{selectedOutcome === 'home' ? match.homeOdds.toFixed(2) : selectedOutcome === 'draw' ? match.drawOdds.toFixed(2) : match.awayOdds.toFixed(2)}x</strong>
                  </div>

                  {stakeAmount && parseFloat(stakeAmount) > 0 && (
                    <div style={{ marginTop: "15px", padding: "12px", background: "#0a3d0a", borderRadius: "8px", border: "1px solid #00ff00" }}>
                      <h4 style={{ margin: "0 0 8px 0", color: "#00ff00", fontSize: "12px" }}>Potential Outcomes</h4>
                      <div style={{ fontSize: "11px", color: "#888", lineHeight: "1.6" }}>
                        {(() => {
                          const odds = selectedOutcome === 'home' ? match.homeOdds : selectedOutcome === 'draw' ? match.drawOdds : match.awayOdds;
                          const stake = parseFloat(stakeAmount);
                          const potentialWin = stake * odds;
                          const profit = potentialWin - stake;
                          
                          return (
                            <>
                              <p style={{ margin: "4px 0" }}>
                                <strong style={{ color: "#00ff00" }}>If WIN:</strong> {potentialWin.toFixed(3)} ETH (+{profit.toFixed(3)})
                              </p>
                              <p style={{ margin: "4px 0" }}>
                                <strong style={{ color: "#ff4444" }}>If LOSE:</strong> 0 ETH (-{stake.toFixed(3)})
                              </p>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STICKY LOCK BUTTON */}
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
            onClick={lockForward}
            disabled={isPending || isConfirming || !stakeAmount}
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
            {isPending ? "Confirming..." : isConfirming ? "Processing..." : "Lock Forward"}
          </button>
        </div>
      )}

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.33%);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}