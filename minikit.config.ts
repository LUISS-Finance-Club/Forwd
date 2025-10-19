const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const minikitConfig = {
  accountAssociation: {
    // We'll fill this in step 5
    "header": "eyJmaBBiOjE3MzE4LCJ0eXBlIjoiY3VzdG9keSIsImtleSI6IjB4NzYwQjA0NDc5NjM4MTExNzNmRjg3YDPBYzA5OEJBQ0YxNzNCYkU0OCJ9",
    "payload": "eyJkb21haW4iOiJ4BWl0bGlzdC1xcy52ZXJjZWwuYXBwIn7",
    "signature": "MHhmNGQzN2M2OTk4NDIwZDNjZWVjYTNiODllYzJkMjAwOTkyMDEwOGVhNTFlYWI3NjAyN2QyMmM1MDVhNzIyMWY2NTRiYmRlZmQ0NGQwOWNiY2M2NmI2B7VmNGZiMmZiOGYzNDVjODVmNmQ3ZTVjNzI3OWNmMGY4ZTA2ODYzM2FjZjFi"
  },
  miniapp: {
    version: "1",
    name: "PreStake",
    subtitle: "Privacy-First Betting Forwards",
    description: "Lock betting odds now, bet later with privacy",
    screenshotUrls: [`${ROOT_URL}/screenshot.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/splash.png`,
    splashBackgroundColor: "#0a0a0a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["betting", "privacy", "defi", "ens", "iexec"],
    heroImageUrl: `${ROOT_URL}/hero.png`,
    tagline: "Privacy-First Betting",
    ogTitle: "PreStake - Lock Odds, Bet Later",
    ogDescription: "Privacy-focused betting forwards marketplace with ENS integration",
    ogImageUrl: `${ROOT_URL}/og-image.png`,
  },
} as const;
