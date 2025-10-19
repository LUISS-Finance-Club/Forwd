export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://prestake-i8sxlvfos-yasos-projects-8d2ad919.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEyMzQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgxMjM0In0",
      payload: "eyJkb21haW4iOiJwcmVzdGFrZS52ZXJjZWwuYXBwIn0",
      signature: "MHhhYmNkZWY"
    },
    frame: {
      version: "next",
      imageUrl: `${appUrl}/hero.png`,
      button: {
        title: "Launch PreStake",
        action: {
          type: "launch_frame",
          name: "PreStake",
          url: appUrl,
          splashImageUrl: `${appUrl}/icon-512.png`,
          splashBackgroundColor: "#0a0a0a",
        },
      },
    },
    miniapp: {
      name: "PreStake",
      description: "Privacy-first betting forwards marketplace with ENS integration",
      iconUrl: `${appUrl}/icon-192.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/icon-512.png`,
      splashBackgroundColor: "#0a0a0a",
      primaryCategory: "finance",
      subtitle: "Lock Odds, Trade Positions",
      tags: ["betting", "defi", "ens", "privacy", "trading"]
    }
  };

  return Response.json(manifest);
}
