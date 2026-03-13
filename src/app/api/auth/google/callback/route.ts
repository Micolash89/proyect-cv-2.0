import { NextResponse } from "next/server";

const tokenUrl = "https://oauth2.googleapis.com/token";
const userInfoUrl = "https://www.googleapis.com/oauth2/v2/userinfo";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/registro?error=no_code", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.NODE_ENV === "production" 
    ? process.env.GOOGLE_REDIRECT_URI_PRODUCTION 
    : process.env.GOOGLE_REDIRECT_URI;

  try {
    const tokenResponse = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId || "",
        client_secret: clientSecret || "",
        redirect_uri: redirectUri || "",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenData.access_token) {
      return NextResponse.redirect(new URL("/registro?error=token_failed", request.url));
    }

    const userInfoResponse = await fetch(userInfoUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userInfo = await userInfoResponse.json();

    const params = new URLSearchParams({
      name: userInfo.name || "",
      email: userInfo.email || "",
      picture: userInfo.picture || "",
    });

    const encodedData = Buffer.from(JSON.stringify({
      name: userInfo.name || "",
      email: userInfo.email || "",
      picture: userInfo.picture || "",
    })).toString("base64");

    return NextResponse.redirect(
      new URL(`/registro?google_data=${encodedData}`, request.url)
    );
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/registro?error=oauth_failed", request.url));
  }
}
