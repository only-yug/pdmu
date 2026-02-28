import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/crypto";
import { getDrizzleDb } from "@/lib/db";
import { users, alumniProfiles, claimTokens } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

const registerSchema = z.object({
    fullName: z.string().optional(),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    claimToken: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const validatedData = registerSchema.safeParse(body);

        if (!validatedData.success) {
            return NextResponse.json(
                { error: "Invalid input", details: validatedData.error.flatten().fieldErrors },
                { status: 400 }
            );
        }

        const { fullName: providedFullName, email, password, claimToken } = validatedData.data;
        const fullName = providedFullName || email.split('@')[0];

        const db = getDrizzleDb();

        // Check if user already exists in users table
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
        }

        // If a claim token is provided, we execute the link flow
        if (claimToken) {
            const tokenRecord = await db.select()
                .from(claimTokens)
                .where(eq(claimTokens.tokenHash, claimToken))
                .get();

            if (!tokenRecord || tokenRecord.isUsed || new Date(tokenRecord.expiresAt) < new Date()) {
                return NextResponse.json({ message: "Invalid or expired claim token" }, { status: 400 });
            }

            const hashedPassword = await hashPassword(password);

            const userResult = await db.insert(users).values({
                id: crypto.randomUUID(),
                email,
                passwordHash: hashedPassword,
                role: 'alumni',
            }).returning({ id: users.id }).get();

            const userId = userResult?.id;
            if (!userId) throw new Error("Failed to create user");

            // Link the profile!
            await db.update(alumniProfiles).set({
                userId,
                // optionally update fullName and email to match their new registration details, 
                // or keep the old ones. We'll update them to ensure they match auth.
                fullName,
                email,
            }).where(eq(alumniProfiles.id, Number(tokenRecord.alumniId))).run();

            // Mark token as used
            await db.update(claimTokens)
                .set({ isUsed: true })
                .where(eq(claimTokens.tokenHash, claimToken))
                .run();

            return NextResponse.json({ message: "Profile claimed successfully", userId }, { status: 201 });
        }


        // NON-CLAIM FLOW (Normal Registration)
        // Check if email exists in alumni_profiles
        const existingProfile = await db.select().from(alumniProfiles).where(eq(alumniProfiles.email, email)).get();

        if (existingProfile && existingProfile.userId) {
            // The profile is already claimed (likely by another account if existingUser check didn't catch it)
            return NextResponse.json({ message: "This alumni profile has already been claimed." }, { status: 409 });
        }

        const hashedPassword = await hashPassword(password);
        const newUserId = crypto.randomUUID();
        const isAlumni = !!existingProfile;

        // Insert into users (schema has: id, email, passwordHash, role, createdAt, fullName)
        const userResult = await db.insert(users).values({
            id: newUserId,
            email,
            passwordHash: hashedPassword,
            fullName: fullName,
            role: isAlumni ? 'alumni' : 'user', // Set to alumni if profile exists
        }).returning({ id: users.id }).get();

        if (!userResult) {
            throw new Error("Failed to create user");
        }

        const userId = userResult.id;

        // If they are an alumni with a pre-existing profile, link it now.
        if (isAlumni && existingProfile) {
            await db.update(alumniProfiles).set({
                userId,
                fullName, // Ensure the profile name matches their registered name
            }).where(eq(alumniProfiles.id, existingProfile.id)).run();
        }

        return NextResponse.json({ message: "User created successfully", userId }, { status: 201 });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
