const ROOT_URL = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';

export const minikitConfig = {
  accountAssociation: {
    "header": "eyJmaWQiOjEzOTMwNzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg5Q0FDOTBjNDcwRkE3OThBMjNCMzYxNTlkNjkwNDhCMTA1NzUxYTY4In0",
    "payload": "eyJkb21haW4iOiJwcmVzdGFrZS1uYXZ5LnZlcmNlbC5hcHAifQ",
    "signature": "F5IAfL/30qq4WojJHtxOX9WyH5PIBs0v6WSEOHC19zAPJGA3+Pdg6eyDfhduCqTqC+UjImNxhlu9PXgjOrToZRw="
  },
  miniapp: {
    version: "1",
    name: "PreStake",
    subtitle: "Privacy-First Betting Forwards",
    description: "Lock betting odds now, bet later with privacy",
    screenshotUrls: [`${ROOT_URL}/512-icon.png`],
    iconUrl: `${ROOT_URL}/icon-192.png`,
    splashImageUrl: `${ROOT_URL}/512-icon.png`,
    splashBackgroundColor: "#0a0a0a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "games",
    tags: ["betting", "privacy", "defi", "ens", "iexec"],
    heroImageUrl: `${ROOT_URL}/512-icon.png`,
    tagline: "Privacy-First Betting",
    ogTitle: "PreStake - Lock Odds, Bet Later",
    ogDescription: "Privacy-focused betting forwards marketplace with ENS integration",
    ogImageUrl: `${ROOT_URL}/512-icon.png`,
  },
} as const;
