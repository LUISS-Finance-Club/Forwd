const ROOT_URL =
  process.env.NEXT_PUBLIC_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000');

/**
 * MiniApp configuration object. Must follow the Farcaster MiniApp specification.
 * Updated with account association credentials for PreStake.
 *
 * @see {@link https://miniapps.farcaster.xyz/docs/guides/publishing}
 */
export const minikitConfig = {
  accountAssociation: {
    header: "eyJmaWQiOjEzOTE1MjAsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHhGZUQwN2FCODM5MDgwYTg1MjE4NTVGMmJhNGVGMzcwQjFBN0JhNTRiIn0",
    payload: "eyJkb21haW4iOiJuZXctbWluaS1hcHAtcXVpY2tzdGFydC1wbHVtLnZlcmNlbC5hcHAifQ",
    signature: "7mPrmSnwBh/GsuntNKgPT88pxn/fILjZCJofAyBNCMJ4G7QPuijkjMW4tdo6WzUtxBadxtaioQsmHwSIttXCfhs="
  },
  miniapp: {
    version: "1",
    name: "PreStake", 
    subtitle: "Sports Finance Platform", 
    description: "Transform sports betting into financial markets. Lock odds early, trade positions.",
    screenshotUrls: [`${ROOT_URL}/screenshot-portrait.png`],
    iconUrl: `${ROOT_URL}/icon.png`,
    splashImageUrl: `${ROOT_URL}/hero.png`,
    splashBackgroundColor: "#1a1a1a",
    homeUrl: ROOT_URL,
    webhookUrl: `${ROOT_URL}/api/webhook`,
    primaryCategory: "finance",
    tags: ["sports", "trading", "defi", "betting", "base"],
    heroImageUrl: `${ROOT_URL}/hero.png`, 
    tagline: "Trade Sports Odds Like Markets",
    ogTitle: "PreStake - Sports Finance",
    ogDescription: "Lock odds early, trade positions. Ethical DeFi betting on Base.",
    ogImageUrl: `${ROOT_URL}/hero.png`,
  },
} as const;

