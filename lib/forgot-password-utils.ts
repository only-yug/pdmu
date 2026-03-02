import { getDrizzleDb } from "./db";
import { passwordResetTokens } from "./db/schema";
import { eq, and, gt } from "drizzle-orm";

export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function storeOTP(userId: string, otp: string) {
    const db = getDrizzleDb();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    await db.delete(passwordResetTokens).where(eq(passwordResetTokens.userId, userId));
    await db.insert(passwordResetTokens).values({
        userId,
        token: otp,
        expiresAt,
    });
}

export async function verifyOTP(userId: string, otp: string, persist: boolean = false): Promise<boolean> {
    const db = getDrizzleDb();
    const now = new Date();

    const [record] = await db
        .select()
        .from(passwordResetTokens)
        .where(
            and(
                eq(passwordResetTokens.userId, userId),
                eq(passwordResetTokens.token, otp),
                gt(passwordResetTokens.expiresAt, now)
            )
        )
        .limit(1);

    if (record) {
        if (!persist) {
            await db.delete(passwordResetTokens).where(eq(passwordResetTokens.id, record.id));
        }
        return true;
    }

    return false;
}
