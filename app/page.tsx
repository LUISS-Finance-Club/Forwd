"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import LockForward from "./components/LockForward";
import MyForwards from "./components/MyForwards";
import Marketplace from "./components/Marketplace";

export default function Home() {
  const [activeTab, setActiveTab] = useState("lock");
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  // Fix hydration error - only render wallet UI after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main style={{ minHeight: "100vh", background: "#0a0a0a", color: "white" }}>
      {/* Header */}
      <header style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        borderBottom: "1px solid #333"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "48px" }}>⚽</span>
          <h1 style={{ fontSize: "36px", margin: 0 }}>PreStake</h1>
        </div>
        
        {/* Only render after mount to prevent hydration mismatch */}
        {!mounted ? (
          <div style={{ 
            padding: "10px 20px",
            background: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #333",
            color: "#666"
          }}>
            Loading...
          </div>
        ) : isConnected ? (
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <span style={{ 
              padding: "10px 20px", 
              background: "#1a1a1a", 
              borderRadius: "8px",
              border: "1px solid #333"
            }}>
              {address?.substring(0, 6)}...{address?.substring(38)}
            </span>
            <button
              onClick={() => disconnect()}
              style={{
                padding: "10px 20px",
                background: "#ff4444",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold"
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "10px" }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  padding: "10px 20px",
                  background: "#0052FF",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Navigation Tabs */}
      <nav style={{
        display: "flex",
        gap: "20px",
        padding: "20px 40px",
        borderBottom: "1px solid #333"
      }}>
        <button
          onClick={() => setActiveTab("lock")}
          style={{
            padding: "10px 20px",
            background: activeTab === "lock" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🔒 Lock Forward
        </button>
        <button
          onClick={() => setActiveTab("myforwards")}
          style={{
            padding: "10px 20px",
            background: activeTab === "myforwards" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          📊 My Forwards
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          style={{
            padding: "10px 20px",
            background: activeTab === "marketplace" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🛒 Marketplace
        </button>
      </nav>

      {/* Content */}
      <div style={{ padding: "40px" }}>
        {activeTab === "lock" && <LockForward />}
        {activeTab === "myforwards" && mounted && <MyForwards />}
        {activeTab === "marketplace" && mounted && <Marketplace />}
      </div>

      {/* Footer Info */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        padding: "15px",
        background: "#111",
        borderTop: "1px solid #333",
        textAlign: "center",
        fontSize: "14px",
        color: "#888"
      }}>
        🔒 Stakes encrypted with iExec DataProtector | 
        🧪 Testing on Base Sepolia (FREE testnet!) | 
        📄 Contract: 0x8F8E...C598
      </footer>
    </main>
  );
}
