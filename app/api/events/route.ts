import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { auth } from "@/auth";

export const runtime = 'edge';

export async function GET() {
    try {
        const database = getDrizzleDb();

        const allEvents = await database.select().from(events).all();

        // Parse JSON fields
        const formattedEvents = allEvents.map(event => ({
            ...event,
            eventSchedule: event.eventScheduleJson ? JSON.parse(event.eventScheduleJson) : null,
        }));

        return NextResponse.json({ events: formattedEvents });

    } catch (error) {
        console.error("Events fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || session.user.role !== 'admin') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json() as Record<string, any>;

        if (!body.title || !body.eventStartDate || !body.venueName) {
            return NextResponse.json({ error: "Missing required fields (title, eventStartDate, venueName)" }, { status: 400 });
        }

        const database = getDrizzleDb();

        const result = await database.insert(events).values({
            id: crypto.randomUUID(),
            title: body.title,
            description: body.description,
            eventStartDate: new Date(body.eventStartDate),
            eventEndDate: body.eventEndDate ? new Date(body.eventEndDate) : undefined,
            rsvpDeadline: body.rsvpDeadline ? new Date(body.rsvpDeadline) : undefined,
            venueName: body.venueName,
            venueAddress: body.venueAddress,
            eventScheduleJson: body.eventScheduleJson,
            importantNotesText: body.importantNotesText,
            bannerImageUrl: body.bannerImageUrl,
        }).returning().get();

        return NextResponse.json({ event: result }, { status: 201 });

    } catch (error) {
        console.error("Event creation error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
