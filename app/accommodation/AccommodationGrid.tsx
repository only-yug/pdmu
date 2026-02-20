
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Hotel {
    id: string | number;
    name: string;
    description: string | null;
    website_url: string;
    guest_count: number;
}

export default function AccommodationGrid({ initialHotels }: { initialHotels: Hotel[] }) {
    const [hotels, setHotels] = useState(initialHotels);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Form State
    const [hotelName, setHotelName] = useState("");
    const [description, setDescription] = useState("");
    const [websiteUrl, setWebsiteUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch("/api/hotels/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: hotelName, description, website_url: websiteUrl }),
            });

            if (response.ok) {
                router.refresh();
                setIsModalOpen(false);
                setHotelName("");
                setDescription("");
                setWebsiteUrl("");
                alert("Thank you for your suggestion! An admin will review it soon.");
            } else {
                alert("Failed to suggest hotel");
            }
        } catch (error) {
            console.error("Error suggesting hotel:", error);
            alert("An error occurred");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="container mx-auto px-6 lg:px-20 py-8 relative">
            {/* Header / Hero Section */}
            <div className="text-center mb-8 pt-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/10 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1m-1 4h1" />
                    </svg>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Accommodation</h1>
                <p className="text-lg text-blue-100 mb-6 font-light">Suggested hotels near the reunion venue for your comfortable stay</p>

                <div className="inline-flex items-center gap-2 bg-pink-500/20 backdrop-blur-md border border-pink-500/30 px-3 py-1.5 rounded-full text-pink-100 text-xs font-medium mb-6">
                    <span>🎉</span> Contracted rates coming soon!
                </div>

                <div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white text-blue-600 px-5 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 mx-auto text-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                        </svg>
                        Suggest Hotel
                    </button>
                </div>
            </div>

            {/* Grid */}
            {hotels.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                    {hotels.map((hotel) => (
                        <div key={hotel.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col h-full border border-gray-100 dark:border-gray-700 p-6">
                            {/* Icon */}
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1m-1 4h1" />
                                </svg>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{hotel.name}</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 flex-grow">{hotel.description}</p>

                            {/* Badge */}
                            <div className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1.5 rounded-md text-xs font-medium mb-4 w-full text-center">
                                {hotel.guest_count} batchmate{hotel.guest_count !== 1 ? 's' : ''} staying here
                            </div>

                            <a
                                href={hotel.website_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-2.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold text-center transition-colors shadow-lg shadow-blue-200 dark:shadow-none mb-0 mt-auto flex items-center justify-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                Visit Website
                            </a>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 mb-12 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100/20 text-blue-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m-1 4h1m-1 4h1m5-12h1m-1 4h1m-1 4h1m-1 4h1" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">No Hotels Suggested Yet</h3>
                    <p className="text-blue-100">Be the first to suggest a hotel for the reunion!</p>
                </div>
            )}

            {/* Need Help Banner */}
            <div className="bg-blue-500/20 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 text-center md:text-left flex flex-col md:flex-row items-center gap-6 text-white mb-8">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </div>
                <div>
                    <h3 className="text-lg font-bold mb-1">Need Help with Booking?</h3>
                    <p className="text-blue-100 text-sm">For assistance, please contact the reunion organizing committee.</p>
                </div>
                <div className="md:ml-auto">
                    <button className="bg-blue-800/50 hover:bg-blue-800 text-white px-5 py-2.5 rounded-lg font-medium transition-colors text-sm border border-blue-700">
                        Contact Committee
                    </button>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity backdrop-filter backdrop-blur-sm" aria-hidden="true" onClick={() => setIsModalOpen(false)}></div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg w-full border border-gray-100 dark:border-gray-700">
                            <div className="bg-white dark:bg-gray-800 px-6 pt-6 pb-6">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white" id="modal-title">
                                        Suggest a Hotel
                                    </h3>
                                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500 focus:outline-none bg-gray-100 dark:bg-gray-700 p-1 rounded-full transition-colors">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                <form onSubmit={handleSubmit} className="space-y-5">
                                    <div>
                                        <label htmlFor="hotelName" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Hotel Name *</label>
                                        <input
                                            type="text"
                                            id="hotelName"
                                            required
                                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                                            placeholder="e.g., Hotel Kala Tit"
                                            value={hotelName}
                                            onChange={(e) => setHotelName(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                                            placeholder="Brief description of the hotel"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                        ></textarea>
                                    </div>
                                    <div>
                                        <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Website URL *</label>
                                        <input
                                            type="url"
                                            id="websiteUrl"
                                            required
                                            className="block w-full border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-shadow"
                                            placeholder="https://example.com"
                                            value={websiteUrl}
                                            onChange={(e) => setWebsiteUrl(e.target.value)}
                                        />
                                    </div>

                                    <div className="pt-2 flex gap-3">
                                        <button
                                            type="button"
                                            className="w-full inline-flex justify-center rounded-xl border border-gray-300 dark:border-gray-600 shadow-sm px-4 py-3 bg-white dark:bg-gray-700 text-base font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm flex-1 transition-colors"
                                            onClick={() => setIsModalOpen(false)}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="w-full inline-flex justify-center rounded-xl border border-transparent shadow-lg px-4 py-3 bg-blue-600 text-base font-bold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm flex-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5"
                                        >
                                            {isSubmitting ? "Submitting..." : "Suggest Hotel"}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
