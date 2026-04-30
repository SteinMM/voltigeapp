import crypto from "crypto";

export const PUBLISHER_ID = "419930";
export const AUTH_URL = "https://login.daisycon.com/oauth/authorize";
export const TOKEN_URL = "https://login.daisycon.com/oauth/access-token";
export const API_BASE = "https://services.daisycon.com";

export function generatePKCE() {
  const verifier = crypto.randomBytes(32).toString("base64url");
  const challenge = crypto
    .createHash("sha256")
    .update(verifier)
    .digest("base64url");
  return { verifier, challenge };
}

export function getRedirectUri(requestUrl: string) {
  const url = new URL(requestUrl);
  return `${url.protocol}//${url.host}/api/daisycon/callback`;
}

export async function exchangeCodeForToken(
  code: string,
  verifier: string,
  redirectUri: string
) {
  // Daisycon PKCE browser flow: client_secret moet leeg zijn maar wel aanwezig in body.
  // Bron: github.com/DaisyconBV/oauth-examples/Javascript/example.js
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      client_id: (process.env.DAISYCON_CLIENT_ID ?? "").trim(),
      client_secret: "",
      redirect_uri: redirectUri,
      code_verifier: verifier,
    }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Token exchange failed (${res.status}): ${text}`);
  return JSON.parse(text) as { access_token: string; refresh_token?: string; expires_in?: number };
}

export async function fetchSubscriptions(accessToken: string) {
  const res = await fetch(
    `${API_BASE}/publishers/${PUBLISHER_ID}/subscriptions?filter_subscription_status=approved`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Subscriptions failed: ${await res.text()}`);
  return res.json() as Promise<DaisyconSubscription[]>;
}

export async function fetchMaterialAds(accessToken: string, programId?: string) {
  const params = new URLSearchParams({
    filter_subscribed_only: "true",
    placeholder_url_media_id: PUBLISHER_ID,
    paginator_per: "100",
  });
  if (programId) params.set("filter_program_ids", programId);

  const res = await fetch(
    `${API_BASE}/publishers/${PUBLISHER_ID}/material/ads?${params}`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Material ads failed: ${await res.text()}`);
  return res.json() as Promise<DaisyconAd[]>;
}

export async function fetchPrograms(accessToken: string) {
  const res = await fetch(
    `${API_BASE}/publishers/${PUBLISHER_ID}/programs?paginator_per=100`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );
  if (!res.ok) throw new Error(`Programs failed: ${await res.text()}`);
  return res.json() as Promise<DaisyconProgram[]>;
}

export interface DaisyconSubscription {
  program_id: number;
  media_id: number;
  status: string;
  approval_date: string;
}

export interface DaisyconProgram {
  id: number;
  name: string;
  url: string;
  logo_url?: string;
  categories?: string[];
}

export interface DaisyconAd {
  id: number;
  adgroup_id: number;
  program_id: number;
  type: string;
  click_url: string;
  content?: string;
  width?: number;
  height?: number;
}
