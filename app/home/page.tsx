import Link from "next/link";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { sql, gt } from "drizzle-orm";

export const runtime = 'edge';

async function getReunionStats() {
    try {
        const db = getDrizzleDb();

        // Total Batchmates
        const alumniResult = await db.select({ count: sql<number>`count(*)` })
            .from(alumniProfiles);
        const alumniCount = Number(alumniResult[0]?.count) || 0;

        // RSVPs: alumni who have set rsvpAdults > 0
        const rsvpResult = await db.select({ count: sql<number>`count(*)` })
            .from(alumniProfiles)
            .where(gt(alumniProfiles.rsvpAdults, 0));
        const rsvpCount = Number(rsvpResult[0]?.count) || 0;

        // Total Adults + Kids from RSVP data
        const attendeeResult = await db.select({
            adults: sql<number>`sum(${alumniProfiles.rsvpAdults})`,
            kids: sql<number>`sum(${alumniProfiles.rsvpKids})`,
        })
            .from(alumniProfiles)
            .where(gt(alumniProfiles.rsvpAdults, 0));

        const adults = Number(attendeeResult[0]?.adults) || 0;
        const kids = Number(attendeeResult[0]?.kids) || 0;

        const currentYear = new Date().getFullYear();
        const batchYear = 2001;

        return {
            alumniCount,
            rsvpCount,
            attendeeCount: adults + kids,
            adults,
            kids,
            years: currentYear - batchYear,
            collegeName: "Pandit Dindayal Upadhyay Medical College",
            location: "Rajkot, Gujarat, India"
        };
    } catch (error) {
        console.error("Error fetching reunion stats:", error);
        return {
            alumniCount: 0,
            rsvpCount: 0,
            attendeeCount: 0,
            adults: 0,
            kids: 0,
            years: new Date().getFullYear() - 2001,
            collegeName: "Pandit Dindayal Upadhyay Medical College",
            location: "Rajkot, Gujarat, India"
        };
    }
}

export default async function ReunionHubPage() {
    const stats = await getReunionStats();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full -z-10">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 dark:bg-blue-900/20 blur-[120px] rounded-full"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-100/50 dark:bg-purple-900/20 blur-[120px] rounded-full"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full mb-8 shadow-sm">
                        <span className="text-blue-600 dark:text-blue-400">✨</span>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 uppercase tracking-wider">25 Years of Memories</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold text-gray-950 dark:text-white mb-6 tracking-tight">
                        {stats.collegeName}
                    </h1>

                    <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 mb-4 font-medium">
                        Batch of 2001 • Silver Jubilee Reunion
                    </p>

                    <p className="text-lg text-gray-500 dark:text-gray-500 mb-12 flex items-center justify-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {stats.location}
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-24">
                        <Link
                            href="/alumni"
                            className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl shadow-xl shadow-blue-200 dark:shadow-none hover:bg-blue-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            Find Batchmates
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/memories"
                            className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 font-bold rounded-2xl shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                            </svg>
                            Share Memories
                        </Link>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-16">
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{stats.alumniCount}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">Total Batchmates</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{stats.rsvpCount}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">RSVPs</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{stats.attendeeCount}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">Total Attendees</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">{stats.adults} + {stats.kids}</div>
                            <div className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em]">Adults + Kids</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Reconnect Section */}
            <section className="py-24 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">Reconnect with Your Batch</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-lg">Find your old friends, update your profile, and relive the golden days</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Claim Card */}
                        <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/50 dark:bg-blue-900/20 blur-3xl -mr-16 -mt-16 group-hover:bg-blue-200/50 transition-colors"></div>
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mb-8 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path d="M12 14l9-5-9-5-9 5 9 5z" /><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Claim Your Profile</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Find your name in the batch list and update your profile with current information
                            </p>
                            <Link href="/registerProfile" className="text-blue-600 dark:text-blue-400 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all">
                                Get Started <span className="text-xl">→</span>
                            </Link>
                        </div>

                        {/* Find Card */}
                        <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative border-2 border-transparent hover:border-blue-100 dark:hover:border-blue-900/30">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-100/50 dark:bg-teal-900/20 blur-3xl -mr-16 -mt-16 group-hover:bg-teal-200/50 transition-colors"></div>
                            <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-2xl flex items-center justify-center mb-8 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Find Batchmates</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Browse through all {stats.alumniCount} batchmates and see where they are now
                            </p>
                            <Link href="/alumni" className="text-teal-600 dark:text-teal-400 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all">
                                Explore <span className="text-xl">→</span>
                            </Link>
                        </div>

                        {/* Share Card */}
                        <div className="bg-white dark:bg-gray-900 p-10 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all group overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-100/50 dark:bg-purple-900/20 blur-3xl -mr-16 -mt-16 group-hover:bg-purple-200/50 transition-colors"></div>
                            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/50 rounded-2xl flex items-center justify-center mb-8 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Share Memories</h3>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                                Upload old photos and share your favorite memories from college days
                            </p>
                            <Link href="/memories" className="text-purple-600 dark:text-purple-400 font-bold inline-flex items-center gap-2 hover:gap-3 transition-all">
                                Upload Photo <span className="text-xl">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="relative bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 rounded-[3rem] p-12 md:p-20 overflow-hidden shadow-2xl shadow-blue-200 dark:shadow-none">
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 mb-8">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Don't Miss the Reunion!</h2>
                            <p className="text-xl text-blue-50 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
                                Register your attendance and help us plan the biggest reunion our College has ever seen
                            </p>
                            <Link
                                href="/registerProfile"
                                className="px-12 py-5 bg-white text-blue-700 font-black text-xl rounded-2xl shadow-xl hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                            >
                                Register Now
                                <span className="text-2xl">→</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Mini Footer */}
            <footer className="py-12 border-t border-gray-100 dark:border-gray-800">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        {stats.collegeName}, Rajkot, Gujarat, India
                    </div>
                    <div className="text-sm text-gray-400 dark:text-gray-600">
                        Batch of 2001 • Silver Jubilee Reunion 2026
                    </div>
                </div>
            </footer>
        </div>
    );
}
