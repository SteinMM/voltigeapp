import { NextRequest, NextResponse } from "next/server";
import { generatePKCE, AUTH_URL, getRedirectUri } from "@/lib/daisycon";

export async function GET(request: NextRequest) {
  const { verifier, challenge } = generatePKCE();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.DAISYCON_CLIENT_ID!,
    redirect_uri: getRedirectUri(request.url),
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  const response = NextResponse.redirect(`${AUTH_URL}?${params}`);

  // Sla verifier op in cookie voor gebruik in callback
  response.cookies.set("daisycon_pkce_verifier", verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600, // 10 minuten
    path: "/",
  });

  return response;
}
