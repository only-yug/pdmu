import { NextResponse } from "next/server";
import { z } from "zod";
import { hashPassword } from "@/lib/crypto";
import { getDrizzleDb } from "@/lib/db";
import { users, alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

const registerSchema = z.object({
    fullName: z.string().min(1, "Full name is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
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

        const { fullName, email, password } = validatedData.data;

        const db = getDrizzleDb();

        // Check if user already exists in users table
        const existingUser = await db.select().from(users).where(eq(users.email, email)).get();
        if (existingUser) {
            return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
        }

        // Check if email exists in alumni_profiles
        const existingProfile = await db.select().from(alumniProfiles).where(eq(alumniProfiles.email, email)).get();

        if (existingProfile) {
            // If alumni profile exists but has no linked user, they can link/claim it
            if (!existingProfile.userId) {
                return NextResponse.json({
                    message: "An unclaimed profile exists for this email. Please claim it instead.",
                    redirectTo: `/claim?email=${email}`
                }, { status: 409 });
            } else {
                return NextResponse.json({ message: "User already registered. Please login." }, { status: 409 });
            }
        }

        const hashedPassword = await hashPassword(password);

        // Insert into users (schema has: id, email, passwordHash, role, createdAt)
        const userResult = await db.insert(users).values({
            id: crypto.randomUUID(),
            email,
            passwordHash: hashedPassword,
            role: 'alumni',
        }).returning({ id: users.id }).get();

        if (!userResult) {
            throw new Error("Failed to create user");
        }

        const userId = userResult.id;

        // Insert alumni profile — rollNumber is integer, use null for self-registered
        await db.insert(alumniProfiles).values({
            id: crypto.randomUUID(),
            userId,
            fullName,
            email,
            rollNumber: null,  // self-registered: no roll number assigned yet
        }).run();

        return NextResponse.json({ message: "User created successfully", userId }, { status: 201 });

    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json({ message: "Internal server error", error: error.message }, { status: 500 });
    }
}
