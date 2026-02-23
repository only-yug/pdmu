import { getDrizzleDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import EventsClient from "./EventsClient";
export const runtime = 'edge';

async function getEvents() {
    try {
        const db = getDrizzleDb();
        const result = await db.select({
            id: events.id,
            title: events.title,
            description: events.description,
            eventStartDate: events.eventStartDate,
            venueName: events.venueName,
            bannerImageUrl: events.bannerImageUrl,
            venueAddress: events.venueAddress,
        })
            .from(events)
            .orderBy(asc(events.eventStartDate));

        return result.map(e => ({
            ...e,
            event_date: e.eventStartDate,
            venue: e.venueName,
            banner_image_url: e.bannerImageUrl,
            start_time: e.eventStartDate ? new Date(e.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
        }));
    } catch (e) {
        console.error(e);
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
