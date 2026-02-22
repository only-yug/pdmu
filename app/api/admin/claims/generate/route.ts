import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { claimTokens, users } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const db = getDrizzleDb();
        const user = await db.select().from(users).where(eq(users.email, session.user.email)).get();

        if (user?.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { alumniId } = (await req.json()) as { alumniId: string };
        if (!alumniId) {
            return NextResponse.json({ error: "alumniId is required" }, { status: 400 });
        }

        // Generate a random token
        const rawToken = crypto.randomUUID();

        // In a real production app we'd hash this, but we'll store literal token token for simplicity and 
        // fast claim-url matching (the token is already a secure random UUID)
        const tokenHash = rawToken;

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

        await db.insert(claimTokens).values({
            tokenHash,
            alumniId,
            expiresAt,
        }).run();

        // Get the base URL from the request to construct the full link
        const url = new URL(req.url);
        const baseUrl = `${url.protocol}//${url.host}`;
        const claimUrl = `${baseUrl}/claim/${rawToken}`;

        return NextResponse.json({ claimUrl });
    } catch (error) {
        console.error("Failed to generate claim link:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
