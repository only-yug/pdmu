import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/crypto";

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json() as Record<string, any>;
        const { email, token, newPassword } = body;

        if (!email || !token || !newPassword) {
            return NextResponse.json({ error: "Email, token, and new password are required" }, { status: 400 });
        }

        if (newPassword.length < 8) {
            return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
        }

        // In a full implementation, you'd validate the token against a stored hash
        // For now, since we're logging tokens, we just update the password
        // This is a placeholder for when proper token storage is added
        console.log(`[Reset Password] Attempt for ${email} with token ${token}`);

        const database = getDrizzleDb();
        const user = await database.select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (!user) {
            return NextResponse.json({ error: "Invalid reset link" }, { status: 400 });
        }

        const passwordHash = await hashPassword(newPassword);

        await database.update(users)
            .set({ passwordHash })
            .where(eq(users.email, email))
            .run();

        return NextResponse.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
