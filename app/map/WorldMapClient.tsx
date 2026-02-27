
"use client";

import { useMemo } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("./MapComponent"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-full bg-gray-100 dark:bg-gray-800 animate-pulse flex items-center justify-center text-gray-400">
            Loading Map...
        </div>
    )
});

interface Alumni {
    id: string;
    name: string;
    city: string | null;
    state: string | null;
    country: string | null;
    position: string | null;
    image_url: string | null;
    latitude: number | null;
    longitude: number | null;
}

interface WorldMapClientProps {
    alumni: Alumni[];
}

export default function WorldMapClient({ alumni }: WorldMapClientProps) {
    // Filter alumni with valid location data
    const locatedAlumni = useMemo(() => {
        return alumni.filter(a => a.country || a.city);
    }, [alumni]);

    // Group by Country
    const alumniByCountry = useMemo(() => {
        const groups: Record<string, Alumni[]> = {};
        locatedAlumni.forEach(a => {
            const country = a.country || "Unknown Location";
            if (!groups[country]) {
                groups[country] = [];
            }
            groups[country].push(a);
        });
        return groups;
    }, [locatedAlumni]);

    // Calculate Stats
    const totalLocations = useMemo(() => {
        const cities = new Set(locatedAlumni.map(a => a.city).filter(Boolean));
        return cities.size;
    }, [locatedAlumni]);

    const totalCountries = Object.keys(alumniByCountry).length;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-12">
            {/* Leaflet Map Section */}
            <div className="relative pt-24 pb-32 px-4 sm:px-6 lg:px-8 overflow-visible z-10">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4 sm:text-5xl lg:text-6xl">
                            Batchmates Around the World
                        </h1>
                        <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400">
                            Discover where your fellow doctors are making a difference.
                        </p>
                    </div>

                    {/* Floating Map Container */}
                    <div className="relative w-full h-[600px] rounded-[2.5rem] shadow-2xl transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] dark:shadow-black/50 overflow-hidden ring-1 ring-gray-900/5 dark:ring-white/10 bg-white dark:bg-gray-800">
                        <MapComponent alumni={locatedAlumni} />
                    </div>

                    {/* Stats Badges */}
                    <div className="mt-12 flex justify-center gap-6">
                        <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalLocations}</span>
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Cities</span>
                        </div>
                        <div className="flex flex-col items-center bg-white dark:bg-gray-800 px-6 py-3 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700">
                            <span className="text-3xl font-bold text-teal-600 dark:text-teal-400">{totalCountries}</span>
                            <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Countries</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Country Cards Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {Object.keys(alumniByCountry).sort().map((country) => (
                        <div key={country} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col max-h-[600px]">
                            {/* Card Header */}
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">{country}</h2>
                                </div>
                                <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded dark:bg-blue-200 dark:text-blue-800">
                                    {alumniByCountry[country].length} batchmates
                                </span>
                            </div>

                            {/* Scrollable List */}
                            <div className="overflow-y-auto p-4 space-y-4 custom-scrollbar flex-grow">
                                {alumniByCountry[country].map((person) => (
                                    <div key={person.id} className="flex items-start space-x-4 p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors group">
                                        <div className="flex-shrink-0">
                                            {person.image_url ? (
                                                <Image
                                                    src={person.image_url}
                                                    alt={person.name}
                                                    width={48}
                                                    height={48}
                                                    className="h-12 w-12 rounded-full object-cover border-2 border-white dark:border-gray-600 shadow-sm"
                                                />
                                            ) : (
                                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                                                    {person.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
                                                {person.name}
                                            </p>
                                            {person.position && (
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate mb-0.5">
                                                    {person.position}
                                                </p>
                                            )}
                                            <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {person.city || "Unknown City"}
                                                {person.state ? `, ${person.state}` : ""}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}

                    {/* Empty State Component if no locations found */}
                    {Object.keys(alumniByCountry).length === 0 && (
                        <div className="col-span-full text-center py-12 bg-white dark:bg-gray-800 rounded-2xl shadow-sm">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">No Locations Data Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Alumni location data will appear here once profiles are updated.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
