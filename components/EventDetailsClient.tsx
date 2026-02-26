"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import ImageModal from "./ImageModal";
import Link from "next/link";

interface EventDetailsClientProps {
    event: any;
    attendeesCount: number;
}

export default function EventDetailsClient({ event, attendeesCount }: EventDetailsClientProps) {
    const [timeLeft, setTimeLeft] = useState<{ days: number, hours: number, mins: number, secs: number } | null>(null);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    useEffect(() => {
        const calculateTimeLeft = () => {
            const eventDate = new Date(event.eventStartDate);
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
    }, [event.eventStartDate]);

    const eventDate = event.eventStartDate ? new Date(event.eventStartDate) : null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden transform transition-all">
            {/* Banner Section */}
            {event.bannerImageUrl && (
                <div
                    className="relative w-full h-[300px] md:h-[450px] overflow-hidden cursor-pointer group"
                    onClick={() => setSelectedImage(event.bannerImageUrl)}
                >
                    <Image
                        src={event.bannerImageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                        unoptimized
                    />
                    <div className="absolute top-6 left-6">
                        <div className="bg-black/50 backdrop-blur-md p-2 rounded-xl border border-white/20">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    </div>
                    <div className="absolute top-6 right-6">
                        <span className="bg-blue-600/90 backdrop-blur-md text-white text-[10px] font-bold px-4 py-2 rounded-full uppercase tracking-widest shadow-xl">
                            Upcoming
                        </span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                </div>
            )}

            <div className="p-8 md:p-12">
                {/* Header: Title and Show More/Less */}
                <div className="flex justify-between items-start mb-6 gap-6">
                    <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
                        {event.title}
                    </h1>
                    <Link
                        href="/events"
                        className="text-gray-400 hover:text-blue-600 text-xs font-bold transition-colors shrink-0 mt-3 flex items-center gap-1 uppercase tracking-wider"
                    >
                        Show Less
                    </Link>
                </div>

                {/* Description */}
                {event.description && (
                    <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed mb-10 whitespace-pre-wrap">
                        {event.description}
                    </p>
                )}

                {/* Countdown Timer Area */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 rounded-3xl p-8 mb-10 border border-blue-100 dark:border-blue-900/20">
                    <div className="flex items-center justify-center gap-2 mb-6 text-blue-600 dark:text-blue-400 font-bold text-sm uppercase tracking-widest">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Time Until Event
                    </div>
                    <div className="flex justify-center flex-wrap gap-4 md:gap-8">
                        <CountdownUnit value={timeLeft?.days ?? 0} label="Days" />
                        <CountdownUnit value={timeLeft?.hours ?? 0} label="Hours" />
                        <CountdownUnit value={timeLeft?.mins ?? 0} label="Mins" />
                        <CountdownUnit value={timeLeft?.secs ?? 0} label="Secs" />
                    </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="space-y-6">
                        <DetailItem
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                            label="Date & Time"
                            value={eventDate?.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) ?? "TBA"}
                        />
                        <DetailItem
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                            label="Venue"
                            value={event.venueName}
                            subValue={event.venueAddress}
                        />
                    </div>
                    <div className="space-y-6">
                        <DetailItem
                            icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                            label="Attendees"
                            value={`${attendeesCount} batchmates registered`}
                        />
                        {event.rsvpDeadline && (
                            <DetailItem
                                icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                                label="RSVP Deadline"
                                value={new Date(event.rsvpDeadline).toLocaleDateString()}
                            />
                        )}
                    </div>
                </div>
            </div>

            <ImageModal
                src={selectedImage || ""}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl py-6 px-4 w-28 flex flex-col items-center justify-center shadow-sm border border-gray-50 dark:border-gray-700">
            <span className="text-4xl font-black text-blue-600 dark:text-blue-400">{value}</span>
            <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mt-2">{label}</span>
        </div>
    );
}

function DetailItem({ icon, label, value, subValue }: { icon: React.ReactNode; label: string; value: string; subValue?: string | null }) {
    return (
        <div className="flex items-start gap-4">
            <div className="text-blue-600 dark:text-blue-400 mt-1 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
                {icon}
            </div>
            <div>
                <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</span>
                <p className="text-gray-900 dark:text-white font-bold">{value}</p>
                {subValue && <p className="text-sm text-gray-500 mt-1">{subValue}</p>}
            </div>
        </div>
    );
}
