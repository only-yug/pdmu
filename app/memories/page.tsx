import { getDrizzleDb } from "@/lib/db";
import { memories, users, alumniProfiles } from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import MemoriesGrid from "./MemoriesGrid";

export const runtime = 'edge';

async function getMemories() {
    try {
        const db = getDrizzleDb();

        const result = await db.select({
            id: memories.id,
            imageTitle: memories.imageTitle,
            imageDescription: memories.imageDescription,
            imageDate: memories.imageDate,
            uploadPhotoUrl: memories.uploadPhotoUrl,
            uploadVideoUrl: memories.uploadVideoUrl,
            createdAt: memories.createdAt,
            userRole: users.role,
            userEmail: users.email,
            alumniName: alumniProfiles.fullName,
            alumniPhoto: alumniProfiles.profilePhotoUrl,
        })
            .from(memories)
            .leftJoin(users, eq(memories.uploadedBy, users.id))
            .leftJoin(alumniProfiles, eq(users.id, alumniProfiles.userId))
            .orderBy(desc(memories.createdAt));

        return result.map(m => {
            // Determine name to show
            let displayName = "Anonymous";
            if (m.alumniName) {
                displayName = m.alumniName;
            } else if (m.userRole === 'admin') {
                displayName = "Admin";
            }

            // Format date nicely if it exists (e.g., "Oct 2023")
            let formattedDate = undefined;
            if (m.imageDate) {
                const dateObj = new Date(m.imageDate);
                formattedDate = dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
            }

            return {
                id: m.id,
                title: m.imageTitle || "Untitled Memory",
                description: m.imageDescription || "",
                user_name: displayName,
                user_avatar: m.alumniPhoto || "",
                photo_url: m.uploadPhotoUrl || "",
                video_url: m.uploadVideoUrl || "",
                media_type: (m.uploadVideoUrl ? "video" : "photo") as "photo" | "video",
                year: m.createdAt ? new Date(m.createdAt).getFullYear() : 2001,
                image_date: formattedDate,
                likes: 0,
                comments_count: 0,
                is_liked: false
            };
        });
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
