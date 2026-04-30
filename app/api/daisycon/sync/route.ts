import { NextRequest, NextResponse } from "next/server";
import {
  fetchPublishers,
  fetchSubscriptions,
  fetchPrograms,
  fetchMaterialAds,
} from "@/lib/daisycon";

export async function GET(request: NextRequest) {
  const accessToken = request.cookies.get("daisycon_access_token")?.value;

  if (!accessToken) {
    return NextResponse.json({ error: "not_authenticated" }, { status: 401 });
  }

  try {
    // Stap 1: ontdek de publisher ID(s) van deze gekoppelde Daisycon account
    const publishers = await fetchPublishers(accessToken);
    if (publishers.length === 0) {
      return NextResponse.json(
        { error: "Geen publisher accounts gevonden onder deze login" },
        { status: 404 }
      );
    }
    const publisher = publishers[0];

    // Stap 2: parallel subscriptions, programs en ads ophalen
    const [subscriptions, programs, ads] = await Promise.all([
      fetchSubscriptions(accessToken, publisher.id),
      fetchPrograms(accessToken, publisher.id),
      fetchMaterialAds(accessToken, publisher.id),
    ]);

    // Maak een map van program_id → programma info
    const programMap = new Map(programs.map((p) => [p.id, p]));

    // Goedgekeurde program IDs
    const approvedIds = new Set(
      subscriptions
        .filter((s) => s.status === "approved")
        .map((s) => s.program_id)
    );

    // Kies per programma de eerste advertentie met een click_url
    const adsByProgram = new Map<number, string>();
    for (const ad of ads) {
      if (!adsByProgram.has(ad.program_id) && ad.click_url) {
        adsByProgram.set(ad.program_id, ad.click_url);
      }
    }

    const result = [...approvedIds]
      .map((programId) => {
        const program = programMap.get(programId);
        return {
          id: String(programId),
          name: program?.name ?? `Programma ${programId}`,
          logoUrl: program?.logo_url ?? "",
          description: "",
          categories: program?.categories ?? [],
          affiliateUrl: adsByProgram.get(programId) ?? "",
          commission: "",
          tags: [],
        };
      })
      .filter((p) => p.affiliateUrl);

    return NextResponse.json({
      partners: result,
      total: result.length,
      publisher: { id: publisher.id, name: publisher.name },
      stats: {
        subscriptions: subscriptions.length,
        approved: approvedIds.size,
        programs: programs.length,
        ads: ads.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Daisycon sync error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
