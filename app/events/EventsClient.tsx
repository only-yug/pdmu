"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import ImageModal from "@/components/ImageModal";

interface Event {
    id: string;
    title: string;
    description: string | null;
    event_date: string | Date;
    start_time: string;
    venue: string;
    venueAddress: string | null;
    banner_image_url: string | null;
    rsvpDeadline: Date | null;
    totalBatchmatesCount: number;
    totalAttendeesCount: number;
}

export default function EventsClient({ initialEvents }: { initialEvents: Event[] }) {
    const [events, setEvents] = useState(initialEvents);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
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

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                body: fd,
            });
            const data = await res.json() as Record<string, any>;
            if (res.ok && data.event) {
                const newEvent: Event = {
                    id: data.event.id,
                    title: data.event.title,
                    description: data.event.description,
                    event_date: data.event.eventStartDate,
                    start_time: data.event.eventStartDate ? new Date(data.event.eventStartDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
                    venue: data.event.venueName,
                    venueAddress: data.event.venueAddress,
                    banner_image_url: data.event.bannerImageUrl,
                    rsvpDeadline: data.event.rsvpDeadline,
                    totalBatchmatesCount: data.event.totalBatchmatesCount || 0,
                    totalAttendeesCount: data.event.totalAttendeesCount || 0,
                };

                setEventFormMsg("Event created successfully! Form will close momentarily.");

                setEvents(prev => [newEvent, ...prev].sort((a, b) =>
                    new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
                ));

                setTimeout(() => {
                    setShowEventForm(false);
                    setEventFormMsg(null);
                    router.refresh();
                }, 1500);
            } else {
                setEventFormMsg(data.error || "Failed to create event");
            }
        } catch (error) {
            console.error("Error creating event:", error);
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

                                <div className="bg-gray-50 dark:bg-gray-800/50 p-6 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                                    <label htmlFor="bannerImage" className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3">Banner Image</label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1">
                                                <input
                                                    type="file"
                                                    id="bannerImage"
                                                    name="bannerImage"
                                                    accept="image/*"
                                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 transition-all cursor-pointer file:cursor-pointer"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

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
                <div>
                    <div className="columns-1 lg:columns-2 gap-8">
                        {events.map((event: any) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                session={session}
                                isDeletingId={isDeletingId}
                                onDelete={handleDelete}
                                onImageClick={setSelectedImage}
                            />
                        ))}
                    </div>
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
            <ImageModal
                src={selectedImage || ""}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
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

function EventCard({ event, session, isDeletingId, onDelete, onImageClick }: { event: any, session: any, isDeletingId: string | null, onDelete: (id: string) => void, onImageClick: (src: string) => void }) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number, secs: number } | null>(null);

    const [isAttending, setIsAttending] = useState(false);
    const [isLoadingAttending, setIsLoadingAttending] = useState(true);
    const [isPulsing, setIsPulsing] = useState(false);

    const canRsvp = session?.user?.role === "alumni" || session?.user?.role === "admin";

    useEffect(() => {
        if (canRsvp) {
            fetch(`/api/events/${event.id}/attend`)
                .then(res => res.json())
                .then((data: any) => {
                    setIsAttending(data.attending);
                    setIsLoadingAttending(false);
                })
                .catch(() => setIsLoadingAttending(false));
        } else {
            setIsLoadingAttending(false);
        }
    }, [event.id, canRsvp]);

    const handleAttendClick = async () => {
        if (!canRsvp) return;
        setIsPulsing(true);
        try {
            const res = await fetch(`/api/events/${event.id}/attend`, { method: "POST" });
            const data: any = await res.json();

            if (!res.ok) {
                console.error("Failed to RSVP:", data.error);
                alert(`Cannot RSVP: ${data.error}`);
                return;
            }

            setIsAttending(data.attending);
        } catch (e) {
            console.error("Failed to toggle attendance", e);
            alert("Failed to communicate with server.");
        } finally {
            setIsPulsing(false);
        }
    };

    useEffect(() => {
        const calculateTimeLeft = () => {
            const eventDate = new Date(event.event_date);
            if (event.start_time) {
                const [time, modifier] = event.start_time.split(' ');
                const timeParts = time.split(':');
                let hours = timeParts[0];
                const minutes = timeParts[1];
                if (hours === '12') hours = '00';
                if (modifier === 'PM') hours = parseInt(hours, 10) + 12;
                eventDate.setHours(parseInt(hours.toString(), 10));
                eventDate.setMinutes(parseInt(minutes.toString(), 10));
                eventDate.setSeconds(0);
            }

            const difference = eventDate.getTime() - new Date().getTime();

            if (difference > 0) {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    mins: Math.floor((difference / 1000 / 60) % 60),
                    secs: Math.floor((difference / 1000) % 60),
                });
            } else {
                setTimeLeft(null);
            }
        };

        calculateTimeLeft();
        const timer = setInterval(calculateTimeLeft, 1000);

        return () => clearInterval(timer);
    }, [event.event_date, event.start_time]);


    return (
        <div className="break-inside-avoid bg-white dark:bg-gray-900 rounded-[2rem] shadow-lg border border-gray-100 dark:border-gray-800 p-8 flex flex-col relative group hover:shadow-2xl transition-all duration-300 overflow-hidden mb-8">
            {event.banner_image_url && (
                <div
                    className="relative -mt-8 -mx-8 mb-6 h-56 overflow-hidden cursor-pointer group/image"
                    onClick={() => onImageClick(event.banner_image_url)}
                >
                    <Image
                        src={event.banner_image_url}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        unoptimized
                    />
                    <div className="absolute top-6 right-6 z-10">
                        <span className="bg-blue-600/95 text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest shadow-xl backdrop-blur-md">
                            Upcoming
                        </span>
                    </div>
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
                        <svg className="w-10 h-10 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>
            )}
            {/* Header: Title and Show More */}
            <div className="flex justify-between items-start mb-2 gap-4">
                <h3 className="text-[1.75rem] font-bold text-gray-900 dark:text-white leading-tight truncate flex-1">
                    {event.title}
                </h3>
                <Link
                    href={`/events/${event.id}`}
                    className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-semibold transition-colors shrink-0 mt-2 whitespace-nowrap"
                >
                    Show More
                </Link>
            </div>

            {/* Description */}
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 leading-relaxed h-auto">
                {event.description}
            </p>

            {/* Countdown Timer Area */}
            <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-2xl p-6 mb-8 border border-blue-50 dark:border-blue-900/20">
                <div className="flex items-center justify-center gap-2 mb-4 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Time Until Event
                </div>
                <div className="flex justify-center flex-wrap gap-3 sm:gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl py-2 px-3 sm:py-3 sm:px-4 flex-1 min-w-[60px] max-w-[80px] flex flex-col items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700">
                        <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft?.days ?? '0'}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Days</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl py-2 px-3 sm:py-3 sm:px-4 flex-1 min-w-[60px] max-w-[80px] flex flex-col items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700">
                        <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft?.hours ?? '0'}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Hours</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl py-2 px-3 sm:py-3 sm:px-4 flex-1 min-w-[60px] max-w-[80px] flex flex-col items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700">
                        <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft?.mins ?? '0'}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Mins</span>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-xl py-2 px-3 sm:py-3 sm:px-4 flex-1 min-w-[60px] max-w-[80px] flex flex-col items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700">
                        <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400">{timeLeft?.secs ?? '0'}</span>
                        <span className="text-[9px] sm:text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">Secs</span>
                    </div>
                </div>
            </div>

            {/* Event Details List */}
            <div className="space-y-4 mb-6">
                {/* Date & Time */}
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(event.event_date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                        </div>
                        <div className="text-xs text-gray-500">{event.start_time}</div>
                    </div>
                </div>

                {/* Venue */}
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">{event.venue}</div>
                        {event.venueAddress && <div className="text-xs text-gray-500">{event.venueAddress}</div>}
                    </div>
                </div>

                {/* Attendees */}
                <div className="flex items-start gap-3">
                    <div className="text-blue-600 dark:text-blue-400 mt-1">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    </div>
                    <div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            {event.totalBatchmatesCount} batchmates <span className="text-gray-400 font-normal ml-1">• {event.totalAttendeesCount} total attendees</span>
                        </div>
                    </div>
                </div>

                {/* RSVP Deadline */}
                {event.rsvpDeadline && (
                    <div className="flex items-start gap-3">
                        <div className="text-blue-600 dark:text-blue-400 mt-1">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <div>
                            <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                <span className="text-gray-500 font-normal">RSVP by </span>{new Date(event.rsvpDeadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Action Buttons: RSVP & Admin Controls */}
            <div className="mt-8 border-t border-gray-100 dark:border-gray-800 pt-6 flex items-center gap-4">
                {canRsvp && (
                    <div className="flex-1">
                        {isLoadingAttending ? (
                            <div className="h-12 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse w-full"></div>
                        ) : (
                            <button
                                onClick={handleAttendClick}
                                disabled={isPulsing}
                                className={`w-full py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 min-h-[48px] ${isAttending
                                    ? 'bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg text-sm sm:text-base'
                                    } ${isPulsing ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isAttending ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        Attending
                                    </>
                                ) : (
                                    "I am coming to this event"
                                )}
                            </button>
                        )}
                    </div>
                )}

                {session?.user?.role === 'admin' && (
                    <button
                        onClick={() => onDelete(event.id)}
                        disabled={isDeletingId === event.id}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 border border-red-100 dark:border-red-900/30 shrink-0"
                        title="Delete Event"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}
