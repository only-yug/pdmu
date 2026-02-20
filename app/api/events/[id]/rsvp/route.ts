import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = await params;  // eventId — kept for future use when eventRegistrations is re-added
        const body = await req.json() as Record<string, any>;
        const { adults, kids, hotelId, specialReqs } = body;

        const db = getDrizzleDb();

        // Update Profile with RSVP details
        // eventRegistrations table removed from schema — store RSVP data in alumniProfiles
        await db.update(alumniProfiles)
            .set({
                rsvpAdults: adults ?? 0,
                rsvpKids: kids ?? 0,
                hotelSelectionId: hotelId || null,
                specialReqs: specialReqs || null,
                updatedAt: new Date(),
            })
            .where(eq(alumniProfiles.email, session.user.email))
            .run();

        return NextResponse.json({ message: "RSVP updated successfully" });

    } catch (error) {
        console.error("RSVP error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
