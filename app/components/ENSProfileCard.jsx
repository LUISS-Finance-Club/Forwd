"use client";
import { useState, useEffect } from "react";
import { normalize } from "viem/ens";
import { createPublicClient, http } from "viem";
import { mainnet } from "viem/chains";

const publicClient = createPublicClient({
  chain: mainnet,
  transport: http("https://eth.llamarpc.com"),
});

export default function ENSProfileCard({ address }) {
  const [ensData, setEnsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFullENSProfile() {
      try {
        const ensName = await publicClient.getEnsName({ address });
        
        if (ensName) {
          const avatar = await publicClient.getEnsAvatar({ name: normalize(ensName) });
          
          const [description, twitter, website] = await Promise.all([
            publicClient.getEnsText({ name: normalize(ensName), key: "description" }).catch(() => null),
            publicClient.getEnsText({ name: normalize(ensName), key: "com.twitter" }).catch(() => null),
            publicClient.getEnsText({ name: normalize(ensName), key: "url" }).catch(() => null),
          ]);

          setEnsData({
            name: ensName,
            avatar,
            description,
            twitter,
            website,
            address,
          });
        } else {
          setEnsData({ address });
        }
      } catch (error) {
        console.error("Error fetching ENS:", error);
        setEnsData({ address });
      }
      setLoading(false);
    }

    fetchFullENSProfile();
  }, [address]);

  if (loading) {
    return (
      <div style={{ padding: "12px", background: "#0a0a0a", borderRadius: "8px", border: "1px solid #333" }}>
        <div style={{ fontSize: "11px", color: "#888" }}>Loading...</div>
      </div>
    );
  }

  if (!ensData?.name) {
    return (
      <div style={{ padding: "12px", background: "#0a0a0a", borderRadius: "8px", border: "1px solid #333" }}>
        <div style={{ fontSize: "11px", color: "#888", wordBreak: "break-all" }}>
          {address.slice(0, 6)}...{address.slice(-4)}
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: "12px", 
      background: "#0a0a0a", 
      borderRadius: "8px", 
      border: "1px solid #0052FF"
    }}>
      {/* Header: Avatar + Name */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        {ensData.avatar ? (
          <img 
            src={ensData.avatar} 
            alt={ensData.name}
            style={{ 
              width: "40px", 
              height: "40px", 
              borderRadius: "50%", 
              border: "2px solid #0052FF",
              objectFit: "cover"
            }} 
          />
        ) : (
          <div style={{ 
            width: "40px", 
            height: "40px", 
            borderRadius: "50%", 
            background: "#0052FF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            fontWeight: "bold",
            color: "white"
          }}>
            {ensData.name[0].toUpperCase()}
          </div>
        )}
        
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "14px", color: "#fff", fontWeight: "600", marginBottom: "2px" }}>
            {ensData.name}
          </div>
          <div style={{ fontSize: "9px", color: "#666", wordBreak: "break-all" }}>
            {address.slice(0, 8)}...{address.slice(-6)}
          </div>
        </div>
      </div>

      {/* Description */}
      {ensData.description && (
        <p style={{ 
          fontSize: "11px", 
          color: "#aaa", 
          marginBottom: "10px",
          lineHeight: "1.4"
        }}>
          {ensData.description.slice(0, 100)}{ensData.description.length > 100 ? "..." : ""}
        </p>
      )}

      {/* Compact Social Links */}
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {ensData.twitter && (
          <a 
            href={`https://twitter.com/${ensData.twitter}`} 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ 
              padding: "5px 10px",
              background: "#1DA1F2",
              borderRadius: "6px",
              color: "white",
              textDecoration: "none",
              fontSize: "10px",
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
              padding: "5px 10px",
              background: "#333",
              borderRadius: "6px",
              color: "white",
              textDecoration: "none",
              fontSize: "10px",
              fontWeight: "600"
            }}
          >
            🌐 Site
          </a>
        )}

        <a 
          href={`https://app.ens.domains/${ensData.name}`} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            padding: "5px 10px",
            background: "#5298FF",
            borderRadius: "6px",
            color: "white",
            textDecoration: "none",
            fontSize: "10px",
            fontWeight: "600"
          }}
        >
          ENS Profile →
        </a>
      </div>
    </div>
  );
}
