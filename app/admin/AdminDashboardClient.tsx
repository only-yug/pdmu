"use client";

import { useState } from "react";

interface Stats {
    totalAlumni: number;
    registeredAlumni: number;
    attendingAlumni: number;
    totalEvents: number;
    totalMemories: number;
    totalHotels: number;
    totalUsers: number;
    totalAdults: number;
    totalKids: number;
}

interface Alumni {
    id: string;
    fullName: string;
    email: string;
    rollNumber: number | null;
    userId: string | null;
    city: string | null;
    country: string | null;
    specialization: string | null;
    rsvpAdults: number | null;
    rsvpKids: number | null;
}

interface Event {
    id: string;
    title: string;
    description: string | null;
    eventStartDate: Date;
    eventEndDate: Date | null;
    venueName: string;
}

interface Hotel {
    id: string;
    hotelName: string;
    description: string | null;
    websiteUrl: string;
    userId: string | null;
    createdAt: Date;
}

type Tab = "overview" | "alumni" | "events" | "hotels";

export default function AdminDashboardClient({
    stats,
    alumniList,
    eventList,
    hotelList,
}: {
    stats: Stats;
    alumniList: Alumni[];
    eventList: Event[];
    hotelList: Hotel[];
}) {
    const [activeTab, setActiveTab] = useState<Tab>("overview");
    const [showEventForm, setShowEventForm] = useState(false);
    const [showHotelForm, setShowHotelForm] = useState(false);
    const [eventFormMsg, setEventFormMsg] = useState<string | null>(null);
    const [hotelFormMsg, setHotelFormMsg] = useState<string | null>(null);

    const tabs: { key: Tab; label: string }[] = [
        { key: "overview", label: "Overview" },
        { key: "alumni", label: "Alumni" },
        { key: "events", label: "Events" },
        { key: "hotels", label: "Hotels" },
    ];

    // Event creation
    const handleCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = {
            title: fd.get("title"),
            description: fd.get("description"),
            eventStartDate: fd.get("eventStartDate"),
            eventEndDate: fd.get("eventEndDate") || undefined,
            venueName: fd.get("venueName"),
            venueAddress: fd.get("venueAddress"),
        };

        try {
            const res = await fetch("/api/events", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json() as Record<string, any>;
            if (res.ok) {
                setEventFormMsg("Event created! Refresh to see changes.");
                setShowEventForm(false);
            } else {
                setEventFormMsg(data.error || "Failed to create event");
            }
        } catch {
            setEventFormMsg("Network error");
        }
    };

    // Hotel creation
    const handleCreateHotel = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload = {
            name: fd.get("name"),
            description: fd.get("description"),
            website_url: fd.get("website_url"),
        };

        try {
            const res = await fetch("/api/hotels/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await res.json() as Record<string, any>;
            if (res.ok) {
                setHotelFormMsg("Hotel added! Refresh to see changes.");
                setShowHotelForm(false);
            } else {
                setHotelFormMsg(data.error || data.message || "Failed");
            }
        } catch {
            setHotelFormMsg("Network error");
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Overview */}
            {activeTab === "overview" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard label="Total Alumni" value={stats.totalAlumni} color="indigo" />
                    <StatCard label="Registered" value={stats.registeredAlumni} color="green" />
                    <StatCard label="Attending" value={stats.attendingAlumni} color="blue" />
                    <StatCard label="Total Users" value={stats.totalUsers} color="purple" />
                    <StatCard label="Total Adults" value={stats.totalAdults} color="teal" />
                    <StatCard label="Total Kids" value={stats.totalKids} color="pink" />
                    <StatCard label="Events" value={stats.totalEvents} color="orange" />
                    <StatCard label="Memories" value={stats.totalMemories} color="rose" />
                    <StatCard label="Hotels" value={stats.totalHotels} color="cyan" />
                </div>
            )}

            {/* Alumni */}
            {activeTab === "alumni" && (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-gray-800">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Name</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Email</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Roll#</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Location</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">Status</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-600 dark:text-gray-400">RSVP</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {alumniList.map((a) => (
                                    <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{a.fullName}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.email}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.rollNumber || "—"}</td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {[a.city, a.country].filter(Boolean).join(", ") || "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${a.userId
                                                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
                                                : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                                }`}>
                                                {a.userId ? "Claimed" : "Unclaimed"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {(a.rsvpAdults || 0) > 0
                                                ? `${a.rsvpAdults}A ${a.rsvpKids || 0}K`
                                                : "—"}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Events */}
            {activeTab === "events" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Events</h2>
                        <button
                            onClick={() => setShowEventForm(!showEventForm)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            {showEventForm ? "Cancel" : "+ New Event"}
                        </button>
                    </div>

                    {eventFormMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
                            {eventFormMsg}
                        </div>
                    )}

                    {showEventForm && (
                        <form onSubmit={handleCreateEvent} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 space-y-4">
                            <FormInput name="title" label="Title" required />
                            <FormInput name="description" label="Description" />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormInput name="eventStartDate" label="Start Date" type="datetime-local" required />
                                <FormInput name="eventEndDate" label="End Date" type="datetime-local" />
                            </div>
                            <FormInput name="venueName" label="Venue Name" required />
                            <FormInput name="venueAddress" label="Venue Address" />
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                Create Event
                            </button>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {eventList.map((ev) => (
                            <div key={ev.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{ev.title}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{ev.description || "No description"}</p>
                                <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                                    <span>📅 {new Date(ev.eventStartDate).toLocaleDateString()}</span>
                                    <span>📍 {ev.venueName}</span>
                                </div>
                            </div>
                        ))}
                        {eventList.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No events yet</p>
                        )}
                    </div>
                </div>
            )}

            {/* Hotels */}
            {activeTab === "hotels" && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Hotels</h2>
                        <button
                            onClick={() => setShowHotelForm(!showHotelForm)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors"
                        >
                            {showHotelForm ? "Cancel" : "+ Add Hotel"}
                        </button>
                    </div>

                    {hotelFormMsg && (
                        <div className="mb-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
                            {hotelFormMsg}
                        </div>
                    )}

                    {showHotelForm && (
                        <form onSubmit={handleCreateHotel} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6 mb-6 space-y-4">
                            <FormInput name="name" label="Hotel Name" required />
                            <FormInput name="description" label="Description" />
                            <FormInput name="website_url" label="Website URL" required />
                            <button type="submit" className="px-6 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                                Add Hotel
                            </button>
                        </form>
                    )}

                    <div className="grid gap-4">
                        {hotelList.map((h) => (
                            <div key={h.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{h.hotelName}</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{h.description || "No description"}</p>
                                <a href={h.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline mt-2 inline-block">
                                    {h.websiteUrl}
                                </a>
                            </div>
                        ))}
                        {hotelList.length === 0 && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No hotels yet</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
    const colorMap: Record<string, string> = {
        indigo: "from-indigo-500 to-indigo-600",
        green: "from-green-500 to-green-600",
        blue: "from-blue-500 to-blue-600",
        purple: "from-purple-500 to-purple-600",
        teal: "from-teal-500 to-teal-600",
        pink: "from-pink-500 to-pink-600",
        orange: "from-orange-500 to-orange-600",
        rose: "from-rose-500 to-rose-600",
        cyan: "from-cyan-500 to-cyan-600",
    };

    return (
        <div className={`bg-gradient-to-br ${colorMap[color] || colorMap.indigo} rounded-xl p-5 text-white shadow-lg`}>
            <p className="text-white/80 text-xs font-medium uppercase tracking-wider">{label}</p>
            <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
    );
}

function FormInput({ name, label, type = "text", required = false }: { name: string; label: string; type?: string; required?: boolean }) {
    return (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {label} {required && <span className="text-red-400">*</span>}
            </label>
            <input
                id={name}
                name={name}
                type={type}
                required={required}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
        </div>
    );
}
