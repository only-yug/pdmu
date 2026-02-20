"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Alumni {
    id: string;
    roll_number: number | null;
    first_name: string;
    last_name: string;
    current_city: string | null;
    specialization: string | null;
    profile_photo_url: string | null;
    status: 'unclaimed' | 'claimed' | 'self-registered';
    isAttending?: boolean;
}

export default function AlumniGrid({ initialAlumni }: { initialAlumni: Alumni[] }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("All Batchmates");
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    // Filter logic
    const filteredAlumni = initialAlumni.filter((alum) => {
        // Search Filter
        const fullName = `${alum.first_name} ${alum.last_name}`.toLowerCase();
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            fullName.includes(searchLower) ||
            (alum.roll_number !== null ? String(alum.roll_number).includes(searchLower) : false) ||
            (alum.specialization?.toLowerCase() || "").includes(searchLower) ||
            (alum.current_city?.toLowerCase() || "").includes(searchLower);

        // Dropdown Filter
        let matchesFilter = true;
        if (filterType === "Registered") {
            matchesFilter = alum.status === 'claimed' || alum.status === 'self-registered';
        } else if (filterType === "Not Registered") {
            matchesFilter = alum.status === 'unclaimed';
        } else if (filterType === "Attending Reunion") {
            matchesFilter = alum.isAttending === true;
        }

        return matchesSearch && matchesFilter;
    });

    const filterOptions = ["All Batchmates", "Registered", "Not Registered", "Attending Reunion"];

    return (
        <div>
            {/* Search and Filters */}
            <div className="-mt-24 relative z-10 mx-auto max-w-5xl px-4 sm:px-6">
                {/* Stats / Results Count */}
                <div className="mb-2 flex justify-between items-center px-2">
                    <p className="text-sm text-blue-100/90 font-medium">
                        Showing {filteredAlumni.length} of {initialAlumni.length} batchmates
                    </p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 flex flex-col md:flex-row items-center gap-2 border border-gray-100 dark:border-gray-700">

                    {/* Search Input */}
                    <div className="relative flex-grow w-full md:w-auto">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-11 pr-4 py-3.5 border-none rounded-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-500 focus:ring-0 sm:text-sm"
                            placeholder="Search by name, roll number, city, or specialization..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Divider (Desktop) */}
                    <div className="hidden md:block w-px h-8 bg-gray-200 dark:bg-gray-600 mx-2"></div>

                    {/* Divider (Mobile) */}
                    <div className="md:hidden w-full h-px bg-gray-200 dark:bg-gray-600 my-1"></div>

                    {/* Dropdown Filter */}
                    <div className="relative w-full md:w-64">
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className="w-full flex items-center justify-between bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-3.5 px-4 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <span className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                                </svg>
                                {filterType}
                            </span>
                            <svg className={`h-4 w-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {isDropdownOpen && (
                            <div className="absolute top-full right-0 mt-2 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 py-1 z-50 overflow-hidden">
                                {filterOptions.map((option) => (
                                    <button
                                        key={option}
                                        onClick={() => {
                                            setFilterType(option);
                                            setIsDropdownOpen(false);
                                        }}
                                        className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${filterType === option
                                            ? "text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20 font-semibold"
                                            : "text-gray-700 dark:text-gray-200"
                                            }`}
                                    >
                                        {option}
                                        {filterType === option && (
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>


            </div>

            {/* Results Grid */}
            <div className="mt-12">
                {filteredAlumni.length === 0 && (
                    <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700 max-w-4xl mx-auto">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No batchmates found</h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Try adjusting your search or filters to find who you're looking for.
                        </p>
                        <button
                            onClick={() => { setSearchTerm(""); setFilterType("All Batchmates"); }}
                            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 transition-colors"
                        >
                            Clear All Filters
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredAlumni.map((alum) => (
                        <div key={alum.id} className="group bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 dark:border-gray-700 flex flex-col">
                            {/* Card Header & Avatar */}
                            <div className="relative h-24 bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-700 dark:to-indigo-800">
                                {alum.status === 'claimed' && (
                                    <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Verified
                                    </div>
                                )}
                            </div>

                            <div className="px-5 pt-0 pb-6 flex-grow flex flex-col items-center -mt-12 text-center relative z-10">
                                <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 shadow-md bg-gray-100 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-400 group-hover:scale-105 transition-transform duration-300 mb-3">
                                    {alum.profile_photo_url ? (
                                        <Image
                                            src={alum.profile_photo_url}
                                            alt={alum.first_name}
                                            width={96}
                                            height={96}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 dark:text-gray-500 capitalize">
                                            {alum.first_name[0]}{alum.last_name[0]}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                                    {alum.first_name} {alum.last_name}
                                </h3>

                                <div className="text-blue-600 dark:text-blue-400 font-medium text-sm mb-3">
                                    {alum.specialization || "Doctor"}
                                </div>

                                <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400 text-sm mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {alum.current_city || "Unknown Location"}
                                </div>

                                <div className="mt-auto w-full pt-4 border-t border-gray-100 dark:border-gray-700/50">
                                    {alum.status === 'unclaimed' ? (
                                        <Link
                                            href={`/registerProfile?claim=${alum.id}`}
                                            className="block w-full py-2 px-4 rounded-xl bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 text-sm font-semibold transition-colors"
                                        >
                                            Is this you? Claim Profile
                                        </Link>
                                    ) : (
                                        <Link
                                            href={`/alumni/${alum.id}`}
                                            className="block w-full py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-colors shadow-lg shadow-blue-200 dark:shadow-none"
                                        >
                                            View Full Profile
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
