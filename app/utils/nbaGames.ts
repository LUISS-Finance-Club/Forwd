export type NbaMarket = {
  id: string;
  homeTeam: string;
  awayTeam: string;
  commenceTime: string;
  outcomes: {
    name: string;     // team name
    price: number;    // decimal odds
  }[];
};

export async function fetchLiveNbaMarkets(): Promise<NbaMarket[]> {
  const res = await fetch('/api/odds/nba', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch NBA odds');
  const { markets } = await res.json();
  return markets as NbaMarket[];
}
