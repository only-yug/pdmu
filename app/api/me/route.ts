import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDrizzleDb } from "@/lib/db";
import { users, alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(_req: Request) {
    const session = await auth();
    if (!session || !session.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const db = getDrizzleDb();
        const email = session.user.email;

        // Fetch user (schema: id, email, passwordHash, role, createdAt)
        const user = await db.select({
            id: users.id,
            email: users.email,
            role: users.role,
        })
            .from(users)
            .where(eq(users.email, email || ""))
            .get();

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Fetch profile
        const profile = await db.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.userId, user.id))
            .get();

        return NextResponse.json({ data: { user, profile } });
    } catch (e: any) {
        console.error("Profile fetch error:", e);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
