import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { auth } from "@/auth";
import { eq } from "drizzle-orm";

export const runtime = 'edge';

// DELETE: Remove a memory (owner or admin only)
export async function DELETE(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id } = params;

        const db = getDrizzleDb();

        // Check memory exists
        const memory = await db.select()
            .from(memories)
            .where(eq(memories.id, id))
            .get();

        if (!memory) {
            return NextResponse.json({ error: "Memory not found" }, { status: 404 });
        }

        // Only owner or admin can delete
        if (memory.uploadedBy !== session.user.id && session.user.role !== "admin") {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // (Files are now placeholders/static, no R2 deletion needed)

        await db.delete(memories).where(eq(memories.id, id)).run();

        return NextResponse.json({ success: true, message: "Memory deleted" });
    } catch (error) {
        console.error("Delete memory error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
