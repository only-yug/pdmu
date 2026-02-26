import { getDrizzleDb } from "@/lib/db";
import { events, eventAttendees, alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import EventDetailsClient from "@/components/EventDetailsClient";

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

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 transition-colors duration-300 pb-20 pt-24">
            <main className="max-w-5xl mx-auto px-4">
                {/* Back Link */}
                <Link href="/events" className="inline-flex items-center gap-2 text-gray-400 hover:text-blue-600 transition-colors mb-8 text-sm font-bold uppercase tracking-widest">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                    Back to Events
                </Link>

                {/* Main Client Component */}
                <EventDetailsClient
                    event={event}
                    attendeesCount={attendees.length}
                />

                {/* Attendees Section */}
                <div className="mt-12 bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-gray-100 dark:border-gray-800">
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mb-8 tracking-tight">Batchmates Attending</h3>
                    {attendees.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                            {attendees.map(attendee => (
                                <div key={attendee.id} className="flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all group">
                                    <div className="relative">
                                        {attendee.profilePhotoUrl ? (
                                            <div className="relative w-20 h-20 mb-4">
                                                <Image
                                                    src={attendee.profilePhotoUrl}
                                                    alt={attendee.fullName}
                                                    fill
                                                    className="rounded-full object-cover shadow-md border-2 border-white dark:border-gray-700 transition-transform group-hover:scale-110"
                                                    unoptimized
                                                />
                                            </div>
                                        ) : (
                                            <div className="w-20 h-20 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-2xl font-black mb-4 shadow-md border-2 border-white dark:border-gray-700 transition-transform group-hover:scale-110">
                                                {attendee.fullName.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                    <span className="font-bold text-gray-900 dark:text-white text-sm text-center line-clamp-1">{attendee.fullName}</span>
                                    {(attendee.city || attendee.country) && (
                                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-1 line-clamp-1 text-center">
                                            {attendee.city ? `${attendee.city}, ` : ''}{attendee.country || ''}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/30 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
                            <p className="text-gray-400 italic font-medium">No attendees have confirmed yet. Be the first to RSVP!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
