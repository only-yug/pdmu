import { getDrizzleDb } from "@/lib/db";
import { events, eventAttendees } from "@/lib/db/schema";
import { asc, eq, sql } from "drizzle-orm";
import EventsClient from "./EventsClient";
export const runtime = 'edge';

async function getEvents() {
    try {
        const db = getDrizzleDb();

        const allEvents = await db.select().from(events).orderBy(asc(events.eventStartDate)).all();

        const eventsWithCounts = await Promise.all(allEvents.map(async (event) => {
            const attendeeRecords = await db
                .select({
                    count: sql<number>`count(*)`
                })
                .from(eventAttendees)
                .where(eq(eventAttendees.eventId, event.id))
                .get();

            const batchCount = attendeeRecords?.count || 0;

            return {
                id: event.id,
                title: event.title,
                description: event.description,
                event_date: event.eventStartDate,
                venue: event.venueName,
                venueAddress: event.venueAddress,
                banner_image_url: event.bannerImageUrl,
                start_time: event.eventStartDate ? new Date(event.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                rsvpDeadline: event.rsvpDeadline,
                totalBatchmatesCount: batchCount,
                totalAttendeesCount: batchCount, // Currently same as batchmates unless guests are added
            };
        }));

        return eventsWithCounts;
    } catch (e) {
        console.error("Error fetching events with counts:", e);
        return [];
    }
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
            {/* Hero */}
            <section className="bg-blue-900 dark:bg-black text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 text-center relative z-10">
                    <h1 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">Silver Jubilee Events</h1>
                    <p className="text-xl text-blue-200/80 max-w-2xl mx-auto">
                        A weekend of memories, laughter, and celebration.
                    </p>
                </div>
            </section>

            {/* Events List Client */}
            <EventsClient initialEvents={events} />
        </div>
    );
}
