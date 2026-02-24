import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export const runtime = 'edge';

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const database = getDrizzleDb();

        let profile = await database.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.email, session.user.email))
            .get();

        if (!profile) {
            if (session.user.role === "admin") {
                const alumniId = crypto.randomUUID();
                await database.insert(alumniProfiles).values({
                    id: alumniId,
                    email: session.user.email,
                    fullName: session.user.name || "Admin",
                    profilePhotoUrl: session.user.image,
                }).run();

                profile = await database.select()
                    .from(alumniProfiles)
                    .where(eq(alumniProfiles.email, session.user.email))
                    .get();
            } else {
                return NextResponse.json({ error: "Profile not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { profileUpdateSchema } = await import("@/lib/schemas");

        const result = profileUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        // Filter undefined values
        const updateData = Object.fromEntries(
            Object.entries(result.data).filter(([_, v]) => v !== undefined)
        );

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No changes detected" });
        }

        const database = getDrizzleDb();

        await database.update(alumniProfiles)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(alumniProfiles.email, session.user.email))
            .run();

        return NextResponse.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
