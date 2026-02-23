import { notFound } from "next/navigation";
import { getDrizzleDb } from "@/lib/db";
import { eq } from "drizzle-orm";
import { alumniProfiles } from "@/lib/db/schema";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";

export const runtime = 'edge';

async function getAlumniProfile(id: string) {
    try {
        const db = getDrizzleDb();
        const profile = await db
            .select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.id, id))
            .limit(1)
            .get();
        return profile || null;
    } catch (e) {
        console.error("Failed to fetch alumni profile:", e);
        return null;
    }
}

export default async function AlumniProfilePage({ params }: { params: { id: string } }) {
    const session = await auth();
    const isAuthorized = !!session?.user?.alumniProfileId;

    if (!isAuthorized) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Access Restricted</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-8">
                        Detailed personal profiles are securely restricted. You must be logged in as a verified batchmate to view this information.
                    </p>
                    <Link
                        href="/alumni"
                        className="inline-flex w-full items-center justify-center px-6 py-3 border border-transparent text-base font-bold rounded-xl shadow-sm text-white bg-blue-600 hover:bg-blue-700 bg-gradient-to-r hover:from-blue-600 hover:to-blue-700 transition-all active:scale-[0.98]"
                    >
                        Return to Batchmates
                    </Link>
                </div>
            </div>
        );
    }

    const profile = await getAlumniProfile(params.id);

    if (!profile) {
        return notFound();
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300 pt-6 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <Link href="/alumni" className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mb-6 font-medium transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Batchmates
                </Link>

                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
                    {/* Header Banner */}
                    <div className="h-48 bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 relative">
                        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20" />
                    </div>

                    <div className="px-8 pb-8">
                        {/* Profile Info Header */}
                        <div className="relative flex justify-between items-end -mt-20 z-10 sm:flex-row flex-col sm:items-end items-center text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                <div className="w-40 h-40 rounded-full border-4 border-white dark:border-gray-900 shadow-2xl bg-gray-100 dark:bg-gray-800 overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                    {profile.profilePhotoUrl ? (
                                        <Image
                                            src={profile.profilePhotoUrl}
                                            alt={profile.fullName}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <span className="text-4xl text-gray-400 capitalize">
                                            {profile.fullName.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </span>
                                    )}
                                </div>
                                <div className="mt-4 sm:mt-16">
                                    <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                                        {profile.fullName}
                                    </h1>
                                    <div className="text-xl text-blue-600 dark:text-blue-400 font-medium mt-1">
                                        {profile.specialization || "Doctor"}
                                    </div>
                                </div>
                            </div>
                            {profile.isAttending === 'attending' && (
                                <div className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-4 py-2 rounded-full font-bold shadow-sm">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                    Attending Reunion
                                </div>
                            )}
                        </div>

                        {/* Content Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">

                            {/* Left Column: Contact & Basic Info */}
                            <div className="space-y-6 md:col-span-1">
                                <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact Details</h3>
                                    <ul className="space-y-4">
                                        {profile.email && (
                                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                </svg>
                                                <a href={`mailto:${profile.email}`} className="hover:text-blue-600 font-medium transition-colors break-all">
                                                    {profile.email}
                                                </a>
                                            </li>
                                        )}
                                        {profile.phoneNumber && (
                                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                                </svg>
                                                <a href={`tel:${profile.phoneNumber}`} className="hover:text-blue-600 font-medium transition-colors">
                                                    {profile.phoneNumber}
                                                </a>
                                            </li>
                                        )}
                                        {profile.whatsappNumber && (
                                            <li className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                                                <svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                                </svg>
                                                <a href={`https://wa.me/${profile.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-green-600 font-medium transition-colors">
                                                    WhatsApp
                                                </a>
                                            </li>
                                        )}
                                        {(profile.city || profile.state || profile.country) && (
                                            <li className="flex items-start gap-3 text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">
                                                <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                <span>
                                                    {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {(profile.linkedinUrl || profile.instagramHandle || profile.facebookUrl) && (
                                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 items-center justify-between">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Links</h3>
                                        <div className="flex gap-4">
                                            {profile.linkedinUrl && (
                                                <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-600 transition-colors">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {profile.instagramHandle && (
                                                <a href={`https://instagram.com/${profile.instagramHandle.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-pink-600 transition-colors">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                                    </svg>
                                                </a>
                                            )}
                                            {profile.facebookUrl && (
                                                <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-blue-800 transition-colors">
                                                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                                    </svg>
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Right Column: Bio & Professional Info */}
                            <div className="space-y-8 md:col-span-2">
                                {/* Professional Info */}
                                <div className="space-y-4 pt-2">
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                        <svg className="w-6 h-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        Professional Life
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {profile.currentDesignation && (
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Designation</div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{profile.currentDesignation}</div>
                                            </div>
                                        )}
                                        {profile.workplace && (
                                            <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                                                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Workplace</div>
                                                <div className="font-semibold text-gray-900 dark:text-white">{profile.workplace}</div>
                                            </div>
                                        )}
                                    </div>
                                    {(!profile.currentDesignation && !profile.workplace) && (
                                        <div className="text-gray-500 dark:text-gray-400 italic">No professional information provided.</div>
                                    )}
                                </div>

                                {/* Journey */}
                                {profile.bioJourney && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Life Journey</h3>
                                        <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap bg-blue-50/50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100/50 dark:border-blue-800/30">
                                            {profile.bioJourney}
                                        </div>
                                    </div>
                                )}

                                {/* Memories */}
                                {profile.favoriteMemories && (
                                    <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">Favorite College Memories</h3>
                                        <div className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                            "{profile.favoriteMemories}"
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
