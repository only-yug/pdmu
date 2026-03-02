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
            coverPhotoUrl,
            hotelSelectionId,
            specialReqs,
        } = body;

        const { auth } = await import("@/auth");
        const session = await auth();

        if (!alumniId) {
            return NextResponse.json({ message: "Alumni ID is required" }, { status: 400 });
        }

        const db = getDrizzleDb();

        const profile = await db.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.id, Number(alumniId)))
            .get();

        if (!profile) {
            return NextResponse.json({ message: "Profile not found" }, { status: 404 });
        }

        if (profile.userId) {
            if (!session || !session.user || session.user.id !== profile.userId) {
                return NextResponse.json({ message: "Profile is already claimed by someone else" }, { status: 409 });
            }
        }

        let userId: string | null = session?.user?.id || null;
        let matchedUserEmail: string | null = session?.user?.email || null;

        if (!userId && email) {

            const matchingUser = await db.select({ id: users.id, email: users.email })
                .from(users)
                .where(eq(users.email, email))
                .get();

            if (matchingUser) {
                userId = matchingUser.id;
                matchedUserEmail = matchingUser.email;
            }
        }

        if (!userId && (body.fullName || profile.fullName)) {
            const nameToMatch = (body.fullName || profile.fullName).trim().toLowerCase();

            const allUsers = await db.select({ id: users.id, email: users.email, fullName: users.fullName })
                .from(users)
                .all();

            const fuzzyMatch = allUsers.find((u: any) => {
                if (!u.fullName) return false;
                const uName = u.fullName.toLowerCase();
                return uName.includes(nameToMatch) || nameToMatch.includes(uName);
            });

            if (fuzzyMatch) {
                userId = fuzzyMatch.id;
                matchedUserEmail = fuzzyMatch.email;
                console.log(`Fuzzy match found: "${fuzzyMatch.fullName}" matches "${nameToMatch}"`);
            }
        }

        if (!userId) {
            return NextResponse.json({ message: "Could not link profile to a user account. Please login first." }, { status: 400 });
        }

        await db.update(alumniProfiles)
            .set({
                userId: userId,
                fullName: body.fullName || profile.fullName,
                rollNumber: body.rollNumber ? parseInt(body.rollNumber) : profile.rollNumber,
                bioJourney: body.bioJourney || body.bio || undefined,
                favoriteMemories: body.favoriteMemories || undefined,
                specialization: specialization || undefined,
                currentDesignation: currentDesignation || undefined,
                workplace: workplace || undefined,
                country: country || undefined,
                state: state || undefined,
                city: city || undefined,
                email: email || matchedUserEmail || profile.email,
                phoneNumber: phoneNumber || undefined,
                whatsappNumber: whatsappNumber || undefined,
                linkedinUrl: linkedinUrl || undefined,
                instagramHandle: body.instagramHandle || undefined,
                facebookUrl: body.facebookUrl || undefined,
                profilePhotoUrl: profilePhotoUrl || undefined,
                coverPhotoUrl: coverPhotoUrl || undefined,
                isAttending: body.isAttending || undefined,
                rsvpAdults: body.rsvpAdults ? parseInt(body.rsvpAdults) : 0,
                rsvpKids: body.rsvpKids ? parseInt(body.rsvpKids) : 0,
                hotelSelectionId: hotelSelectionId || null,
                specialReqs: specialReqs || undefined,
                updatedAt: new Date(),
            })
            .where(eq(alumniProfiles.id, Number(alumniId)))
            .run();

        if (matchedUserEmail) {
            await db.update(users)
                .set({ role: 'alumni' })
                .where(eq(users.email, matchedUserEmail))
                .run();
        }

        return NextResponse.json({ success: true, message: "Profile claimed successfully" });

    } catch (error: any) {
        console.error("Claim error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
