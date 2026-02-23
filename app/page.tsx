
import Link from "next/link";
import { getDatabase } from "@/lib/db";
export const runtime = 'edge';

async function getStats() {
    try {
        const db = getDatabase();

        // Dynamic Counts from Database
        const alumniResult = await db.prepare('SELECT count(*) as count FROM alumni_profiles').first<{ count: number }>();
        const eventsResult = await db.prepare('SELECT count(*) as count FROM events WHERE is_published = 1').first<{ count: number }>();
        const photoResult = await db.prepare('SELECT count(*) as count FROM memories').first<{ count: number }>();

        // Calculate Attendance (Sum of self + guests for attending status)
        const attendeeResult = await db.prepare(`
            SELECT SUM(1 + number_of_guests) as total 
            FROM event_registrations 
            WHERE attendance_status = 'attending'
        `).first<{ total: number | null }>();

        const currentYear = new Date().getFullYear();
        const batchYear = 2001;

        return {
            alumniCount: alumniResult?.count || 0,
            eventCount: eventsResult?.count || 0,
            photoCount: photoResult?.count || 0,
            attendeeCount: attendeeResult?.total || 0,
            years: currentYear - batchYear,
            jubileeYear: batchYear + 25
        };
    } catch (error) {
        console.error("Error fetching stats:", error);
        return {
            alumniCount: 0,
            eventCount: 0,
            photoCount: 0,
            attendeeCount: 0,
            years: new Date().getFullYear() - 2001,
            jubileeYear: 2026
        };
    }
}

export default async function Home() {
    const stats = await getStats();

    return (
        <div className="flex flex-col min-h-screen transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 dark:from-teal-900 dark:to-blue-950 text-white py-20 lg:py-32">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">

                    <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-full mb-8 animate-fade-in-up">
                        <span className="flex h-2 w-2 relative">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-200 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-300"></span>
                        </span>
                        <span className="text-sm font-medium">CELEBRATING</span>
                        <span className="font-bold text-sm">Silver Jubilee • {stats.years} Years of Excellence</span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 drop-shadow-sm">
                        Welcome Back<br />
                        <span className="text-teal-100">Batch of 2001</span>
                    </h1>

                    <div className="flex items-center justify-center gap-2 mb-8 text-teal-50 dark:text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <span className="text-xl font-medium">Pandit Dindayal Upadhyay Medical College (PDUMC)</span>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                    </div>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-teal-50/90 dark:text-gray-300 mb-10 leading-relaxed">
                        From Medical Students to Healthcare Heroes. <br />
                        {stats.years} years of healing, caring, and making a difference. Time to reunite and celebrate our incredible journey in medicine.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            href="/home"
                            className="px-8 py-4 bg-white text-teal-700 font-bold rounded-full shadow-lg hover:shadow-xl hover:bg-teal-50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                            </svg>
                            Reunion Hub
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                            </svg>
                        </Link>
                        <Link
                            href="/registerProfile"
                            className="px-8 py-4 bg-teal-800/30 backdrop-blur-md border border-teal-200/30 text-white font-bold rounded-full shadow-lg hover:bg-teal-800/50 transition-all transform hover:-translate-y-1 flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Register Your Profile
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-20">
                        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl font-extrabold mb-2">{stats.alumniCount}</div>
                            <div className="text-teal-100 text-sm font-medium uppercase tracking-wider">Medical Professionals</div>
                        </div>
                        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl font-extrabold mb-2">{stats.years}</div>
                            <div className="text-teal-100 text-sm font-medium uppercase tracking-wider">Years of Excellence</div>
                        </div>
                        <div className="bg-white/10 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-xl text-center transform hover:scale-105 transition-transform duration-300">
                            <div className="text-4xl font-extrabold mb-2">{stats.jubileeYear}</div>
                            <div className="text-teal-100 text-sm font-medium uppercase tracking-wider">Silver Jubilee</div>
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 right-0">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="fill-slate-50 dark:fill-gray-950">
                        <path fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,186.7C384,213,480,235,576,213.3C672,192,768,128,864,128C960,128,1056,192,1152,208C1248,224,1344,192,1392,176L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                    </svg>
                </div>
            </section>

            {/* What's Inside Section */}
            <section className="py-20 bg-slate-50 dark:bg-gray-950 transition-colors duration-300">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">What's Inside</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">Everything you need to reconnect and celebrate 25 amazing years</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Find Fellow Doctors</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Connect with your medical professionals from our batch, discover their specializations and current practices</p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Share Your Medical Journey</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Update your profile with your specialization, current practice, and professional achievements over {stats.years} years</p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden group">
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600 dark:text-pink-400 group-hover:scale-110 transition-transform">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Relive Medical College Days</h3>
                                <p className="text-gray-600 dark:text-gray-400 mb-6">Share photos from anatomy labs, hospital rounds, and unforgettable moments that shaped our medical careers</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-blue-600 dark:bg-blue-900 relative overflow-hidden text-center text-white transition-colors duration-300">
                <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-4xl font-bold mb-6">Reunite with Your Medical Family</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Celebrate {stats.years} years of healing, compassion, and lifelong bonds forged in medical college</p>

                    <Link
                        href="/home"
                        className="bg-white text-blue-700 font-bold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all transform hover:-translate-y-1 inline-flex items-center gap-2"
                    >
                        Join the Reunion
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    </Link>
                </div>
            </section>
        </div>
    );
}
