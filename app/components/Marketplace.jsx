"use client";
import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract } from "wagmi";
import { CONTRACT_ADDRESS_V2, CONTRACT_ABI_V2 } from "../utils/contractV2";
import { formatEther } from "viem";
import ENSProfile from './ENSProfile';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

const ensClient = createPublicClient({
  chain: mainnet,
  transport: http('https://eth.llamarpc.com')
});

const DUMMY_FORWARDS = [
  { id: 101, matchId: 10, homeTeam: "Fenerbahçe", awayTeam: "Galatasaray", outcome: "Home Win", lockedOdds: 2100, premium: "15000000000000000", owner: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", ensName: "vitalik.eth", isForSale: true, league: "Süper Lig", date: "Oct 26, 2025" },
  { id: 102, matchId: 11, homeTeam: "Beşiktaş", awayTeam: "Trabzonspor", outcome: "Draw", lockedOdds: 3200, premium: "20000000000000000", owner: "0x983110309620D911731Ac0932219af06091b6744", ensName: "brantly.eth", isForSale: true, league: "Süper Lig", date: "Oct 27, 2025" },
  { id: 103, matchId: 12, homeTeam: "AS Roma", awayTeam: "Lazio", outcome: "Away Win", lockedOdds: 1850, premium: "25000000000000000", owner: "0x225f137127d9067788314bc7fcc1f36746a3c3B5", ensName: "lido.eth", isForSale: true, league: "Serie A - Derby della Capitale", date: "Oct 28, 2025" },
  { id: 104, matchId: 13, homeTeam: "Juventus", awayTeam: "Inter Milan", outcome: "Home Win", lockedOdds: 1950, premium: "30000000000000000", owner: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", ensName: "vitalik.eth", isForSale: true, league: "Serie A - Derby d'Italia", date: "Oct 29, 2025" },
  { id: 105, matchId: 14, homeTeam: "Fenerbahçe", awayTeam: "Beşiktaş", outcome: "Draw", lockedOdds: 3400, premium: "18000000000000000", owner: "0x983110309620D911731Ac0932219af06091b6744", ensName: "brantly.eth", isForSale: true, league: "Süper Lig - Intercontinental Derby", date: "Oct 30, 2025" },
  { id: 106, matchId: 15, homeTeam: "AC Milan", awayTeam: "Napoli", outcome: "Away Win", lockedOdds: 2250, premium: "22000000000000000", owner: "0x225f137127d9067788314bc7fcc1f36746a3c3B5", ensName: "lido.eth", isForSale: true, league: "Serie A", date: "Oct 31, 2025" },
  { id: 107, matchId: 16, homeTeam: "Galatasaray", awayTeam: "Trabzonspor", outcome: "Home Win", lockedOdds: 1650, premium: "28000000000000000", owner: "0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045", ensName: "vitalik.eth", isForSale: true, league: "Süper Lig", date: "Nov 1, 2025" },
  { id: 108, matchId: 17, homeTeam: "Atalanta", awayTeam: "Fiorentina", outcome: "Home Win", lockedOdds: 1780, premium: "19000000000000000", owner: "0x983110309620D911731Ac0932219af06091b6744", ensName: "brantly.eth", isForSale: true, league: "Serie A", date: "Nov 2, 2025" }
];

export default function Marketplace() {
  const { address, isConnected } = useAccount();
  const [forSaleForwards, setForSaleForwards] = useState([]);
  const [filteredForwards, setFilteredForwards] = useState([]);
  const [searchENS, setSearchENS] = useState('');
  const [showDummyData, setShowDummyData] = useState(true);
  
  const { data: allForwards } = useReadContract({
    address: CONTRACT_ADDRESS_V2,
    abi: CONTRACT_ABI_V2,
    functionName: "getAllForwards",
  });

  const { writeContract } = useWriteContract();

  useEffect(() => {
    let forwards = [];
    
    if (allForwards && allForwards.length > 0) {
      const realForwards = allForwards
        .map((forward, index) => ({ ...forward, id: index, isDummy: false }))
        .filter(f => f.isForSale && f.owner !== '0x0000000000000000000000000000000000000000'); // ⬅️ ADD THIS FILTER
      forwards = [...forwards, ...realForwards];
    }
    
    if (showDummyData) {
      forwards = [...forwards, ...DUMMY_FORWARDS.map(f => ({ ...f, isDummy: true }))];
    }
    
    setForSaleForwards(forwards);
    setFilteredForwards(forwards);
  }, [allForwards, showDummyData]);


  useEffect(() => {
    if (!searchENS) {
      setFilteredForwards(forSaleForwards);
      return;
    }
    
    const search = searchENS.toLowerCase();
    const filtered = forSaleForwards.filter(forward => {
      if (forward.owner.toLowerCase().includes(search)) return true;
      if (forward.ensName && forward.ensName.toLowerCase().includes(search)) return true;
      if (forward.homeTeam && forward.homeTeam.toLowerCase().includes(search)) return true;
      if (forward.awayTeam && forward.awayTeam.toLowerCase().includes(search)) return true;
      if (forward.outcome && forward.outcome.toLowerCase().includes(search)) return true;
      return false;
    });
    
    setFilteredForwards(filtered);
  }, [searchENS, forSaleForwards]);

  const buyForward = async (forwardId, premium, isDummy) => {
    if (isDummy) {
      alert("⚠️ This is demo data! Deploy real forwards in the 'Lock Forward' tab.");
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
      alert(`Forward #${forwardId} purchased!`);
      setTimeout(() => window.location.reload(), 3000);
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <h2>🛒 Marketplace ({forSaleForwards.length} available)</h2>
      </div>

      {/* 🎓 EDUCATIONAL: WHY BUY OTHERS' POSITIONS */}
      {/* Educational: Why Buy Others' Positions - COLLAPSIBLE */}
      <details style={{ background: "#1a1a1a", padding: "12px", borderRadius: "10px", marginBottom: "20px", border: "1px solid #666", cursor: "pointer" }}>
        <summary style={{ fontWeight: "bold", color: "#0052FF", fontSize: "12px" }}>
          Why Buy Someone Else's Position?
        </summary>
        <div style={{ marginTop: "12px", paddingLeft: "8px" }}>
          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#00ff00", fontSize: "10px" }}>You Missed The Good Odds</strong>
            <p style={{ color: "#888", fontSize: "9px", marginTop: "4px", marginBottom: 0 }}>
              vitalik.eth locked Galatasaray at 2.1x last week. Now odds dropped to 1.6x (team is favored). You can buy his locked 2.1x position for a premium instead of accepting market's worse 1.6x.
            </p>
          </div>
          <div style={{ marginBottom: "12px" }}>
            <strong style={{ color: "#0052FF", fontSize: "10px" }}>Real-World: Stock Trading</strong>
            <p style={{ color: "#888", fontSize: "9px", marginTop: "4px", marginBottom: 0 }}>
              This is exactly how stock markets work! Someone bought Apple at $100, now it's $150. You buy their shares at $150 (current market price). They profit $50, you get exposure to Apple's future growth.
            </p>
          </div>
          <div>
            <strong style={{ color: "#00ff00", fontSize: "10px" }}>What You're Learning:</strong>
            <p style={{ color: "#888", fontSize: "9px", marginTop: "4px", marginBottom: 0 }}>
              <strong>Secondary markets, liquidity, price discovery</strong> - core finance concepts. Wall Street traders do this with bonds, commodities, and derivatives every day!
            </p>
          </div>
        </div>
      </details>


      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="🔍 Search: vitalik.eth, team names, or 0x address..."
          value={searchENS}
          onChange={(e) => setSearchENS(e.target.value)}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '12px',
            border: '1px solid #333',
            background: '#1a1a1a',
            color: 'white',
            fontSize: '16px'
          }}
        />
        {searchENS && (
          <p style={{ fontSize: '14px', color: '#888', marginTop: '8px' }}>
            Found {filteredForwards.length} forward(s) matching "{searchENS}"
          </p>
        )}
      </div>

      {filteredForwards.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <h2>🛒 {searchENS ? 'No forwards match your search' : 'No forwards for sale yet!'}</h2>
          <p>{searchENS ? 'Try a different search term' : 'Enable demo data or create your own'}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {filteredForwards.map((forward) => {
            const isOwnForward = forward.owner.toLowerCase() === address?.toLowerCase();
            
            return (
              <div
                key={forward.id}
                style={{
                  background: "#1a1a1a",
                  border: isOwnForward ? "2px solid #0052FF" : forward.isDummy ? "1px solid #666" : "1px solid #00ff00",
                  borderRadius: "12px",
                  padding: "20px",
                  opacity: forward.isDummy ? 0.9 : 1
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                  <div>
                    <h3 style={{ fontSize: "18px", margin: "0 0 5px 0" }}>
                      {forward.isDummy ? `${forward.homeTeam} vs ${forward.awayTeam}` : `Forward #${forward.id}`}
                    </h3>
                    {forward.isDummy && (
                      <div style={{ fontSize: "11px", color: "#0052FF", marginBottom: "5px" }}>
                        {forward.league} • {forward.date}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {forward.isDummy && (
                      <span style={{
                        padding: "4px 10px",
                        background: "#666",
                        color: "white",
                        borderRadius: "15px",
                        fontSize: "10px",
                        fontWeight: "bold"
                      }}>
                        📊 DEMO
                      </span>
                    )}
                    {isOwnForward && (
                      <span style={{
                        padding: "4px 10px",
                        background: "#0052FF",
                        color: "white",
                        borderRadius: "15px",
                        fontSize: "10px",
                        fontWeight: "bold"
                      }}>
                        👤 YOUR LISTING
                      </span>
                    )}
                    <span style={{
                      padding: "4px 10px",
                      background: "#00ff00",
                      color: "black",
                      borderRadius: "15px",
                      fontSize: "10px",
                      fontWeight: "bold"
                    }}>
                      FOR SALE
                    </span>
                  </div>
                </div>
                
                <div style={{ display: "grid", gap: "10px" }}>
                  {forward.isDummy && (
                    <p>🎯 <strong>Bet:</strong> {forward.outcome}</p>
                  )}
                  {!forward.isDummy && (
                    <p>⚽ <strong>Match ID:</strong> {forward.matchId?.toString()}</p>
                  )}
                  <p>📊 <strong>Locked Odds:</strong> {(Number(forward.lockedOdds) / 1000).toFixed(2)}x</p>
                  <p>💰 <strong>Price:</strong> {formatEther(BigInt(forward.premium))} ETH</p>
                  
                  <div style={{ marginTop: '10px' }}>
                    <strong style={{ display: 'block', marginBottom: '8px' }}>
                      👤 Seller: {forward.ensName && <span style={{ color: '#0052FF' }}>({forward.ensName})</span>}
                    </strong>
                    <ENSProfile address={forward.owner} />
                  </div>
                </div>

                {isOwnForward ? (
                  <div style={{
                    width: "100%",
                    marginTop: "20px",
                    padding: "15px",
                    background: "#333",
                    borderRadius: "8px",
                    textAlign: "center",
                    color: "#888",
                    fontSize: "14px"
                  }}>
                    📝 This is your listing - Go to "My Forwards" to cancel
                  </div>
                ) : (
                  <button
                    onClick={() => buyForward(forward.id, forward.premium, forward.isDummy)}
                    style={{
                      width: "100%",
                      marginTop: "20px",
                      padding: "15px",
                      background: forward.isDummy ? "#666" : "#0052FF",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: "bold",
                      fontSize: "16px"
                    }}
                  >
                    {forward.isDummy ? "📊 Demo Forward" : `🛒 Buy for ${formatEther(BigInt(forward.premium))} ETH`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
