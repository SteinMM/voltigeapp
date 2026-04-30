import { put, list } from "@vercel/blob";
import { Partner } from "./types";
import { partners as seedPartners } from "./partners";

const BLOB_PATHNAME = "partners.json";

/**
 * Haalt de partnerlijst op uit Vercel Blob.
 * Valt terug op seed data als Blob niet beschikbaar is of leeg is.
 */
export async function getPartners(): Promise<{
  partners: Partner[];
  source: "blob" | "seed";
}> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { partners: seedPartners, source: "seed" };
  }

  try {
    const result = await list({ prefix: BLOB_PATHNAME, limit: 1 });
    if (result.blobs.length === 0) {
      return { partners: seedPartners, source: "seed" };
    }

    const res = await fetch(result.blobs[0].url, { cache: "no-store" });
    if (!res.ok) return { partners: seedPartners, source: "seed" };

    const data = (await res.json()) as Partner[];
    if (!Array.isArray(data) || data.length === 0) {
      return { partners: seedPartners, source: "seed" };
    }
    return { partners: data, source: "blob" };
  } catch (err) {
    console.error("Blob read error:", err);
    return { partners: seedPartners, source: "seed" };
  }
}

/**
 * Slaat de partnerlijst op in Vercel Blob.
 * Overschrijft de bestaande lijst.
 */
export async function savePartners(partners: Partner[]) {
  const blob = await put(BLOB_PATHNAME, JSON.stringify(partners, null, 2), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
    allowOverwrite: true,
  });
  return blob;
}
