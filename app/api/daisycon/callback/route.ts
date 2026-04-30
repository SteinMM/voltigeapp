import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getRedirectUri } from "@/lib/daisycon";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/admin?error=${error ?? "no_code"}`, request.url)
    );
  }

  const verifier = request.cookies.get("daisycon_pkce_verifier")?.value;
  if (!verifier) {
    return NextResponse.redirect(new URL("/admin?error=no_verifier", request.url));
  }

  try {
    const token = await exchangeCodeForToken(code, verifier, getRedirectUri(request.url));

    const response = NextResponse.redirect(new URL("/admin?connected=1", request.url));

    response.cookies.set("daisycon_access_token", token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: token.expires_in ?? 3600,
      path: "/",
    });

    if (token.refresh_token) {
      response.cookies.set("daisycon_refresh_token", token.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 dagen
        path: "/",
      });
    }

    response.cookies.delete("daisycon_pkce_verifier");
    return response;
  } catch (err) {
    console.error("Daisycon token exchange error:", err);
    return NextResponse.redirect(new URL("/admin?error=token_failed", request.url));
  }
}
