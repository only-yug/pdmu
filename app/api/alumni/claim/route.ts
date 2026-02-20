import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json() as Record<string, any>;
        const {
            alumniId,
            bio,
            specialization,
            currentDesignation,
            workplace,
            country,
            state,
            city,
            email,
            phoneNumber,
            whatsappNumber,
            linkedinUrl,
            profilePhotoUrl,
            rsvpAdults,
            rsvpKids,
            hotelSelectionId,
            specialReqs,
        } = body;

        if (!alumniId) {
            return NextResponse.json({ message: "Alumni ID is required" }, { status: 400 });
        }

        const db = getDrizzleDb();

        // 1. Check if profile exists and is unclaimed (userId is null)
        const profile = await db.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.id, alumniId))
            .get();

        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (profile.userId) {
            return NextResponse.json({ message: "Profile is already claimed" }, { status: 409 });
        }

        // 2. Find or create user
        let userId: string | null = null;
        if (email) {
            const existingUser = await db.select({ id: users.id })
                .from(users)
                .where(eq(users.email, email))
                .get();

            if (existingUser) {
                userId = existingUser.id;
            }
            // Note: if user doesn't exist, they should register first.
            // We just link the profile to the user once they register.
        }

        // 3. Update profile with claimed data
        await db.update(alumniProfiles)
            .set({
                userId: userId,
                bioJourney: bio || undefined,
                specialization: specialization || undefined,
                currentDesignation: currentDesignation || undefined,
                workplace: workplace || undefined,
                country: country || undefined,
                state: state || undefined,
                city: city || undefined,
                email: email || profile.email,
                phoneNumber: phoneNumber || undefined,
                whatsappNumber: whatsappNumber || undefined,
                linkedinUrl: linkedinUrl || undefined,
                profilePhotoUrl: profilePhotoUrl || undefined,
                rsvpAdults: rsvpAdults ?? 0,
                rsvpKids: rsvpKids ?? 0,
                hotelSelectionId: hotelSelectionId || null,
                specialReqs: specialReqs || undefined,
                updatedAt: new Date(),
            })
            .where(eq(alumniProfiles.id, alumniId))
            .run();

        return NextResponse.json({ success: true, message: "Profile claimed successfully" });

    } catch (error: any) {
        console.error("Claim error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
