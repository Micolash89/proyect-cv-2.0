import { NextResponse } from "next/server";

const googleAuthUrl = "https://accounts.google.com/o/oauth2/v2/auth";

export async function GET() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = process.env.NODE_ENV === "production" 
    ? process.env.GOOGLE_REDIRECT_URI_PRODUCTION 
    : process.env.GOOGLE_REDIRECT_URI;

  const scope = [
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile",
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId || "",
    redirect_uri: redirectUri || "",
    response_type: "code",
    scope,
    access_type: "offline",
    prompt: "consent",
  });

  const url = `${googleAuthUrl}?${params.toString()}`;

  return NextResponse.redirect(url);
}
