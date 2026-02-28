'use client';

export const runtime = 'edge';

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import LocationSelect from "@/components/LocationSelect";
import { validateEmailDomain } from "@/lib/validation";

type Tab = 'basic' | 'professional' | 'contact' | 'rsvp';

interface ProfileFormData {
    fullName: string;
    rollNumber: string;
    profilePhotoUrl: string;
    coverPhotoUrl: string;
    bioJourney: string;
    favoriteMemories: string;
    specialization: string;
    currentDesignation: string;
    workplace: string;
    country: string;
    state: string;
    city: string;
    email: string;
    phoneNumber: string;
    whatsappNumber: string;
    linkedinUrl: string;
    instagramHandle: string;
    facebookUrl: string;
    isAttending: string;
    rsvpAdults: number;
    rsvpKids: number;
    hotelSelectionId: string;
}

export default function RegisterProfilePage() {
    const { status } = useSession();
    const router = useRouter();
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedAlumni, setSelectedAlumni] = useState<any | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('basic');
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hotels, setHotels] = useState<any[]>([]);

    const [formData, setFormData] = useState<ProfileFormData>({
        fullName: "",
        rollNumber: "",
        profilePhotoUrl: "",
        coverPhotoUrl: "",
        bioJourney: "",
        favoriteMemories: "",
        specialization: "",
        currentDesignation: "",
        workplace: "",
        country: "",
        state: "",
        city: "",
        email: "",
        phoneNumber: "",
        whatsappNumber: "",
        linkedinUrl: "",
        instagramHandle: "",
        facebookUrl: "",
        isAttending: "maybe",
        rsvpAdults: 1,
        rsvpKids: 0,
        hotelSelectionId: ""
    });

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login?callbackUrl=/RegisterProfile");
        }
    }, [status, router]);



    // Fetch Hotels
    useEffect(() => {
        async function fetchHotels() {
            try {
                const res = await fetch("/api/hotels/public");
                const data = await res.json() as any;
                if (res.ok && data.data) setHotels(data.data as any[]);
            } catch (err) {
                console.error("Failed to fetch hotels:", err);
            }
        }
        fetchHotels();
    }, []);

    // Simple debounce for search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.length >= 1 && !selectedAlumni) {
                setIsSearching(true);
                try {
                    const res = await fetch(`/api/alumni/search?query=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const data = await res.json() as any[];
                        setResults(data);
                    }
                } catch (err) {
                    console.error("Search failed:", err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [query, selectedAlumni]);

    const handleSelectAlumni = (alumni: any) => {
        setSelectedAlumni(alumni);
        setFormData((prev: ProfileFormData) => ({
            ...prev,
            fullName: alumni.fullName || "",
            rollNumber: alumni.rollNumber?.toString() || "",
            email: alumni.email || "",
            phoneNumber: alumni.phoneNumber || "",
            whatsappNumber: alumni.whatsappNumber || alumni.phoneNumber || "",
            linkedinUrl: alumni.linkedinUrl || "",
            instagramHandle: alumni.instagramHandle || "",
            facebookUrl: alumni.facebookUrl || "",
        }));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: ProfileFormData) => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (name: string, value: string) => {
        setFormData((prev: ProfileFormData) => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json() as any;
            if (data.success) {
                setFormData((prev: ProfileFormData) => ({ ...prev, profilePhotoUrl: data.url }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
        } finally {
            setIsUploading(false);
        }
    };

    const handleCoverPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsCoverUploading(true);
        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json() as any;
            if (data.success) {
                setFormData((prev: ProfileFormData) => ({ ...prev, coverPhotoUrl: data.url }));
            }
        } catch (err) {
            console.error("Cover upload failed:", err);
        } finally {
            setIsCoverUploading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Simple validation Check before saving
        if (formData.email) {
            const { isValid, error: validationError } = validateEmailDomain(formData.email);
            if (!isValid) {
                setError(validationError as string);
                setActiveTab('contact'); // switch to the contact tab so they see the error near the email field
                return;
            }
        }

        setIsSaving(true);
        try {
            const res = await fetch("/api/alumni/claim", {
                method: "POST",
                body: JSON.stringify({
                    alumniId: selectedAlumni.id,
                    ...formData
                }),
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json() as any;

            if (res.ok && data.success) {
                router.push("/profile");
                router.refresh(); // Refresh to update role etc.
                setTimeout(() => {
                    window.location.href = "/profile";
                }, 500);
            } else {
                throw new Error(data.message || "Failed to save profile.");
            }
        } catch (err: any) {
            setError(err.message || "Failed to save profile. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (status === "loading") return null;

    if (selectedAlumni) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#12a38c] via-[#0b8ead] to-[#2563eb] flex items-center justify-center p-2 sm:p-4">
                <div className="max-w-4xl w-full bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-fade-in transition-all">
                    <div className="p-5 sm:p-8 md:p-14">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4 sm:mb-2">
                            <h1 className="text-2xl sm:text-3xl md:text-[2.75rem] font-bold text-gray-900 leading-tight">
                                Claim Your Profile
                            </h1>
                            <button
                                onClick={() => setSelectedAlumni(null)}
                                className="w-full sm:w-auto px-4 py-2 text-sm font-bold text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-all text-center"
                            >
                                Search Again
                            </button>
                        </div>
                        <p className="text-[#10b981] text-xs sm:text-sm font-medium flex items-center gap-2 mb-6 sm:mb-8">
                            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="truncate">Found: {selectedAlumni.fullName} ({selectedAlumni.rollNumber ? `Roll No: ${selectedAlumni.rollNumber}` : 'No Roll No'})</span>
                        </p>

                        <div className="bg-[#f8faff] p-1 rounded-xl flex sm:flex-wrap gap-1 mb-8 sm:mb-10 overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'basic', label: 'Basic Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                                { id: 'professional', label: 'Professional', icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
                                { id: 'contact', label: 'Contact', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                                { id: 'rsvp', label: 'RSVP', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as Tab)}
                                    className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap flex-1 sm:flex-none ${activeTab === tab.id ? 'bg-white text-gray-900 shadow-md' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    <svg className="w-4 h-4 sm:w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                                    </svg>
                                    <span className="hidden xs:inline">{tab.label}</span>
                                    <span className="xs:hidden">{tab.label.split(' ')[0]}</span>
                                </button>
                            ))}
                        </div>

                        <form onSubmit={handleSave} className="space-y-8 min-h-[400px]">
                            {activeTab === 'basic' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Roll Number *</label>
                                            <input name="rollNumber" value={formData.rollNumber} readOnly className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 outline-none text-gray-500 cursor-not-allowed" placeholder="25" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Full Name *</label>
                                            <input name="fullName" value={formData.fullName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="e.g. Bhavik Parmar" required />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:grid-cols-1 md:gap-8">
                                        <div className="flex flex-col gap-2">
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">Profile Photo</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                                    {formData.profilePhotoUrl ? (
                                                        <img src={formData.profilePhotoUrl} alt="Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <label className="flex-1 text-center py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={isUploading} />
                                                    {isUploading ? "..." : "Upload Photo"}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest">Cover Photo</label>
                                            <div className="flex items-center gap-3">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gray-100 border border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0">
                                                    {formData.coverPhotoUrl ? (
                                                        <img src={formData.coverPhotoUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <label className="flex-1 text-center py-2.5 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 cursor-pointer hover:bg-gray-50 transition-all shadow-sm">
                                                    <input type="file" className="hidden" accept="image/*" onChange={handleCoverPhotoUpload} disabled={isCoverUploading} />
                                                    {isCoverUploading ? "..." : "Upload Cover"}
                                                </label>
                                            </div>
                                        </div>
                                    </div>


                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Bio / Your Journey</label>
                                        <textarea name="bioJourney" value={formData.bioJourney} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Tell us about your journey since college..." />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Favorite College Memories</label>
                                        <textarea name="favoriteMemories" value={formData.favoriteMemories} onChange={handleInputChange} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Share your favorite memories from college days..." />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'professional' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Specialization / Professional Field *</label>
                                        <input name="specialization" value={formData.specialization} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="e.g. Cardiology" required />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Current Designation</label>
                                        <input name="currentDesignation" value={formData.currentDesignation} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Your current job title" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Workplace</label>
                                        <input name="workplace" value={formData.workplace} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Hospital/Clinic/Organization" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <LocationSelect
                                            country={formData.country}
                                            state={formData.state}
                                            city={formData.city}
                                            onChange={handleLocationChange}
                                            editing={true}
                                        />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'contact' && (
                                <div className="space-y-6 animate-fade-in">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Email</label>
                                        <input name="email" value={formData.email} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="e.g. email@example.com" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Phone</label>
                                        <input name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Your phone number" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">WhatsApp</label>
                                        <p className="text-[10px] text-gray-400 mb-2">For community updates</p>
                                        <input name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="WhatsApp number" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">LinkedIn</label>
                                        <input name="linkedinUrl" value={formData.linkedinUrl} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="LinkedIn profile URL" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Instagram</label>
                                        <input name="instagramHandle" value={formData.instagramHandle} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Instagram handle or URL" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-2">Facebook</label>
                                        <input name="facebookUrl" value={formData.facebookUrl} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-500 transition-all text-gray-900" placeholder="Facebook profile URL" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'rsvp' && (
                                <div className="space-y-8 animate-fade-in">
                                    <div className="bg-[#f0f7ff] border border-blue-100 rounded-2xl p-6">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <h4 className="text-gray-900 font-bold">Attending Reunion?</h4>
                                                <p className="text-sm text-gray-500">Let others know if you're coming!</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input type="checkbox" className="sr-only peer" checked={formData.isAttending === "attending"} onChange={(e) => setFormData((p: ProfileFormData) => ({ ...p, isAttending: e.target.checked ? "attending" : "not_attending" }))} />
                                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                                            </label>
                                        </div>

                                        {formData.isAttending === "attending" && (
                                            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Adults Attending <span className="text-[10px] lowercase text-gray-400">(Including yourself)</span></label>
                                                    <input type="number" name="rsvpAdults" value={formData.rsvpAdults} onChange={handleInputChange} min="1" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white" />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-2">Kids Attending <span className="text-[10px] lowercase text-gray-400">(Under 12)</span></label>
                                                    <input type="number" name="rsvpKids" value={formData.rsvpKids} onChange={handleInputChange} min="0" className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white" />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {formData.isAttending === "attending" && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-900 uppercase tracking-widest mb-1">Hotel Selection</label>
                                            <p className="text-[11px] text-gray-400 mb-3 italic leading-tight">Let us know which hotel you're staying at for pickup/dropoff arrangements</p>
                                            <select
                                                name="hotelSelectionId"
                                                value={formData.hotelSelectionId}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 pr-10 rounded-xl border border-gray-200 bg-white outline-none focus:border-blue-500 transition-all text-gray-900 appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20fill%3D%22none%22%20viewBox%3D%220%200%2024%2024%22%20stroke%3D%22%239CA3AF%22%3E%3Cpath%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%20stroke-width%3D%222%22%20d%3D%22M19%209l-7%207-7-7%22%2F%3E%3C%2Fsvg%3E')] bg-[length:1.25rem_1.25rem] bg-[right_1rem_center] bg-no-repeat"
                                            >
                                                <option value="">Select your hotel</option>
                                                {hotels.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                                            </select>
                                        </div>
                                    )}
                                </div>
                            )}

                            {error && <div className="text-red-600 text-sm font-bold bg-red-50 p-4 rounded-xl border border-red-100">{error}</div>}

                            <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 sm:gap-4 mt-8 sm:mt-12 pt-6 sm:pt-8 border-t border-gray-100">
                                <button type="button" onClick={() => setSelectedAlumni(null)} className="w-full sm:w-auto px-8 py-3 text-gray-600 font-bold hover:bg-gray-50 rounded-xl transition-all">Cancel</button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full sm:w-auto px-8 py-3 bg-[#6366f1] text-white font-bold rounded-xl shadow-lg hover:shadow-[#6366f1]/30 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#12a38c] via-[#0b8ead] to-[#2563eb] flex items-center justify-center p-4">
            <div className="max-w-4xl w-full bg-white rounded-[1.5rem] shadow-2xl overflow-hidden animate-fade-in">
                <div className="p-5 sm:p-8 md:p-14">
                    <h1 className="text-2xl sm:text-3xl md:text-[2.75rem] font-bold text-gray-900 mb-2 leading-tight">
                        Find Your Profile
                    </h1>
                    <p className="text-sm sm:text-base md:text-lg mb-6 sm:mb-10 text-gray-500">
                        Search for your name to claim your batchmate profile
                    </p>

                    <div className="space-y-4 sm:space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-900 mb-2 sm:mb-3" htmlFor="search">
                                Search Your Name
                            </label>
                            <div className="relative group">
                                <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <input
                                    id="search"
                                    type="text"
                                    className="w-full h-[3.5rem] pl-12 pr-4 rounded-xl border border-gray-300 bg-[#f8faff] focus:bg-white focus:border-gray-500 outline-none transition-all text-gray-900 text-lg"
                                    placeholder="Start typing your name..."
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                />
                                {isSearching && (
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 font-medium">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {results.length > 0 ? (
                                results.map((alumni) => (
                                    <div key={alumni.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                                                {alumni.fullName}
                                            </h3>
                                            <p className="text-xs sm:text-sm text-gray-500 font-medium mt-1">
                                                Roll No: {alumni.rollNumber || '—'}
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleSelectAlumni(alumni)}
                                            className="w-full sm:w-auto text-[15px] font-bold text-blue-600 sm:text-gray-900 sm:hover:text-blue-600 transition-colors bg-blue-50 sm:bg-transparent py-2 sm:py-0 rounded-lg sm:rounded-none"
                                        >
                                            Claim Profile
                                        </button>
                                    </div>
                                ))
                            ) : query.length >= 1 && !isSearching ? (
                                <div className="text-center py-10 text-gray-400 font-medium">
                                    No unclaimed profiles found for &quot;{query}&quot;
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <div className="mt-10">
                        <p className="text-gray-500 text-sm font-medium italic">
                            Can&apos;t find your name? Please contact the admin to add you to the batchmate list.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
