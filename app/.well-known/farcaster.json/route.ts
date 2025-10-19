export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://prestake-i8sxlvfos-yasos-projects-8d2ad919.vercel.app';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEzOTMwNzIsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHg5Q0FDOTBjNDcwRkE3OThBMjNCMzYxNTlkNjkwNDhCMTA1NzUxYTY4In0",
      payload: "eyJkb21haW4iOiJwcmVzdGFrZS1uYXZ5LnZlcmNlbC5hcHAifQ",
      signature: "F5IAfL/30qq4WojJHtxOX9WyH5PIBs0v6WSEOHC19zAPJGA3+Pdg6eyDfhduCqTqC+UjImNxhlu9PXgjOrToZRw="
    },
    frame: {
      version: "next",
      imageUrl: `${appUrl}/512-icon.png`,
      button: {
        title: "Launch PreStake",
        action: {
          type: "launch_frame",
          name: "PreStake",
          url: appUrl,
          splashImageUrl: `${appUrl}/512-icon.png`,
          splashBackgroundColor: "#0a0a0a",
        },
      },
    },
    miniapp: {
      name: "PreStake",
      description: "Privacy-first betting forwards marketplace with ENS integration",
      iconUrl: `${appUrl}/icon-192.png`,
      homeUrl: appUrl,
      splashImageUrl: `${appUrl}/512-icon.png`,
      splashBackgroundColor: "#0a0a0a",
      primaryCategory: "finance",
      subtitle: "Lock Odds, Trade Positions",
      tags: ["betting", "defi", "ens", "privacy", "trading"]
    }
  };

  return Response.json(manifest);
}
