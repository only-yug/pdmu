import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { like, or, eq, asc, sql } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search");
  const id = searchParams.get("id");

  if (!search && !id) {
    return NextResponse.json({ data: [] });
  }

  try {
    const db = getDrizzleDb();

    // Public-safe fields only (no email, phone, etc.)
    const selectFields = {
      id: alumniProfiles.id,
      rollNumber: alumniProfiles.rollNumber,
      fullName: alumniProfiles.fullName,
      city: alumniProfiles.city,
      country: alumniProfiles.country,
      specialization: alumniProfiles.specialization,
      profilePhotoUrl: alumniProfiles.profilePhotoUrl,
    };

    if (id) {
      const result = await db.select(selectFields)
        .from(alumniProfiles)
        .where(eq(alumniProfiles.id, Number(id)))
        .get();

      return NextResponse.json({ data: result ? [result] : [] });
    }

    // Search by name or roll number
    const searchPattern = `%${search}%`;
    const results = await db.select(selectFields)
      .from(alumniProfiles)
      .where(
        or(
          like(alumniProfiles.fullName, searchPattern),
          sql`CAST(${alumniProfiles.rollNumber} AS TEXT) LIKE ${searchPattern}`
        )
      )
      .orderBy(asc(alumniProfiles.fullName))
      .limit(10)
      .all();

    return NextResponse.json({ data: results });
  } catch (e: any) {
    console.error("Public alumni fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch alumni", details: e.message }, { status: 500 });
  }
}
