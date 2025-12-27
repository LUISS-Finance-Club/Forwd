// app/utils/nbaGames.ts

export type NbaMatch = {
  id: number;
  home: string;
  away: string;
  conference: string;
  homeOdds: number; // American-style *1000* so 2100 = +210
  awayOdds: number;
};

export const NBA_MATCH_DATA: Record<number, NbaMatch> = {
  101: {
    id: 101,
    home: "Los Angeles Lakers",
    away: "Golden State Warriors",
    conference: "Western Conference",
    homeOdds: 2100,
    awayOdds: 1900,
  },
  102: {
    id: 102,
    home: "Boston Celtics",
    away: "Milwaukee Bucks",
    conference: "Eastern Conference",
    homeOdds: 1800,
    awayOdds: 2200,
  },
  103: {
    id: 103,
    home: "Denver Nuggets",
    away: "Dallas Mavericks",
    conference: "Western Conference",
    homeOdds: 1950,
    awayOdds: 2050,
  },
  104: {
    id: 104,
    home: "New York Knicks",
    away: "Philadelphia 76ers",
    conference: "Eastern Conference",
    homeOdds: 2000,
    awayOdds: 2000,
  },
  105: {
    id: 105,
    home: "Phoenix Suns",
    away: "Minnesota Timberwolves",
    conference: "Western Conference",
    homeOdds: 1900,
    awayOdds: 2100,
  },
};
