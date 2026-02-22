
"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

interface Alumni {
    id: string;
    rollNumber: number | null;
    fullName: string;
    city: string | null;
    state: string | null;
    country: string | null;
    specialization: string | null;
    profilePhotoUrl: string | null;
}

const TABS = [
    { id: "basic", label: "Basic Info", icon: "👤" },
    { id: "professional", label: "Professional", icon: "💼" },
    { id: "contact", label: "Contact", icon: "📞" },
    { id: "photos", label: "Photos & Videos", icon: "🖼️" },
    { id: "rsvp", label: "RSVP", icon: "📅" },
];

function RegisterProfileContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const initialClaimId = searchParams.get('claim');

    const [step, setStep] = useState<"search" | "claim">("search");
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<Alumni[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
    const [activeTab, setActiveTab] = useState("basic");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form data state
    const [formData, setFormData] = useState({
        rollNumber: "",
        fullName: "",
        bio: "",
        favoriteMemories: "",
        specialization: "",
        currentDesignation: "",
        workplace: "",
        country: "India",
        state: "",
        city: "",
        email: "",
        phoneNumber: "",
        whatsappNumber: "",
        linkedinUrl: "",
        instagramHandle: "",
        facebookUrl: "",
        profilePhotoUrl: "",
        isAttending: "maybe",
        rsvpAdults: 0,
        rsvpKids: 0,
        hotelSelectionId: "",
    });

    const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        async function fetchHotels() {
            try {
                const res = await fetch('/api/hotels/public');
                const data = await res.json() as Record<string, any>;
                if (data.data) setHotels(data.data);
            } catch (e) {
                console.error("Failed to fetch hotels:", e);
            }
        }
        fetchHotels();
    }, []);

    // Handle initial claim ID from URL
    useEffect(() => {
        if (initialClaimId) {
            fetchAlumniById(initialClaimId);
        }
    }, [initialClaimId]);

    async function fetchAlumniById(id: string) {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/alumni/public?id=${id}`); // I should support ID search in my public API
            const data = await res.json() as Record<string, any>;
            if (data.data && data.data.length > 0) {
                handleClaimClick(data.data[0]);
            }
        } catch (err) {
            console.error("Fetch by ID failed:", err);
        } finally {
            setIsSearching(false);
        }
    }

    // Handle search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchTerm.trim().length > 0) {
                performSearch();
            } else {
                setSearchResults([]);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);

    async function performSearch() {
        setIsSearching(true);
        try {
            const res = await fetch(`/api/alumni/public?search=${encodeURIComponent(searchTerm)}`);
            const data = await res.json() as Record<string, any>;
            setSearchResults(data.data || []);
        } catch (err) {
            console.error("Search failed:", err);
        } finally {
            setIsSearching(false);
        }
    }

    const handleClaimClick = (alum: Alumni) => {
        setSelectedAlumni(alum);
        setFormData({
            ...formData,
            rollNumber: alum.rollNumber?.toString() || "",
            fullName: alum.fullName || "",
            city: alum.city || "",
            state: alum.state || "",
            country: alum.country || "India",
            specialization: alum.specialization || "",
            profilePhotoUrl: alum.profilePhotoUrl || "",
        });
        setStep("claim");
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const uploadData = new FormData();
        uploadData.append('file', file);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: uploadData,
            });
            const data = await res.json() as Record<string, any>;
            if (data.success) {
                setFormData(prev => ({ ...prev, profilePhotoUrl: data.url }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
        }
    };

    const handleSave = async () => {
        if (!selectedAlumni) return;
        setIsSaving(true);
        setMessage(null);

        try {
            const res = await fetch('/api/alumni/claim', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    alumniId: selectedAlumni.id,
                    ...formData
                }),
            });

            const result = await res.json() as Record<string, any>;

            if (res.ok) {
                setMessage({ type: 'success', text: "Profile claimed successfully! Redirecting..." });
                setTimeout(() => {
                    router.push('/login?claimed=true');
                }, 2000);
            } else {
                setMessage({ type: 'error', text: result.message || "Failed to claim profile" });
            }
        } catch (err) {
            setMessage({ type: 'error', text: "An error occurred. Please try again." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            {step === "search" ? (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white text-center">
                        <h1 className="text-3xl font-bold mb-2">Find Your Profile</h1>
                        <p className="text-blue-100">Search for your name to claim your batchmate profile</p>
                    </div>

                    <div className="p-8">
                        <div className="mb-8">
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wider">
                                Search Your Name
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="h-6 w-6 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 dark:bg-gray-800 border-2 border-transparent focus:border-blue-500 focus:ring-0 rounded-xl text-gray-900 dark:text-white transition-all text-lg shadow-inner"
                                    placeholder="Start typing your name.."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute right-4 top-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {searchResults.length > 0 ? (
                            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {searchResults.map((alum) => (
                                    <div key={alum.id} className="flex flex-col sm:flex-row items-center justify-between p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl hover:shadow-md transition-all border border-gray-200 dark:border-gray-700 group">
                                        <div className="flex items-center gap-4 w-full">
                                            <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-xl font-bold text-blue-600 dark:text-blue-400 shrink-0">
                                                {alum.fullName.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                    {alum.fullName}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Roll No: {alum.rollNumber || 'N/A'}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleClaimClick(alum)}
                                            className="mt-4 sm:mt-0 px-6 py-2.5 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 font-bold rounded-xl hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm"
                                        >
                                            Claim Profile
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : searchTerm.trim().length > 0 && !isSearching ? (
                            <div className="text-center py-10">
                                <p className="text-gray-500 dark:text-gray-400">No batchmates found with that name.</p>
                            </div>
                        ) : null}

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
                            <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                                Can't find your name? Please contact the admin to add you to the batchmate list.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-slide-in">
                    <div className="p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 dark:bg-gray-800/50">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Claim Your Profile</h1>
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm font-medium">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                                Found: {selectedAlumni?.fullName} (Roll No: {selectedAlumni?.rollNumber})
                            </div>
                        </div>
                        <button
                            onClick={() => setStep("search")}
                            className="px-5 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                        >
                            Search Again
                        </button>
                    </div>

                    <div className="flex border-b border-gray-100 dark:border-gray-800 overflow-x-auto no-scrollbar bg-white dark:bg-gray-900 sticky top-0 z-20">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 min-w-[120px] py-4 px-2 flex flex-col items-center gap-1 border-b-2 transition-all ${activeTab === tab.id
                                    ? "border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-900/10"
                                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                    }`}
                            >
                                <span className="text-xl mb-1">{tab.icon}</span>
                                <span className="text-xs font-bold uppercase tracking-wider">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    <div className="p-6 md:p-8">
                        {message && (
                            <div className={`mb-6 p-4 rounded-xl text-center font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="space-y-8">
                            {activeTab === "basic" && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Roll Number *</label>
                                            <input
                                                type="text"
                                                name="rollNumber"
                                                value={formData.rollNumber}
                                                onChange={handleInputChange}
                                                readOnly
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Full Name *</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                value={formData.fullName}
                                                readOnly
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-500 dark:text-gray-400 focus:outline-none cursor-not-allowed"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wide">Profile Photo</label>
                                        <div className="flex flex-col sm:flex-row items-center gap-6">
                                            <div className="w-32 h-32 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center overflow-hidden shrink-0 shadow-inner group relative">
                                                {formData.profilePhotoUrl ? (
                                                    <Image
                                                        src={formData.profilePhotoUrl}
                                                        alt="Profile"
                                                        width={128}
                                                        height={128}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <svg className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                )}
                                            </div>
                                            <div className="flex-grow w-full">
                                                <label className="flex flex-col items-center px-4 py-4 bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-200 dark:border-blue-900/50 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-bold shadow-sm">
                                                    <span className="flex items-center gap-2">
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                        </svg>
                                                        Upload Photo
                                                    </span>
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                                                </label>
                                                <p className="mt-2 text-xs text-gray-500 text-center sm:text-left">JPG, PNG or WEBP. Max 2MB.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Bio / Your Journey</label>
                                        <textarea
                                            name="bio"
                                            rows={4}
                                            value={formData.bio || ""}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="Tell us about your journey since college..."
                                        ></textarea>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Favorite College Memories</label>
                                        <textarea
                                            name="memories"
                                            rows={4}
                                            value={formData.favoriteMemories}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="Share your favorite memories from college days..."
                                        ></textarea>
                                    </div>
                                </div>
                            )}

                            {activeTab === "professional" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Specialization / Professional Field *</label>
                                        <select
                                            name="specialization"
                                            value={formData.specialization}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                        >
                                            <option value="">Select your field</option>
                                            <option value="General Medicine">General Medicine</option>
                                            <option value="General Surgery">General Surgery</option>
                                            <option value="Pediatrics">Pediatrics</option>
                                            <option value="Obstetrics and Gynecology">Obstetrics and Gynecology</option>
                                            <option value="Cardiology">Cardiology</option>
                                            <option value="Neurology">Neurology</option>
                                            <option value="Dermatology">Dermatology</option>
                                            <option value="Ophthalmology">Ophthalmology</option>
                                            <option value="ENT">ENT</option>
                                            <option value="Orthopedics">Orthopedics</option>
                                            <option value="Radiology">Radiology</option>
                                            <option value="Anesthesia">Anesthesia</option>
                                            <option value="Pathology">Pathology</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Current Designation</label>
                                        <input
                                            type="text"
                                            name="currentDesignation"
                                            value={formData.currentDesignation}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="Your current job title"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Workplace</label>
                                        <input
                                            type="text"
                                            name="workplace"
                                            value={formData.workplace}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="Hospital/Clinic/Organization"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Country *</label>
                                            <select
                                                name="country"
                                                value={formData.country}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            >
                                                <option value="India">India</option>
                                                <option value="USA">USA</option>
                                                <option value="UK">UK</option>
                                                <option value="Australia">Australia</option>
                                                <option value="Canada">Canada</option>
                                                <option value="Germany">Germany</option>
                                                <option value="UAE">UAE</option>
                                                <option value="Singapore">Singapore</option>
                                                <option value="Other">Other</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">State *</label>
                                            <input
                                                type="text"
                                                name="state"
                                                value={formData.state}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="State/Province"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">City *</label>
                                            <input
                                                type="text"
                                                name="city"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="Current city"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "contact" && (
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Email</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="your.email@example.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Phone</label>
                                            <input
                                                type="text"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="Your phone number"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">WhatsApp</label>
                                            <input
                                                type="text"
                                                name="whatsappNumber"
                                                value={formData.whatsappNumber}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="WhatsApp number"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">LinkedIn</label>
                                        <input
                                            type="text"
                                            name="linkedinUrl"
                                            value={formData.linkedinUrl}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                            placeholder="LinkedIn profile URL"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Instagram Handle</label>
                                            <input
                                                type="text"
                                                name="instagramHandle"
                                                value={formData.instagramHandle}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="@username"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Facebook URL</label>
                                            <input
                                                type="text"
                                                name="facebookUrl"
                                                value={formData.facebookUrl}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                placeholder="Facebook Profile URL"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "photos" && (
                                <div className="space-y-6 text-center py-12">
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-8 rounded-2xl border-2 border-dashed border-blue-200 dark:border-blue-800">
                                        <div className="text-4xl mb-4">🖼️</div>
                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Share Memories</h3>
                                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                                            You can upload more photos and videos once your profile is verified.
                                            For now, focus on your profile photo!
                                        </p>
                                        <button
                                            onClick={() => setActiveTab("rsvp")}
                                            className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 dark:shadow-none"
                                        >
                                            Continue to RSVP
                                        </button>
                                    </div>
                                </div>
                            )}

                            {activeTab === "rsvp" && (
                                <div className="space-y-8">
                                    <div className="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8 flex items-start gap-4">
                                        <div className="w-12 h-12 bg-white dark:bg-indigo-900 rounded-xl flex items-center justify-center text-2xl shadow-sm shrink-0">
                                            🏗️
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white">Main Reunion Event</h3>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">25th Anniversary Celebration</p>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-4 uppercase tracking-wide">Will you be attending? *</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            {["attending", "maybe", "not_attending"].map((option) => (
                                                <button
                                                    key={option}
                                                    onClick={() => setFormData(prev => ({ ...prev, isAttending: option }))}
                                                    className={`py-4 px-4 rounded-2xl border-2 transition-all font-bold ${formData.isAttending === option
                                                        ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-md"
                                                        : "border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 hover:border-gray-200 dark:hover:border-gray-700"
                                                        }`}
                                                >
                                                    {option.replace('_', ' ').charAt(0).toUpperCase() + option.replace('_', ' ').slice(1)}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {formData.isAttending === 'attending' && (
                                        <div className="animate-fade-in space-y-6">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Adults Attending (including yourself)</label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, rsvpAdults: Math.max(0, prev.rsvpAdults - 1) }))}
                                                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-xl"
                                                    >-</button>
                                                    <span className="text-2xl font-bold w-12 text-center text-gray-900 dark:text-white">{formData.rsvpAdults}</span>
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, rsvpAdults: prev.rsvpAdults + 1 }))}
                                                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-xl"
                                                    >+</button>
                                                </div>
                                                <p className="mt-2 text-xs text-gray-500 italic">Include yourself in the count.</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Kids Attending</label>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, rsvpKids: Math.max(0, prev.rsvpKids - 1) }))}
                                                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-xl"
                                                    >-</button>
                                                    <span className="text-2xl font-bold w-12 text-center text-gray-900 dark:text-white">{formData.rsvpKids}</span>
                                                    <button
                                                        onClick={() => setFormData(prev => ({ ...prev, rsvpKids: prev.rsvpKids + 1 }))}
                                                        className="w-12 h-12 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-800 transition-all font-bold text-xl"
                                                    >+</button>
                                                </div>
                                            </div>

                                            {hotels.length > 0 && (
                                                <div className="mt-8 animate-fade-in">
                                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">Select Hotel for Stay</label>
                                                    <select
                                                        name="hotelSelectionId"
                                                        value={formData.hotelSelectionId}
                                                        onChange={handleInputChange}
                                                        className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-sm"
                                                    >
                                                        <option value="">I will arrange myself / Not sure yet</option>
                                                        {hotels.map((hotel) => (
                                                            <option key={hotel.id} value={hotel.id}>
                                                                {hotel.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="mt-12 pt-8 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-end gap-4">
                            <button
                                onClick={() => setStep("search")}
                                className="order-2 sm:order-1 px-8 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-xl font-bold shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving}
                                className="order-1 sm:order-2 px-10 py-3.5 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 min-w-[160px]"
                            >
                                {isSaving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Saving...
                                    </>
                                ) : "Save Profile"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RegisterProfilePage() {
    return (
        <div className="max-w-7xl mx-auto py-12 px-4">
            <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
            }>
                <RegisterProfileContent />
            </Suspense>
        </div>
    );
}
