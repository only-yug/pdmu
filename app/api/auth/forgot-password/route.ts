import { NextResponse } from 'next/server';
export const runtime = 'edge';
import { getDrizzleDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';
import { generateOTP, storeOTP } from '@/lib/forgot-password-utils';
import { sendOTPEmail } from '@/lib/resend';
export async function POST(request: Request) {
    try {
        const { email } = await request.json() as { email: string };
        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }
        const searchEmail = email.trim().toLowerCase();
        const db = getDrizzleDb();

        const [user] = await db.select().from(users)
            .where(sql`lower(trim(${users.email})) = ${searchEmail}`)
            .limit(1);
        if (!user) {
            console.log(`User not found in DB for email: [${searchEmail}].`);
            return NextResponse.json({
                error: 'Account not found',
                message: "We couldn't find an account with that email address."
            }, { status: 404 });
        }
        const otp = generateOTP();
        await storeOTP(user.id, otp);
        const emailResult = await sendOTPEmail(email, otp);
        if (!emailResult.success) {
            console.error(`Resend API Error:`, emailResult.error);
            return NextResponse.json({
                error: 'We could not send your code right now. Please try again later.'
            }, { status: 500 });
        }

        return NextResponse.json({ message: 'Verification code sent!', userId: user.id }, { status: 200 });
    } catch (error) {
        console.error('Forgot password API error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
