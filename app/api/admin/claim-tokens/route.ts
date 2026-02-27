import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { claimTokens, alumniProfiles } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq, isNull } from "drizzle-orm";

export const runtime = 'edge';

// POST: Generate a claim token for an unclaimed alumni profile
export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const body = await req.json() as Record<string, any>;
        const { alumniId } = body;

        if (!alumniId) {
            return NextResponse.json({ error: "alumniId is required" }, { status: 400 });
        }

        const db = getDrizzleDb();

        // Check alumni exists and is unclaimed
        const profile = await db.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.id, Number(alumniId)))
            .get();

        if (!profile) {
            return NextResponse.json({ error: "Alumni profile not found" }, { status: 404 });
        }

        if (profile.userId) {
            return NextResponse.json({ error: "Profile is already claimed" }, { status: 400 });
        }

        // Generate token
        const rawToken = crypto.randomUUID();
        const tokenHash = await hashToken(rawToken);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        await db.insert(claimTokens).values({
            tokenHash,
            alumniId,
            isUsed: false,
            expiresAt,
        }).run();

        return NextResponse.json({
            token: rawToken,
            claimUrl: `/registerProfile?claim=${alumniId}&token=${rawToken}`,
            expiresAt: expiresAt.toISOString(),
        });
    } catch (error) {
        console.error("Claim token generation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET: List all unclaimed alumni profiles
export async function GET() {
    try {
        const session = await auth();
        if (!session?.user || session.user.role !== "admin") {
            return NextResponse.json({ error: "Admin access required" }, { status: 403 });
        }

        const db = getDrizzleDb();
        const unclaimed = await db.select({
            id: alumniProfiles.id,
            fullName: alumniProfiles.fullName,
            email: alumniProfiles.email,
            rollNumber: alumniProfiles.rollNumber,
        })
            .from(alumniProfiles)
            .where(isNull(alumniProfiles.userId))
            .all();

        return NextResponse.json({ data: unclaimed });
    } catch (error) {
        console.error("Claim tokens list error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}
