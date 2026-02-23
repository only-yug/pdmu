import { NextResponse } from 'next/server';
import { getDrizzleDb } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/auth';
import { revalidatePath } from 'next/cache';

export const runtime = 'edge';

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        // Security Authentication & Authorization block
        if (!session?.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized. Admin privileges required." }, { status: 403 });
        }

        const db = getDrizzleDb();
        const eventId = params.id;

        if (!eventId) {
            return NextResponse.json({ error: "Event ID required" }, { status: 400 });
        }

        // Execute hard delete
        await db.delete(events).where(eq(events.id, eventId)).run();

        // Flush Next.js static cache
        revalidatePath('/events');

        return NextResponse.json({ success: true, message: "Event permanently deleted" });

    } catch (error) {
        console.error("Error deleting event:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
