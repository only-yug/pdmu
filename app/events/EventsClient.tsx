"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string | Date;
    start_time: string;
    venue: string;
    banner_image_url: string | null;
}

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [showEventForm, setShowEventForm] = useState(false);
    const [eventFormMsg, setEventFormMsg] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to permanently delete this event?")) return;

        setIsDeletingId(id);
        try {
            const response = await fetch(`/api/admin/events/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setEvents(prev => prev.filter(e => e.id !== id));
                router.refresh();
            } else {
                alert("Failed to delete event. You must be an admin.");
            }
        } catch (error) {
            console.error("Error deleting event:", error);
            alert("An error occurred while deleting.");
        } finally {
            setIsDeletingId(null);
        }
    };

    const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setEventFormMsg(null);
        const fd = new FormData(e.currentTarget);
        const payload = {
            title: fd.get("title"),
            description: fd.get("description"),
            eventStartDate: fd.get("eventStartDate"),
            eventEndDate: fd.get("eventEndDate") || undefined,
            venueName: fd.get("venueName"),
            venueAddress: fd.get("venueAddress"),
            rsvpDeadline: fd.get("rsvpDeadline") || undefined,
            bannerImageUrl: fd.get("bannerImageUrl") || undefined,
            eventScheduleJson: fd.get("eventScheduleJson") || undefined,
            importantNotesText: fd.get("importantNotesText") || undefined,
        };

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json() as Record<string, any>;
            if (res.ok) {
                setEventFormMsg("Event created successfully! Form will close momentarily.");
                setTimeout(() => {
                    setShowEventForm(false);
                    setEventFormMsg(null);
                    router.refresh();
                }, 1500);
            } else {
                setEventFormMsg(data.error || "Failed to create event");
            }
        } catch {
            setEventFormMsg("Network error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <section className="max-w-5xl mx-auto px-4 py-12 -mt-16 relative z-20">
            {/* Admin Create Event Toggle & Form */}
            {session?.user?.role === 'admin' && (
                <div className="mb-8">
                    <div className="flex justify-end mb-4">
                        <button
                            onClick={() => setShowEventForm(!showEventForm)}
                            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-full font-bold shadow-lg transition-all flex items-center gap-2"
                        >
                            {showEventForm ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    Cancel Creation
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                    </svg>
                                    Add New Event
                                </>
                            )}
                        </button>
                    </div>

                    {showEventForm && (
                        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-800 p-8 mb-8 shadow-xl animate-fade-in relative">
                            <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Create New Event</h3>

                            {eventFormMsg && (
                                <div className={`mb-6 p-4 rounded-xl text-sm font-semibold border ${eventFormMsg.includes('Network') || eventFormMsg.includes('Failed') ? 'bg-red-50 text-red-700 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                                    {eventFormMsg}
                                </div>
                            )}

                            <form onSubmit={handleCreateEvent} className="space-y-5">
                                <FormInput name="title" label="Event Title" required />
                                <FormInput name="description" label="Short Description / Tagline" />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormInput name="eventStartDate" label="Start Date & Time" type="datetime-local" required />
                                    <FormInput name="eventEndDate" label="End Date & Time" type="datetime-local" />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <FormInput name="venueName" label="Venue Name" required />
                                    <FormInput name="venueAddress" label="Venue Address" />
                                </div>
                                <FormInput name="rsvpDeadline" label="RSVP Deadline" type="datetime-local" />
                                <FormInput name="bannerImageUrl" label="Banner Image URL" />
                                <div>
                                    <label htmlFor="importantNotesText" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Important Notes</label>
                                    <textarea name="importantNotesText" id="importantNotesText" rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"></textarea>
                                </div>
                                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Creating..." : "Publish Event"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            )}

            {events.length > 0 ? (
                <div className="space-y-8">
                    {events.map((event: any) => (
                        <div key={event.id} className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row group hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-800 relative">
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
                                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 transition-colors pr-8">
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

                                    {/* Inline Admin Dashboard Entry */}
                                    {session?.user?.role === 'admin' && (
                                        <button
                                            onClick={() => handleDelete(event.id)}
                                            disabled={isDeletingId === event.id}
                                            className="absolute top-4 right-4 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-2 rounded-full hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors disabled:opacity-50"
                                            title="Delete Event"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
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
    );
}

function FormInput({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
        </div>
    );
}
