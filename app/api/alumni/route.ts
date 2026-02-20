import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { like, or, asc, sql } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);
    const offset = parseInt(searchParams.get("offset") || "0");

    try {
        const db = getDrizzleDb();

        let query = db.select({
            id: alumniProfiles.id,
            rollNumber: alumniProfiles.rollNumber,
            fullName: alumniProfiles.fullName,
            city: alumniProfiles.city,
            country: alumniProfiles.country,
            specialization: alumniProfiles.specialization,
            profilePhotoUrl: alumniProfiles.profilePhotoUrl,
            rsvpAdults: alumniProfiles.rsvpAdults,
        })
            .from(alumniProfiles)
            .$dynamic();

        if (search) {
            const searchPattern = `%${search}%`;
            query = query.where(
                or(
                    like(alumniProfiles.fullName, searchPattern),
                    like(alumniProfiles.city, searchPattern),
                    like(alumniProfiles.specialization, searchPattern),
                    sql`CAST(${alumniProfiles.rollNumber} AS TEXT) LIKE ${searchPattern}`
                )
            );
        }

        const data = await query
            .orderBy(asc(alumniProfiles.fullName))
            .limit(limit)
            .offset(offset)
            .all();

        return NextResponse.json({ data });
    } catch (e: any) {
        console.error("Alumni fetch error:", e);
        return NextResponse.json({ error: "Failed to fetch alumni", details: e.message }, { status: 500 });
    }
}
