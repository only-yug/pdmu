import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export const runtime = 'edge';

export async function GET(req: Request) {
    try {
        const database = getDrizzleDb();

        // Schema fields: id, imageTitle, imageDescription, imageDate, uploadPhotoUrl, uploadVideoUrl, uploadedBy, createdAt
        const allMemories = await database.select()
            .from(memories)
            .orderBy(desc(memories.createdAt))
            .all();

        return NextResponse.json({ memories: allMemories });
    } catch (error) {
        console.error("Memories fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
