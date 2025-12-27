"use client";

import { useState, useEffect } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { formatEther } from "viem";
import ENSProfileCard from "./ENSProfileCard";
import { fetchLiveNbaMarkets } from "../utils/nbaGames";

export default function Marketplace() {
  const { address, isConnected } = useAccount();

  const [forSaleForwards, setForSaleForwards] = useState([]);
  const [buyingId, setBuyingId] = useState(null);

  const [nbaGames, setNbaGames] = useState({});
  const [loadingNba, setLoadingNba] = useState(true);

  const { data: allForwards } = useReadContract({
    address: CONTRACT_ADDRESS_V2,
    abi: CONTRACT_ABI_V2,
    functionName: "getAllForwards",
  });

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Load live NBA odds and index by numeric-ish id
  useEffect(() => {
    let cancelled = false;

    async function loadNba() {
      try {
        const markets = await fetchLiveNbaMarkets();
        if (cancelled) return;

        const byId = {};
        markets.forEach((m) => {
          // Derive a numeric-ish id for mapping, since contract matchId is numeric
          const numericId = Number(
            typeof m.id === "string" ? m.id.replace(/\D/g, "").slice(0, 6) : m.id
          );

          const homeOutcome = m.outcomes?.[0];
          const awayOutcome = m.outcomes?.[1];

          byId[numericId] = {
            home: m.homeTeam,
            away: m.awayTeam,
            homeOdds: homeOutcome ? Math.round(homeOutcome.price * 1000) : 0,
            awayOdds: awayOutcome ? Math.round(awayOutcome.price * 1000) : 0,
            conference: "NBA",
          };
        });

        setNbaGames(byId);
      } catch (e) {
        console.error("Failed to load NBA markets", e);
      } finally {
        if (!cancelled) setLoadingNba(false);
      }
    }

    loadNba();
    const id = setInterval(loadNba, 5000);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // Load forwards from chain
  useEffect(() => {
    let forwards = [];

    if (allForwards && allForwards.length > 0) {
      const realForwards = allForwards
        .map((forward, index) => ({ ...forward, id: index, isReal: true }))
        .filter(
          (f) =>
            f.isForSale &&
            f.owner !== "0x0000000000000000000000000000000000000000"
        );
      forwards = [...forwards, ...realForwards];
    }

    setForSaleForwards(forwards);
  }, [allForwards]);

  const buyForward = async (forwardId, premium, isReal) => {
    if (!isReal) {
      alert(
        "This forward is part of our marketplace showcase. Lock your own forward in the 'Lock' tab to create real tradable positions."
      );
      return;
    }

    try {
      await writeContract({
        address: CONTRACT_ADDRESS_V2,
        abi: CONTRACT_ABI_V2,
        functionName: "buyForward",
        args: [BigInt(forwardId)],
        value: BigInt(premium),
      });
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

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <h2>Marketplace ({forSaleForwards.length} available)</h2>
        <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
          🌐 Powered by ENS - Real names, real identities, real reputation
        </p>
      </div>

      {/* Educational block – keep your original content here */}
      <details
        style={{
          background: "#1a1a1a",
          padding: "15px",
          borderRadius: "12px",
          marginBottom: "20px",
          border: "1px solid #666",
          cursor: "pointer",
        }}
      >
        <summary
          style={{ fontWeight: "bold", color: "#0052FF", fontSize: "14px" }}
        >
          Why Buy Someone Else&apos;s Position?
        </summary>
        <div style={{ marginTop: "15px", paddingLeft: "10px" }}>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#ff4444", fontSize: "13px" }}>
              You Missed The Good Odds
            </strong>
            <p
              style={{
                color: "#888",
                fontSize: "12px",
                marginTop: "5px",
                marginBottom: 0,
              }}
            >
              vitalik.eth locked Galatasaray at 2.1x last week. Now odds
              dropped to 1.6x (team is favored). You can buy his locked 2.1x
              position for a premium instead of accepting market&apos;s worse
              1.6x.
            </p>
          </div>
          <div style={{ marginBottom: "15px" }}>
            <strong style={{ color: "#ffaa00", fontSize: "13px" }}>
              ENS = Reputation Layer
            </strong>
            <p
              style={{
                color: "#888",
                fontSize: "12px",
                marginTop: "5px",
                marginBottom: 0,
              }}
            >
              When you see vitalik.eth or brantly.eth selling, you know their
              reputation is on the line. ENS names become trading signals -
              follow the smart money!
            </p>
          </div>
          <div>
            <strong style={{ color: "#00ff00", fontSize: "13px" }}>
              What You&apos;re Learning
            </strong>
            <p
              style={{
                color: "#888",
                fontSize: "12px",
                marginTop: "5px",
                marginBottom: 0,
              }}
            >
              Secondary markets, liquidity, price discovery, and
              reputation-based trading - all enabled by ENS identity layer!
            </p>
          </div>
        </div>
      </details>

      {forSaleForwards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h3>No forwards for sale yet!</h3>
          <p style={{ color: "#888" }}>
            Lock a forward and list it to see it here
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {forSaleForwards.map((forward) => {
            const numericMatchId = Number(forward.matchId);
            const matchData = nbaGames[numericMatchId];

            let outcomeLabel = "Unknown";
            if (matchData) {
              if (
                Math.abs(Number(forward.lockedOdds) - matchData.homeOdds) < 50
              ) {
                outcomeLabel = matchData.home;
              } else if (
                Math.abs(Number(forward.lockedOdds) - matchData.awayOdds) < 50
              ) {
                outcomeLabel = matchData.away;
              }
            }

            const isOwnListing =
              forward.owner.toLowerCase() === address?.toLowerCase();

            return (
              <div
                key={forward.id}
                style={{
                  background: "#1a1a1a",
                  border: isOwnListing
                    ? "2px solid #0052FF"
                    : "1px solid #00ff00",
                  borderRadius: "12px",
                  padding: "20px",
                }}
              >
                {/* BADGES */}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {isOwnListing && (
                    <span
                      style={{
                        padding: "4px 10px",
                        background: "#0052FF",
                        color: "white",
                        borderRadius: "15px",
                        fontSize: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      YOUR LISTING
                    </span>
                  )}
                  <span
                    style={{
                      padding: "4px 10px",
                      background: "#00ff00",
                      color: "black",
                      borderRadius: "15px",
                      fontSize: "10px",
                      fontWeight: "bold",
                    }}
                  >
                    FOR SALE
                  </span>
                </div>

                {/* TOP: Outcome and Odds */}
                <div
                  style={{
                    marginBottom: "15px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid #333",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 5px 0",
                      fontSize: "18px",
                      color: "#fff",
                    }}
                  >
                    {outcomeLabel}{" "}
                    {(Number(forward.lockedOdds) / 1000).toFixed(2)}x
                  </h3>
                  <div style={{ fontSize: "11px", color: "#888" }}>
                    for {formatEther(forward.premium)} ETH
                  </div>
                </div>

                {/* FULL ENS PROFILE CARD */}
                <div style={{ marginBottom: "15px" }}>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#888",
                      marginBottom: "8px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    Trader Profile
                  </div>
                  <ENSProfileCard address={forward.owner} />
                </div>

                {/* MATCH INFO */}
                {matchData && (
                  <div
                    style={{
                      display: "grid",
                      gap: "8px",
                      marginBottom: "15px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#fff" }}>
                      {matchData.home} vs {matchData.away}
                    </div>
                    <div style={{ fontSize: "11px", color: "#0052FF" }}>
                      {matchData.conference}
                    </div>
                  </div>
                )}

                {/* BUY BUTTON */}
                {!isOwnListing ? (
                  buyingId === forward.id ? (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        onClick={() =>
                          buyForward(forward.id, forward.premium, forward.isReal)
                        }
                        disabled={isPending || isConfirming}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background:
                            isPending || isConfirming ? "#666" : "#00ff00",
                          color:
                            isPending || isConfirming ? "white" : "black",
                          border: "none",
                          borderRadius: "8px",
                          cursor:
                            isPending || isConfirming
                              ? "not-allowed"
                              : "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        {isPending
                          ? "Confirming..."
                          : isConfirming
                          ? "Processing..."
                          : "Confirm Purchase"}
                      </button>
                      <button
                        onClick={() => setBuyingId(null)}
                        style={{
                          flex: 1,
                          padding: "12px",
                          background: "#666",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: "bold",
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setBuyingId(forward.id)}
                      style={{
                        width: "100%",
                        padding: "12px",
                        background: "#00ff00",
                        color: "black",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      Buy for {formatEther(forward.premium)} ETH
                    </button>
                  )
                ) : (
                  <div
                    style={{
                      padding: "12px",
                      background: "#2a2a2a",
                      borderRadius: "8px",
                      textAlign: "center",
                      color: "#888",
                      fontSize: "12px",
                    }}
                  >
                    Your listing - go to &quot;My Forwards&quot; to manage
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loadingNba && (
        <div style={{ marginTop: "10px", fontSize: "11px", color: "#888" }}>
          Loading live NBA markets…
        </div>
      )}
    </div>
  );
}
