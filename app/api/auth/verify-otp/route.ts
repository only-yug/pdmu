import { NextResponse } from 'next/server';

export const runtime = 'edge';

import { getDrizzleDb } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { verifyOTP } from '@/lib/forgot-password-utils';

export async function POST(request: Request) {
    try {
        const { email, otp } = await request.json() as {
            email: string;
            otp: string;
        };

        if (!email || !otp) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const db = getDrizzleDb();
        const userEmail = email.trim().toLowerCase();

        // 1. Find user by email
        const [user] = await db.select().from(users).where(eq(users.email, userEmail)).limit(1);

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 2. Verify OTP code (persist it so it can be used for the reset step)
        const isOTPValid = await verifyOTP(user.id, otp, true);

        if (!isOTPValid) {
            return NextResponse.json({ error: 'Verification code is invalid or has expired' }, { status: 400 });
        }

        // Return success but DON'T update the password yet
        return NextResponse.json({ message: 'Code verified successfully', success: true }, { status: 200 });
    } catch (error) {
        console.error('Verify OTP API error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
