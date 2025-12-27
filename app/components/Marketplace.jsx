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
  const [forSaleForwards, setForSaleForwards] = useState<any[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const [nbaGames, setNbaGames] = useState<Record<number, any>>({});
  const [loadingNba, setLoadingNba] = useState(true);

  const { data: allForwards } = useReadContract({
    address: CONTRACT_ADDRESS_V2,
    abi: CONTRACT_ABI_V2,
    functionName: "getAllForwards",
  });

  const { data: hash, writeContract, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({ hash });

  // Load live NBA odds and index by numeric id
  useEffect(() => {
    let cancelled = false;

    async function loadNba() {
      try {
        const markets = await fetchLiveNbaMarkets();
        if (cancelled) return;

        const byId: Record<number, any> = {};
        markets.forEach((m) => {
          // forward.matchId is numeric in your contract demo;
          // here we just coerce the API id to a number hash for mapping.
          const numericId = Number(
            typeof m.id === "string" ? m.id.replace(/\D/g, "").slice(0, 6) : m.id
          );

          const homeOutcome = m.outcomes[0];
          const awayOutcome = m.outcomes[1];

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
    let forwards: any[] = [];

    if (allForwards && (allForwards as any[]).length > 0) {
      const realForwards = (allForwards as any[])
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

  const buyForward = async (
    forwardId: number,
    premium: string,
    isReal: boolean
  ) => {
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
    } catch (error: any) {
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

      {/* Educational */}
      {/* … keep your existing <details> block unchanged … */}

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
                {/* badges, top section, ENSProfileCard remain the same */}

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

                {/* buy button section unchanged, just calls buyForward */}
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
