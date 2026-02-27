import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { like, and, isNull } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("query");

        if (!query || query.length < 1) {
            return NextResponse.json([], { status: 200 });
        }

        try {
            const db = getDrizzleDb();

            // Search for alumni where userId is null (unclaimed) and name matches query
            const results = await db.select()
                .from(alumniProfiles)
                .where(
                    and(
                        isNull(alumniProfiles.userId),
                        like(alumniProfiles.fullName, `%${query}%`)
                    )
                )
                .all();

            console.log(`Search result for "${query}":`, results.length);
            return NextResponse.json(results);
        } catch (dbError) {
            console.warn("DB connection failed in API, using mock data:", dbError);
            const mockData = [
                { id: 14, fullName: "Gavli Mitesh", rollNumber: 14, email: "mitesh@example.com" },
                { id: 25, fullName: "Bhavik Parmar", rollNumber: 25, email: "bhavik@example.com" }
            ].filter(a => a.fullName.toLowerCase().includes(query.toLowerCase()));
            return NextResponse.json(mockData);
        }
    } catch (error: any) {
        console.error("Search API error:", error);
        return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
    }
}
