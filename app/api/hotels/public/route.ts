import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { hotels } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";

export const runtime = 'edge';

export async function GET() {
    try {
        const db = getDrizzleDb();
        const result = await db.select({
            id: hotels.id,
            name: hotels.hotelName, // Alias hotelName to name for frontend compat
        })
            .from(hotels)
            // .where(eq(hotels.isApproved, 1)) // Schema lacks isApproved?
            .orderBy(asc(hotels.hotelName))
            .all();

        return NextResponse.json({ data: result });
    } catch (error: any) {
        console.error("Fetch hotels error:", error);
        return NextResponse.json({ error: "Failed to fetch hotels" }, { status: 500 });
    }
}
