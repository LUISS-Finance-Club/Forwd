"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import LockForward from "./components/LockForward";
import MyForwards from "./components/MyForwards";
import Marketplace from "./components/Marketplace";
import ENSAddress from "./components/ENSAddress";
import ENSShowcase from "./components/ENSShowcase";

export default function Home() {
  const [activeTab, setActiveTab] = useState("lock");
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

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
          <div style={{ display: "flex", alignItems: "center", gap: "15px", flexWrap: "wrap" }}>
            
            {/* ENS TEST - Shows vitalik.eth to prove ENS works */}
            <span style={{ 
              padding: "8px 15px", 
              background: "#0a3d0a", 
              borderRadius: "8px",
              border: "1px solid #0f0",
              fontSize: "14px"
            }}>
              ✅ ENS Test: <ENSAddress address="0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045" />
            </span>
            
            {/* Your actual wallet address */}
            <span style={{ 
              padding: "10px 20px", 
              background: "#1a1a1a", 
              borderRadius: "8px",
              border: "1px solid #333"
            }}>
              <ENSAddress address={address} />
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
        
        <button
          onClick={() => setActiveTab("ens")}
          style={{
            padding: "10px 20px",
            background: activeTab === "ens" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "16px"
          }}
        >
          🎯 ENS Features
        </button>

      </nav>

      {/* Content */}
      <div style={{ padding: "40px" }}>
        {activeTab === "lock" && <LockForward />}
        {activeTab === "myforwards" && mounted && <MyForwards />}
        {activeTab === "marketplace" && mounted && <Marketplace />}
        {activeTab === "ens" && mounted && <ENSShowcase />}
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
        🔒 Stakes encrypted with iExec-ready architecture | 
        🧪 Testing on Base Sepolia (FREE testnet!) | 
        📄 Contract: 0x8F8E...C598
      </footer>
    </main>
  );
}
