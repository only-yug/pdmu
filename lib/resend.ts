import { Resend } from 'resend';
import { getRequestContext } from '@cloudflare/next-on-pages';

function getResend() {
    // 1. Try Cloudflare Request Context (Production/Edge)
    try {
        const ctx = getRequestContext();
        if (ctx?.env?.RESEND_API_KEY) {
            return new Resend(ctx.env.RESEND_API_KEY as string);
        }
    } catch (e) { }

    // 2. Fallback to process.env (Local Dev)
    return new Resend(process.env.RESEND_API_KEY);
}

export async function sendOTPEmail(email: string, otp: string) {
    try {
        const resend = getResend();
        const { data, error } = await resend.emails.send({
            from: 'PDUMC Alumni <onboarding@resend.dev>', // Change to your domain after verification
            to: [email],
            subject: 'Password Reset Code - PDUMC 2001 Alumni',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <h2 style="color: #2563eb;">PDUMC 2001 Alumni</h2>
                    <p>Hello,</p>
                    <p>You requested to reset your password. Use the following 6-digit code to proceed:</p>
                    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
                        <span style="font-size: 32px; letter-spacing: 5px; font-weight: bold; color: #111;">${otp}</span>
                    </div>
                    <p>This code is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 40px 0 20px 0;" />
                    <p style="font-size: 12px; color: #666; text-align: center;">Pandit Dindayal Upadhyay Medical College Reunion 2001</p>
                </div>
            `,
        });

        if (error) {
            console.error('Error sending OTP email:', error);
            return { success: false, error };
        }

        return { success: true, data };
    } catch (error) {
        console.error('Unexpected error sending OTP email:', error);
        return { success: false, error };
    }
}
