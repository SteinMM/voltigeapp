import { NextRequest, NextResponse } from "next/server";
import { generatePKCE, AUTH_URL, TOKEN_URL, getRedirectUri } from "@/lib/daisycon";

export async function GET(request: NextRequest) {
  const clientId = process.env.DAISYCON_CLIENT_ID;
  const clientSecret = process.env.DAISYCON_CLIENT_SECRET;
  const redirectUri = getRedirectUri(request.url);

  const { challenge } = generatePKCE();
  const authorizeParams = new URLSearchParams({
    response_type: "code",
    client_id: clientId ?? "MISSING",
    redirect_uri: redirectUri,
    code_challenge: challenge,
    code_challenge_method: "S256",
  });

  return NextResponse.json(
    {
      env: {
        client_id_set: !!clientId,
        client_id_preview: clientId
          ? `${clientId.slice(0, 8)}...${clientId.slice(-4)}`
          : null,
        client_secret_set: !!clientSecret,
        client_secret_length: clientSecret?.length ?? 0,
        blob_token_set: !!process.env.BLOB_READ_WRITE_TOKEN,
      },
      request: {
        url: request.url,
        host: new URL(request.url).host,
        protocol: new URL(request.url).protocol,
      },
      oauth: {
        redirect_uri_we_send: redirectUri,
        important_note: "Deze EXACT moet in Daisycon staan onder 'Geauthoriseerde redirect URI'",
        authorize_url: `${AUTH_URL}?${authorizeParams}`,
        token_url: TOKEN_URL,
      },
      cookies: {
        has_pkce_verifier: !!request.cookies.get("daisycon_pkce_verifier"),
        has_access_token: !!request.cookies.get("daisycon_access_token"),
      },
    },
    { status: 200 }
  );
}
