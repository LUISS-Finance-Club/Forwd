export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
  
  const manifest = {
    accountAssociation: {
      header: "eyJmaWQiOjEyMzQsInR5cGUiOiJjdXN0b2R5Iiwia2V5IjoiMHgxMjM0In0",
      payload: "eyJkb21haW4iOiJwcmVzdGFrZS52ZXJjZWwuYXBwIn0",
      signature: "MHg..."
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
          splashImageUrl: `${appUrl}/splash.png`,
          splashBackgroundColor: "#0a0a0a",
        },
      },
    },
  };

  return Response.json(manifest);
}
