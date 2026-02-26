import { NextResponse } from 'next/server';
import { getDrizzleDb } from '@/lib/db';
import { memories } from '@/lib/db/schema';
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

        const db = getDrizzleDb();
        const memoryId = params.id;

        if (!memoryId) {
            return NextResponse.json({ error: "Memory ID required" }, { status: 400 });
        }

        const memory = await db.select().from(memories).where(eq(memories.id, memoryId)).get();

        if (!memory) {
            return NextResponse.json({ error: "Memory not found" }, { status: 404 });
        }

        const isOwner = session?.user && (session.user as any).id === memory.uploadedBy;
        const isAdmin = session?.user?.role === 'admin';

        if (!isAdmin && !isOwner) {
            return NextResponse.json({ error: "Unauthorized. You can only delete your own memories." }, { status: 403 });
        }

        // Execute hard delete
        await db.delete(memories).where(eq(memories.id, memoryId)).run();

        // Flush Next.js static cache
        revalidatePath('/memories');

        return NextResponse.json({ success: true, message: "Memory permanently deleted" });

    } catch (error) {
        console.error("Error deleting memory:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
