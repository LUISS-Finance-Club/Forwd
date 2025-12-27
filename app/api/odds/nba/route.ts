import { NextResponse } from 'next/server';

const ODDS_API_KEY = process.env.ODDS_API_KEY!;
const ODDS_API_BASE_URL =
  process.env.ODDS_API_BASE_URL ?? 'https://api.the-odds-api.com/v4';

export async function GET() {
  try {
    const url = new URL(
      `${ODDS_API_BASE_URL}/sports/basketball_nba/odds`
    );
    url.searchParams.set('apiKey', ODDS_API_KEY);
    url.searchParams.set('regions', 'us');          // sportsbooks region
    url.searchParams.set('markets', 'h2h');         // moneyline only for now
    url.searchParams.set('oddsFormat', 'decimal');

    const res = await fetch(url.toString(), { cache: 'no-store' });
    if (!res.ok) {
      const text = await res.text();
      console.error('Odds API error', res.status, text);
      return NextResponse.json({ error: 'odds_api_error' }, { status: 500 });
    }

    const raw = await res.json();

    const markets = raw.map((game: any) => {
      const h2h = game.bookmakers?.[0]?.markets?.find(
        (m: any) => m.key === 'h2h'
      );

      return {
        id: game.id,
        homeTeam: game.home_team,
        awayTeam: game.away_team,
        commenceTime: game.commence_time,
        outcomes: h2h?.outcomes ?? [],
      };
    });

    return NextResponse.json({ markets });
  } catch (err) {
    console.error('GET /api/odds/nba failed', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
