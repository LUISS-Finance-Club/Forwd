"use client";
import { useState, useEffect } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import LockForward from "./components/LockForward";
import MyForwards from "./components/MyForwards";
import Marketplace from "./components/Marketplace";
import ENSAddress from "./components/ENSAddress";
import BuyOptions from "./components/BuyOptions";


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
      {/* Header - MOBILE OPTIMIZED */}
      <header style={{
        display: "flex",
        flexDirection: "column",
        gap: "15px",
        padding: "15px 20px",
        borderBottom: "1px solid #333"
      }}>
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <span style={{ fontSize: "36px" }}>⚽</span>
          <h1 style={{ fontSize: "28px", margin: 0 }}>PreStake</h1>
        </div>
        
        {/* Wallet connection row */}
        {!mounted ? (
          <div style={{ 
            padding: "10px 15px",
            background: "#1a1a1a",
            borderRadius: "8px",
            border: "1px solid #333",
            color: "#666",
            fontSize: "14px",
            textAlign: "center"
          }}>
            Loading...
          </div>
        ) : isConnected ? (
          <div style={{ 
            display: "flex",
            gap: "10px",
            alignItems: "center"
          }}>
            {/* ✅ REMOVED GREEN ENS TEST BOX */}
            <div style={{ 
              flex: 1,
              padding: "10px 15px", 
              background: "#1a1a1a", 
              borderRadius: "8px",
              border: "1px solid #333",
              fontSize: "14px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap"
            }}>
              <ENSAddress address={address} />
            </div>
            
            <button
              onClick={() => disconnect()}
              style={{
                padding: "10px 15px",
                background: "#ff4444",
                border: "none",
                borderRadius: "8px",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: "14px",
                whiteSpace: "nowrap"
              }}
            >
              Disconnect
            </button>
          </div>
        ) : (
          <div style={{ 
            display: "flex", 
            flexDirection: "column",
            gap: "10px",
            width: "100%"
          }}>
            {connectors.map((connector) => (
              <button
                key={connector.id}
                onClick={() => connect({ connector })}
                style={{
                  width: "100%",
                  padding: "12px 20px",
                  background: "#0052FF",
                  border: "none",
                  borderRadius: "8px",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                  fontSize: "16px"
                }}
              >
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Navigation Tabs - MOBILE OPTIMIZED */}
      <nav style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "10px",
        padding: "15px 20px",
        borderBottom: "1px solid #333",
        overflowX: "auto"
      }}>
        <button
          onClick={() => setActiveTab("lock")}
          style={{
            padding: "12px 15px",
            background: activeTab === "lock" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}
        >
          Lock
        </button>
        <button
          onClick={() => setActiveTab("myforwards")}
          style={{
            padding: "12px 15px",
            background: activeTab === "myforwards" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}
        >
          My Forwards
        </button>
        <button
          onClick={() => setActiveTab("marketplace")}
          style={{
            padding: "12px 15px",
            background: activeTab === "marketplace" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}
        >
          Market
        </button>

        <button
          onClick={() => setActiveTab("options")}
          style={{
            padding: "12px 15px",
            background: activeTab === "options" ? "#0052FF" : "transparent",
            border: "1px solid #333",
            borderRadius: "8px",
            color: "white",
            cursor: "pointer",
            fontSize: "14px",
            whiteSpace: "nowrap"
          }}
        >
          Options
        </button>


      </nav>

      {/* Content - MOBILE OPTIMIZED */}
      <div style={{ padding: "20px" }}>
        {activeTab === "lock" && <LockForward />} 


        {activeTab === "myforwards" && mounted && <MyForwards />}
        {activeTab === "marketplace" && mounted && <Marketplace />}
        {activeTab === "options" && mounted && <BuyOptions />}

      </div>

      {/* Footer - MOBILE OPTIMIZED */}
      <footer style={{
        position: "fixed",
        bottom: 0,
        width: "100%",
        padding: "12px 10px",
        background: "#111",
        borderTop: "1px solid #333",
        textAlign: "center",
        fontSize: "11px",
        color: "#888",
        lineHeight: "1.4"
      }}>
        🔒 iExec-ready | 🧪 Base Sepolia
      </footer>
    </main>
  );
}
