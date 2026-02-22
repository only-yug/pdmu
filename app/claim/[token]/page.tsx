import { getDrizzleDb } from "@/lib/db";
import { claimTokens, alumniProfiles } from "@/lib/db/schema";
import { eq, and, getTableColumns } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";

export const runtime = 'edge';

export default async function ClaimProfilePage({ params }: { params: { token: string } }) {
    const db = getDrizzleDb();
    const tokenStr = params.token;

    // Look up the token
    const tokenRecord = await db.select()
        .from(claimTokens)
        .where(eq(claimTokens.tokenHash, tokenStr))
        .get();

    // Validate token exists, is unused, and not expired
    if (!tokenRecord || tokenRecord.isUsed) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-red-100 dark:border-red-900/30">
                    <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Invalid or Expired Link</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This claim link is no longer valid or has already been used. Please contact the administrator for a new link.
                    </p>
                    <Link href="/login" className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-orange-100 dark:border-orange-900/30">
                    <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Link Expired</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This claim link has expired. For security reasons, links are only valid for 7 days.
                    </p>
                    <Link href="/login" className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Return to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Fetch the alumni profile
    const profile = await db.select()
        .from(alumniProfiles)
        .where(eq(alumniProfiles.id, tokenRecord.alumniId))
        .get();

    if (!profile) {
        notFound();
    }

    // If profile is already claimed somehow
    if (profile.userId) {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex items-center justify-center p-4">
                <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 text-center border border-blue-100 dark:border-blue-900/30">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile Already Claimed</h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        This alumni profile has already been claimed by a user.
                    </p>
                    <Link href="/login" className="inline-block px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors">
                        Sign In
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorations */}
            <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-indigo-400/20 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="max-w-lg w-full bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden relative z-10 animate-fade-in border border-gray-100 dark:border-gray-800">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-center text-white">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl border border-white/30">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black mb-1">Welcome back!</h1>
                    <p className="text-blue-100 font-medium">PDUMC 2001 Batch Reunion</p>
                </div>

                <div className="p-8">
                    <p className="text-center text-gray-600 dark:text-gray-300 font-medium mb-6">
                        Your alumni profile has been pre-loaded into the system. Please verify your details below and create an account to claim it.
                    </p>

                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 mb-8 border border-gray-100 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">
                            Profile Details
                        </h3>
                        <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                            <div className="sm:col-span-2">
                                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Full Name</dt>
                                <dd className="mt-1 text-base text-gray-900 dark:text-white font-medium">{profile.fullName}</dd>
                            </div>
                            {profile.rollNumber && (
                                <div>
                                    <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Roll Number</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">{profile.rollNumber}</dd>
                                </div>
                            )}
                            <div>
                                <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Email Address</dt>
                                <dd className="mt-1 text-sm text-gray-900 dark:text-white break-all">{profile.email}</dd>
                            </div>
                            {(profile.city || profile.country) && (
                                <div className="sm:col-span-2">
                                    <dt className="text-xs font-bold uppercase tracking-wider text-gray-500">Location</dt>
                                    <dd className="mt-1 text-sm text-gray-900 dark:text-white">
                                        {[profile.city, profile.state, profile.country].filter(Boolean).join(", ")}
                                    </dd>
                                </div>
                            )}
                        </dl>
                    </div>

                    <Link
                        href={`/register?claimToken=${tokenStr}`}
                        className="w-full flex justify-center items-center h-14 bg-[#111827] dark:bg-blue-600 hover:bg-black dark:hover:bg-blue-700 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-gray-300/50 dark:shadow-none active:scale-[0.98]"
                    >
                        Create Account to Claim Profile
                    </Link>
                    <p className="text-center text-xs text-gray-500 mt-4">
                        Already registered with another email? <Link href="/login" className="text-blue-600 dark:text-blue-400 font-bold hover:underline">Log in</Link> instead.
                    </p>
                </div>
            </div>
        </div>
    );
}
