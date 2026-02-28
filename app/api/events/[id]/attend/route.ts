import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { eventAttendees, alumniProfiles } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, and } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ attending: false });
        }

        const eventId = params.id;
        const db = getDrizzleDb();

        const profiles = await db.select().from(alumniProfiles).where(eq(alumniProfiles.email, session.user.email)).limit(1);
        if (profiles.length === 0) {
            return NextResponse.json({ attending: false });
        }
        const alumniId = profiles[0].id;

        const existing = await db.select().from(eventAttendees).where(
            and(
                eq(eventAttendees.eventId, eventId),
                eq(eventAttendees.alumniId, alumniId)
            )
        ).limit(1);

        return NextResponse.json({ attending: existing.length > 0 });
    } catch (error) {
        console.error("Error fetching attendance:", error);
        return NextResponse.json({ attending: false });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const eventId = params.id;
        const db = getDrizzleDb();

        let alumniId;
        const profiles = await db.select().from(alumniProfiles).where(eq(alumniProfiles.email, session.user.email)).limit(1);

        if (profiles.length === 0) {
            if (session.user.role === "admin") {
                // Auto-provision an alumni profile for the admin so they can test/use RSVPs
                await db.insert(alumniProfiles).values({
                    email: session.user.email,
                    fullName: session.user.name || "Admin",
                    profilePhotoUrl: session.user.image,
                }).run();

                const newAdminProfile = await db.select().from(alumniProfiles).where(eq(alumniProfiles.email, session.user.email)).limit(1);
                if (newAdminProfile.length === 0) throw new Error("Failed to create admin profile");
                alumniId = newAdminProfile[0].id;
            } else {
                return NextResponse.json({ error: "Alumni profile not found" }, { status: 404 });
            }
        } else {
            alumniId = profiles[0].id;
        }

        const existing = await db.select().from(eventAttendees).where(
            and(
                eq(eventAttendees.eventId, eventId),
                eq(eventAttendees.alumniId, alumniId)
            )
        ).limit(1);

        if (existing.length > 0) {
            // Toggle off
            await db.delete(eventAttendees).where(
                and(
                    eq(eventAttendees.eventId, eventId),
                    eq(eventAttendees.alumniId, alumniId)
                )
            ).run();
            return NextResponse.json({ attending: false, message: "Attendance removed" });
        } else {
            // Toggle on
            await db.insert(eventAttendees).values({
                eventId,
                alumniId,
            }).run();
            return NextResponse.json({ attending: true, message: "Attendance added" });
        }
    } catch (error) {
        console.error("Error toggling attendance:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
