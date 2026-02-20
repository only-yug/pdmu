import { getDrizzleDb } from "@/lib/db";
import { memories } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import MemoriesGrid from "./MemoriesGrid";

export const runtime = 'edge';

async function getMemories() {
    try {
        const db = getDrizzleDb();
        // Schema fields: id, imageTitle, imageDescription, imageDate, uploadPhotoUrl, uploadVideoUrl, uploadedBy, createdAt
        const result = await db.select({
            id: memories.id,
            imageTitle: memories.imageTitle,
            imageDescription: memories.imageDescription,
            uploadPhotoUrl: memories.uploadPhotoUrl,
            uploadVideoUrl: memories.uploadVideoUrl,
            createdAt: memories.createdAt,
        })
            .from(memories)
            .orderBy(desc(memories.createdAt));

        return result.map(m => ({
            id: m.id,
            title: m.imageTitle || "Untitled Memory",
            description: m.imageDescription || "",
            user_name: "Anonymous",
            user_avatar: "",
            photo_url: m.uploadPhotoUrl || "",
            video_url: m.uploadVideoUrl || "",
            media_type: (m.uploadVideoUrl ? "video" : "photo") as "photo" | "video",
            year: m.createdAt ? new Date(m.createdAt).getFullYear() : 2001,
            likes: 0,
            comments_count: 0,
            is_liked: false
        }));
    } catch (e) {
        console.error("Failed to fetch memories:", e);
        return [];
    }
}

export default async function MemoriesPage() {
    const memories = await getMemories();

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <MemoriesGrid initialMemories={memories} />
        </div>
    );
}
