import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { savePartners } from "@/lib/storage";
import { Partner } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const partners = body.partners as Partner[];

    if (!Array.isArray(partners)) {
      return NextResponse.json({ error: "partners moet een array zijn" }, { status: 400 });
    }

    const blob = await savePartners(partners);
    revalidatePath("/");

    return NextResponse.json({
      ok: true,
      count: partners.length,
      url: blob.url,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error";
    console.error("Save partners error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
