import { getDrizzleDb } from "@/lib/db";
import { events } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import Link from "next/link";
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

            {/* Events List */}
            <section className="max-w-5xl mx-auto px-4 py-12 -mt-16 relative z-20">
                {events.length > 0 ? (
                    <div className="space-y-8">
                        {events.map((event: any) => (
                            <div key={event.id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800">
                                {/* Date Badge (Mobile) */}
                                <div className="md:hidden bg-blue-600 text-white p-4 text-center font-bold">
                                    {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-grow">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="hidden md:block bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-xl text-center min-w-[80px]">
                                            <div className="text-xs uppercase font-bold tracking-wider">
                                                {new Date(event.event_date).toLocaleDateString('en-US', { month: 'short' })}
                                            </div>
                                            <div className="text-2xl font-black">
                                                {new Date(event.event_date).getDate()}
                                            </div>
                                        </div>
                                        <div className="flex-grow">
                                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors">
                                                {event.title}
                                            </h3>
                                            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                    {event.start_time}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    {event.venue}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-gray-600 dark:text-gray-400 mb-6 line-clamp-2">
                                        {event.description}
                                    </p>

                                    <div className="flex items-center gap-4">
                                        <Link
                                            href={`/events/${event.id}`}
                                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-bold text-sm transition-colors"
                                        >
                                            View Details
                                        </Link>
                                    </div>
                                </div>

                                {/* Image (if exists) */}
                                {event.banner_image_url && (
                                    <div className="md:w-1/3 bg-gray-200 relative min-h-[200px]">
                                        {/* Ideally utilize next/image here */}
                                        <img
                                            src={event.banner_image_url}
                                            alt={event.title}
                                            className="absolute inset-0 w-full h-full object-cover"
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-900 rounded-3xl p-12 text-center shadow-xl border border-gray-100 dark:border-gray-800">
                        <div className="text-6xl mb-6">📅</div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Coming Soon</h2>
                        <p className="text-gray-500 max-w-lg mx-auto mb-8">
                            We are finalizing the schedule for our 25th Reunion. Check back soon for the full itinerary!
                        </p>
                        <Link href="/home" className="text-blue-600 font-bold hover:underline">
                            Return to Reunion Hub
                        </Link>
                    </div>
                )}
            </section>
        </div>
    );
}
