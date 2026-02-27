import { NextRequest, NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { auth } from "@/auth";
import { uploadToR2, validateFile, ALLOWED_IMAGE_TYPES } from "@/lib/r2";

export const runtime = 'edge';

export async function GET() {
    try {
        const database = getDrizzleDb();

        const allEvents = await database.select().from(events).all();

        // Parse JSON fields
        const formattedEvents = allEvents.map((event: any) => ({
            ...event,
            eventSchedule: event.eventScheduleJson ? JSON.parse(event.eventScheduleJson) : null,
        }));

        return NextResponse.json({ events: formattedEvents });

    } catch (error) {
        console.error("Events fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const formData = await req.formData();

        const title = formData.get("title") as string;
        const description = formData.get("description") as string | null;
        const eventStartDateStr = formData.get("eventStartDate") as string;
        const eventEndDateStr = formData.get("eventEndDate") as string | null;
        const venueName = formData.get("venueName") as string;
        const venueAddress = formData.get("venueAddress") as string | null;
        const rsvpDeadlineStr = formData.get("rsvpDeadline") as string | null;
        const bannerImageFile = formData.get("bannerImage") as File | null;
        const eventScheduleJson = formData.get("eventScheduleJson") as string | null;
        const importantNotesText = formData.get("importantNotesText") as string | null;

        if (!title || !eventStartDateStr || !venueName) {
            return NextResponse.json({ error: "Missing required fields (title, eventStartDate, venueName)" }, { status: 400 });
        }

        let bannerImageUrl = formData.get("bannerImageUrl") as string | null;

        if (bannerImageFile && bannerImageFile.size > 0 && bannerImageFile.name !== 'undefined') {
            const validation = validateFile(bannerImageFile, ALLOWED_IMAGE_TYPES);
            if (!validation.valid) {
                return NextResponse.json({ error: validation.error }, { status: 400 });
            }
            bannerImageUrl = await uploadToR2(bannerImageFile, "uploads/events");
        }

        const database = getDrizzleDb();

        const result = await database.insert(events).values({
            id: crypto.randomUUID(),
            title: title,
            description: description,
            eventStartDate: new Date(eventStartDateStr),
            eventEndDate: eventEndDateStr ? new Date(eventEndDateStr) : null,
            rsvpDeadline: rsvpDeadlineStr ? new Date(rsvpDeadlineStr) : null,
            venueName: venueName,
            venueAddress: venueAddress,
            eventScheduleJson: eventScheduleJson,
            importantNotesText: importantNotesText,
            bannerImageUrl: bannerImageUrl || null,
        }).returning().get();

        return NextResponse.json({ event: result }, { status: 201 });

    } catch (error) {
        console.error("Event creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

