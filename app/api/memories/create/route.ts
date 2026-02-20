import { NextRequest, NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { auth } from "@/auth";
import { memories } from "@/lib/db/schema";
import { uploadToR2, validateFile, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } from "@/lib/r2";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userId = session.user.id;

        const formData = await req.formData();
        const title = formData.get("title") as string;
        const description = formData.get("description") as string;
        const file = formData.get("file") as File | null;
        const videoFile = formData.get("video") as File | null;

        if (!title) {
            return NextResponse.json({ error: "Title is required" }, { status: 400 });
        }

        let photoUrl = "";
        let videoUrl = "";

        if (file) {
            const validation = validateFile(file, ALLOWED_IMAGE_TYPES);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            photoUrl = await uploadToR2(file, "uploads/memories");
        }

        if (videoFile) {
            const validation = validateFile(videoFile, ALLOWED_VIDEO_TYPES);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            videoUrl = await uploadToR2(videoFile, "uploads/videos");
        }

        if (!photoUrl && !videoUrl) {
            return NextResponse.json({ error: "Photo or video is required" }, { status: 400 });
        }

        const database = getDrizzleDb();
        await database.insert(memories).values({
            id: crypto.randomUUID(),
            imageTitle: title,
            imageDescription: description || undefined,
            uploadPhotoUrl: photoUrl || undefined,
            uploadVideoUrl: videoUrl || undefined,
            uploadedBy: userId,
        }).run();

        return NextResponse.json({ success: true, message: "Memory shared successfully" });
    } catch (error) {
        console.error("Error creating memory:", error);
        return NextResponse.json({ success: false, error: "Failed to create memory" }, { status: 500 });
    }
}
