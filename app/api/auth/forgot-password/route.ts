import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

export async function POST(req: Request) {
    try {
        const body = await req.json() as Record<string, any>;
        const { email } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const database = getDrizzleDb();
        const user = await database.select()
            .from(users)
            .where(eq(users.email, email))
            .get();

        if (!user) {
            console.log(`[Forgot Password] No user found for: ${email}`);
            return NextResponse.json({ message: "If an account exists with that email, you will receive a password reset link." });
        }

        const resetToken = crypto.randomUUID();
        console.log(`[Forgot Password] Reset token for ${email}: ${resetToken}`);
        console.log(`[Forgot Password] Reset link: ${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`);

        return NextResponse.json({
            message: "If an account exists with that email, you will receive a password reset link.",
        });
    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

async function hashToken(token: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(token);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}
