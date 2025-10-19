"use client";
import { useState, useEffect } from "react";
import { useAccount, useDisconnect } from "wagmi";
import { normalize } from "viem/ens";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export default function UserProfile() {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [showProfile, setShowProfile] = useState(false);
  const [ensData, setEnsData] = useState(null);
  const [stats, setStats] = useState({
    totalForwards: 3,
    totalOptions: 1,
    totalVolume: "0.045",
    winRate: 67,
    profitLoss: "+0.012"
  });
  const [badges, setBadges] = useState([
    { id: 1, name: "Early Adopter", emoji: "🌟", earned: true, description: "One of the first traders" },
    { id: 2, name: "Whale", emoji: "🐋", earned: false, description: "Trade > 1 ETH volume" },
    { id: 3, name: "Diamond Hands", emoji: "💎", earned: true, description: "Hold position for 7+ days" },
    { id: 4, name: "Risk Taker", emoji: "🎲", earned: false, description: "Lock 5+ forwards" },
    { id: 5, name: "Option Master", emoji: "📈", earned: false, description: "Exercise 3+ options" },
    { id: 6, name: "Sharp Trader", emoji: "🎯", earned: true, description: "70%+ win rate" },
  ]);

  useEffect(() => {
    async function fetchENS() {
      if (!address) return;
      try {
        const ensName = await publicClient.getEnsName({ address });
        if (ensName) {
          const avatar = await publicClient.getEnsAvatar({ name: normalize(ensName) });
          const [description, twitter, website] = await Promise.all([
            publicClient.getEnsText({ name: normalize(ensName), key: "description" }).catch(() => null),
            publicClient.getEnsText({ name: normalize(ensName), key: "com.twitter" }).catch(() => null),
            publicClient.getEnsText({ name: normalize(ensName), key: "url" }).catch(() => null),
          ]);
          setEnsData({ name: ensName, avatar, description, twitter, website });
        }
      } catch (error) {
        console.error("Error fetching ENS:", error);
      }
    }
    if (isConnected) fetchENS();
  }, [address, isConnected]);

  if (!isConnected) return null;

  return (
    <>
      {/* PROFILE BUTTON */}
      <button
        onClick={() => setShowProfile(true)}
        style={{
          padding: "10px 16px",
          background: "linear-gradient(135deg, #0052FF 0%, #0066FF 100%)",
          border: "2px solid #0052FF",
          borderRadius: "12px",
          color: "white",
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: "14px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          boxShadow: "0 4px 12px rgba(0, 82, 255, 0.3)"
        }}
      >
        {ensData?.avatar ? (
          <img src={ensData.avatar} alt="Avatar" style={{ width: "24px", height: "24px", borderRadius: "50%" }} />
        ) : (
          <div style={{ 
            width: "24px", 
            height: "24px", 
            borderRadius: "50%", 
            background: "#00ff00",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "12px",
            fontWeight: "bold"
          }}>
            {ensData?.name?.[0]?.toUpperCase() || "👤"}
          </div>
        )}
        {ensData?.name || `${address.slice(0, 6)}...${address.slice(-4)}`}
      </button>

      {/* PROFILE MODAL */}
      {showProfile && (
        <>
          {/* BACKDROP */}
          <div 
            onClick={() => setShowProfile(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.8)",
              zIndex: 9998,
              backdropFilter: "blur(4px)"
            }}
          />

          {/* MODAL */}
          <div style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
            border: "2px solid #0052FF",
            borderRadius: "16px",
            padding: "30px",
            zIndex: 9999,
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 8px 32px rgba(0, 82, 255, 0.4)"
          }}>
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowProfile(false)}
              style={{
                position: "absolute",
                top: "15px",
                right: "15px",
                background: "transparent",
                border: "none",
                color: "#888",
                fontSize: "24px",
                cursor: "pointer",
                padding: "5px"
              }}
            >
              ×
            </button>

            {/* PROFILE HEADER */}
            <div style={{ textAlign: "center", marginBottom: "25px" }}>
              {ensData?.avatar ? (
                <img 
                  src={ensData.avatar} 
                  alt="Avatar"
                  style={{ 
                    width: "80px", 
                    height: "80px", 
                    borderRadius: "50%", 
                    border: "3px solid #0052FF",
                    marginBottom: "15px"
                  }} 
                />
              ) : (
                <div style={{ 
                  width: "80px", 
                  height: "80px", 
                  borderRadius: "50%", 
                  background: "linear-gradient(135deg, #0052FF 0%, #00ff00 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "36px",
                  fontWeight: "bold",
                  margin: "0 auto 15px",
                  border: "3px solid #0052FF"
                }}>
                  👤
                </div>
              )}
              <h2 style={{ margin: "0 0 8px 0", fontSize: "24px", color: "#fff" }}>
                {ensData?.name || "Anonymous Trader"}
              </h2>
              <div style={{ fontSize: "11px", color: "#666", wordBreak: "break-all" }}>
                {address.slice(0, 12)}...{address.slice(-10)}
              </div>
              {ensData?.description && (
                <p style={{ fontSize: "12px", color: "#aaa", marginTop: "12px", fontStyle: "italic" }}>
                  "{ensData.description}"
                </p>
              )}
            </div>

            {/* SOCIAL LINKS */}
            {(ensData?.twitter || ensData?.website) && (
              <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginBottom: "25px", flexWrap: "wrap" }}>
                {ensData.twitter && (
                  <a 
                    href={`https://twitter.com/${ensData.twitter}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: "6px 12px",
                      background: "#1DA1F2",
                      borderRadius: "8px",
                      color: "white",
                      textDecoration: "none",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}
                  >
                    🐦 @{ensData.twitter}
                  </a>
                )}
                {ensData.website && (
                  <a 
                    href={ensData.website.startsWith('http') ? ensData.website : `https://${ensData.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ 
                      padding: "6px 12px",
                      background: "#333",
                      borderRadius: "8px",
                      color: "white",
                      textDecoration: "none",
                      fontSize: "11px",
                      fontWeight: "600"
                    }}
                  >
                    🌐 Website
                  </a>
                )}
              </div>
            )}

            {/* STATS */}
            <div style={{ 
              background: "#0a0a0a", 
              padding: "20px", 
              borderRadius: "12px", 
              marginBottom: "25px",
              border: "1px solid #333"
            }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#0052FF" }}>📊 Trading Stats</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Total Forwards</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{stats.totalForwards}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Total Options</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{stats.totalOptions}</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Volume Traded</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#fff" }}>{stats.totalVolume} ETH</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Win Rate</div>
                  <div style={{ fontSize: "18px", fontWeight: "bold", color: "#00ff00" }}>{stats.winRate}%</div>
                </div>
              </div>
              <div style={{ marginTop: "15px", padding: "12px", background: "#0a3d0a", borderRadius: "8px", border: "1px solid #00ff00" }}>
                <div style={{ fontSize: "10px", color: "#888", marginBottom: "4px" }}>Total P&L</div>
                <div style={{ fontSize: "24px", fontWeight: "bold", color: "#00ff00" }}>{stats.profitLoss} ETH</div>
              </div>
            </div>

            {/* BADGES */}
            <div style={{ marginBottom: "25px" }}>
              <h3 style={{ margin: "0 0 15px 0", fontSize: "14px", color: "#0052FF" }}>🏆 Achievement Badges</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {badges.map(badge => (
                  <div 
                    key={badge.id}
                    style={{ 
                      padding: "12px", 
                      background: badge.earned ? "#0a3d0a" : "#1a1a1a", 
                      border: badge.earned ? "1px solid #00ff00" : "1px solid #333",
                      borderRadius: "10px",
                      opacity: badge.earned ? 1 : 0.5,
                      textAlign: "center"
                    }}
                  >
                    <div style={{ fontSize: "32px", marginBottom: "5px" }}>{badge.emoji}</div>
                    <div style={{ fontSize: "11px", fontWeight: "bold", color: badge.earned ? "#00ff00" : "#888", marginBottom: "3px" }}>
                      {badge.name}
                    </div>
                    <div style={{ fontSize: "9px", color: "#666" }}>{badge.description}</div>
                    {badge.earned && (
                      <div style={{ fontSize: "8px", color: "#00ff00", marginTop: "5px" }}>✓ EARNED</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* DISCONNECT BUTTON */}
            <button
              onClick={() => {
                disconnect();
                setShowProfile(false);
              }}
              style={{
                width: "100%",
                padding: "12px",
                background: "#ff4444",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px"
              }}
            >
              Disconnect Wallet
            </button>
          </div>
        </>
      )}
    </>
  );
}
