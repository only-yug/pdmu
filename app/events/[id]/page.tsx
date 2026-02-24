import { getDrizzleDb } from "@/lib/db";
import { events, eventAttendees, alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
export const runtime = 'edge';

async function getEvent(id: string) {
    try {
        const db = getDrizzleDb();
        const result = await db.select().from(events).where(eq(events.id, id)).limit(1);
        if (result.length === 0) return null;
        return result[0];
    } catch {
        return null;
    }
}

async function getEventAttendees(eventId: string) {
    try {
        const db = getDrizzleDb();
        const attendees = await db
            .select({
                id: alumniProfiles.id,
                fullName: alumniProfiles.fullName,
                profilePhotoUrl: alumniProfiles.profilePhotoUrl,
                country: alumniProfiles.country,
                city: alumniProfiles.city
            })
            .from(eventAttendees)
            .innerJoin(alumniProfiles, eq(eventAttendees.alumniId, alumniProfiles.id))
            .where(eq(eventAttendees.eventId, eventId));

        return attendees;
    } catch {
        return [];
    }
}

export default async function EventDetailsPage({ params }: { params: { id: string } }) {
    const event = await getEvent(params.id);
    const attendees = await getEventAttendees(params.id);

    if (!event) {
        return notFound();
    }

    const eventDate = event.eventStartDate ? new Date(event.eventStartDate) : null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pb-20">
            {/* Header / Hero */}
            <section className="bg-blue-900 dark:bg-black text-white pt-24 pb-16 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <Link href="/events" className="inline-flex items-center gap-2 text-blue-200 hover:text-white transition-colors mb-6 text-sm font-semibold">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Back to Events
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight leading-tight">{event.title}</h1>
                    <div className="flex flex-wrap gap-4 text-blue-200 text-sm">
                        {eventDate && (
                            <span className="flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                {eventDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            {event.venueName}
                        </span>
                    </div>
                </div>
            </section>

            {/* Content Body */}
            <main className="max-w-4xl mx-auto px-4 mt-8">
                <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">About the Event</h2>
                    {event.description ? (
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg whitespace-pre-wrap">
                            {event.description}
                        </p>
                    ) : (
                        <p className="text-gray-400 italic">No description provided for this event.</p>
                    )}

                    <hr className="my-10 border-gray-200 dark:border-gray-800" />

                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Event Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-gray-600 dark:text-gray-400">
                        {event.venueAddress && (
                            <div>
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Location</span>
                                <p>{event.venueAddress}</p>
                            </div>
                        )}
                        {event.rsvpDeadline && (
                            <div>
                                <span className="block text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">RSVP Deadline</span>
                                <p>{new Date(event.rsvpDeadline).toLocaleDateString()}</p>
                            </div>
                        )}
                        <div>
                            <span className="block text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-2">Attendees</span>
                            <p>{attendees.length} batchmates registered</p>
                        </div>
                    </div>

                    {/* Batchmates Attending Section */}
                    <hr className="my-10 border-gray-200 dark:border-gray-800" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Batchmates Attending</h3>
                    {attendees.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {attendees.map(attendee => (
                                <div key={attendee.id} className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow">
                                    {attendee.profilePhotoUrl ? (
                                        <img src={attendee.profilePhotoUrl} alt={attendee.fullName} className="w-16 h-16 rounded-full object-cover mb-3 shadow-sm" />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-xl font-bold mb-3 shadow-sm">
                                            {attendee.fullName.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <span className="font-semibold text-gray-900 dark:text-white text-sm text-center line-clamp-1">{attendee.fullName}</span>
                                    {(attendee.city || attendee.country) && (
                                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 text-center">
                                            {attendee.city ? `${attendee.city}, ` : ''}{attendee.country || ''}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 italic">No attendees have confirmed yet. Be the first to RSVP!</p>
                    )}
                </div>
            </main>
        </div>
    );
}
