
"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
    const pathname = usePathname();

    // Hide Footer on auth pages
    if (pathname === '/login' || pathname === '/register') {
        return null;
    }
    return (
        <footer className="bg-blue-600 text-white py-8 mt-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-4">

                    {/* Left: Location */}
                    <div className="flex items-center gap-2 text-sm text-blue-100">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span>Pandit Dindayal Upadhyay Medical College, Rajkot, Gujarat, India</span>
                    </div>

                    {/* Right: Copyright */}
                    <div className="text-sm text-blue-200">
                        <div className="flex items-center justify-center md:justify-end gap-1">
                            <span>Batch of 2001 • Silver Jubilee Reunion 2026</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-pink-300 animate-pulse" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <p className="mt-1 text-xs opacity-70">© 2026 PDUMC Alumni Association</p>
                    </div>

                </div>
            </div>
        </footer>
    );
}
