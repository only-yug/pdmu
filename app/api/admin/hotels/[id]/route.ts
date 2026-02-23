import { NextResponse } from 'next/server';
import { getDrizzleDb } from '@/lib/db';
import { hotels } from '@/lib/db/schema';
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
        const hotelId = params.id;

        if (!hotelId) {
            return NextResponse.json({ error: "Hotel ID required" }, { status: 400 });
        }

        // Execute hard delete
        await db.delete(hotels).where(eq(hotels.id, hotelId)).run();

        // Flush Next.js static cache
        revalidatePath('/accommodation');

        return NextResponse.json({ success: true, message: "Hotel permanently deleted" });

    } catch (error) {
        console.error("Error deleting hotel:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
