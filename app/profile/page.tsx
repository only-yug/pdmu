"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Country } from "country-state-city";
import ImageModal from "@/components/ImageModal";
import LocationSelect from "@/components/LocationSelect";

interface Profile {
    id: string;
    fullName: string;
    rollNumber: number | null;
    profilePhotoUrl: string | null;
    coverPhotoUrl: string | null;
    bioJourney: string | null;
    favoriteMemories: string | null;
    specialization: string | null;
    currentDesignation: string | null;
    workplace: string | null;
    country: string | null;
    state: string | null;
    city: string | null;
    email: string;
    phoneNumber: string | null;
    whatsappNumber: string | null;
    linkedinUrl: string | null;
    instagramHandle: string | null;
    facebookUrl: string | null;
    isAttending: string | null;
    rsvpAdults: number;
    rsvpKids: number;
    hotelSelectionId: string | null;
    specialReqs: string | null;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState({ photo: false, cover: false });
    const [previews, setPreviews] = useState({ photo: null as string | null, cover: null as string | null });
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [formData, setFormData] = useState<Partial<Profile>>({});
    const [hotels, setHotels] = useState<{ id: string; name: string }[]>([]);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [availableCountries, setAvailableCountries] = useState<string[]>([]);

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchProfile();
            prefetchCountries();
            fetchHotels();
        }
    }, [status]);

    async function prefetchCountries() {
        try {
            const allCountries = Country.getAllCountries();
            const countryNames = allCountries.map(c => c.name).sort();
            setAvailableCountries(countryNames);
        } catch (err) {
            console.error("Failed to prefetch countries:", err);
        }
    }

    async function fetchHotels() {
        try {
            const res = await fetch("/api/hotels/public");
            const data = await res.json() as Record<string, any>;
            if (res.ok && data.data) {
                setHotels(data.data);
            }
        } catch (err) {
            console.error("Failed to fetch hotels:", err);
        }
    }

    async function fetchProfile() {
        try {
            const res = await fetch("/api/user/profile");
            const data = await res.json() as Record<string, any>;

            if (res.ok && data.profile) {
                setProfile(data.profile);
                setFormData(data.profile);
            }
        } catch (err) {
            console.error("Failed to fetch profile:", err);
        } finally {
            setIsLoading(false);
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleLocationChange = (name: string, value: string) => {
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, photo: localUrl }));
        setIsUploading(prev => ({ ...prev, photo: true }));

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json() as Record<string, any>;
            if (data.success) {
                setFormData((prev) => ({ ...prev, profilePhotoUrl: data.url }));
            }
        } catch (err) {
            console.error("Upload failed:", err);
            setPreviews(prev => ({ ...prev, photo: null }));
        } finally {
            setIsUploading(prev => ({ ...prev, photo: false }));
        }
    };

    const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const localUrl = URL.createObjectURL(file);
        setPreviews(prev => ({ ...prev, cover: localUrl }));
        setIsUploading(prev => ({ ...prev, cover: true }));

        const uploadData = new FormData();
        uploadData.append("file", file);

        try {
            const res = await fetch("/api/upload", { method: "POST", body: uploadData });
            const data = await res.json() as Record<string, any>;
            if (data.success) {
                setFormData((prev) => ({ ...prev, coverPhotoUrl: data.url }));
            }
        } catch (err) {
            console.error("Cover upload failed:", err);
            setPreviews(prev => ({ ...prev, cover: null }));
        } finally {
            setIsUploading(prev => ({ ...prev, cover: false }));
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);
        setErrors({});

        try {
            const res = await fetch("/api/user/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await res.json() as Record<string, any>;

            if (res.ok) {
                setMessage({ type: "success", text: "Profile updated successfully!" });
                setProfile({ ...profile, ...formData } as Profile);
                window.dispatchEvent(new Event("profileUpdated"));
                setIsEditing(false);
            } else {
                if (data.details?.fieldErrors) {
                    setErrors(data.details.fieldErrors);
                    setMessage({ type: "error", text: "Please fix the validation errors below." });
                } else {
                    setMessage({ type: "error", text: data.error || "Failed to update" });
                }
            }
        } catch {
            setMessage({ type: "error", text: "Network error" });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-[70vh] flex items-center justify-center px-4">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center max-w-md">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Profile Found</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        You need to claim or register your alumni profile first.
                    </p>
                    <a href="/registerProfile" className="inline-block px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                        Register Profile
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
                {!isEditing ? (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                        Edit Profile
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <button
                            onClick={() => { setIsEditing(false); setFormData(profile); setMessage(null); setErrors({}); }}
                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                )}
            </div>

            {message && (
                <div className={`mb-6 p-3 rounded-lg text-sm ${message.type === "success"
                    ? "bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                    : "bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300"
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                <div className="relative group/cover">
                    <div
                        className={`h-48 md:h-64 w-full relative cursor-pointer ${!(previews.cover || formData.coverPhotoUrl) ? 'bg-gradient-to-r from-blue-600 to-indigo-700' : ''}`}
                        onClick={() => (previews.cover || formData.coverPhotoUrl) && setSelectedImage(previews.cover || formData.coverPhotoUrl || null)}
                    >
                        {(previews.cover || formData.coverPhotoUrl) && (
                            <img src={previews.cover || formData.coverPhotoUrl || ""} alt="Cover" className={`w-full h-full object-cover transition-opacity duration-300 ${isUploading.cover ? 'opacity-50' : 'opacity-100'}`} />
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/cover:opacity-100 transition-opacity flex items-center justify-center">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                            </svg>
                        </div>
                        {isUploading.cover && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                            </div>
                        )}
                        {isEditing && (
                            <label className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer backdrop-blur-md transition-all flex items-center gap-2 border border-white/30 z-20">
                                <input type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {isUploading.cover ? "Uploading..." : "Change Cover Photo"}
                            </label>
                        )}
                    </div>

                    <div className="absolute -bottom-12 left-8 md:left-12 z-20">
                        <div
                            className="relative inline-block cursor-pointer group/photo"
                            onClick={() => (previews.photo || formData.profilePhotoUrl) && setSelectedImage(previews.photo || formData.profilePhotoUrl || null)}
                        >
                            {previews.photo || formData.profilePhotoUrl ? (
                                <div className="relative w-32 h-32 md:w-40 md:h-40">
                                    <img
                                        src={previews.photo || formData.profilePhotoUrl || ""}
                                        alt="Profile"
                                        className={`w-full h-full rounded-full border-4 border-white dark:border-gray-900 shadow-2xl object-cover transition-all group-hover/photo:brightness-90 ${isUploading.photo ? 'opacity-50' : 'opacity-100'}`}
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/photo:opacity-100 transition-opacity">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                    {isUploading.photo && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-indigo-100 dark:bg-gray-800 flex items-center justify-center text-indigo-600 dark:text-gray-400 text-5xl font-bold border-4 border-white dark:border-gray-900 shadow-xl">
                                    {profile.fullName?.charAt(0) || "?"}
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute bottom-2 right-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-2.5 cursor-pointer shadow-xl border-4 border-white dark:border-gray-900 z-30">
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                            )}
                        </div>
                    </div>
                </div>

                <div className="pt-16 pb-8 px-8 md:px-12 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-1">{profile.fullName}</h2>
                    <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {profile.email}
                    </p>
                    {profile.rollNumber && (
                        <div className="mt-3 inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                            Roll No: {profile.rollNumber}
                        </div>
                    )}
                </div>

                {/* Form Sections */}
                <div className="p-8 space-y-8">
                    {/* Professional */}
                    <Section title="Professional Info">
                        <Field label="Full Name" name="fullName" value={formData.fullName || ""} onChange={handleChange} editing={isEditing} error={errors.fullName?.[0]} />
                        <Field label="Specialization" name="specialization" value={formData.specialization || ""} onChange={handleChange} editing={isEditing} error={errors.specialization?.[0]} />
                        <Field label="Current Designation" name="currentDesignation" value={formData.currentDesignation || ""} onChange={handleChange} editing={isEditing} error={errors.currentDesignation?.[0]} />
                        <Field label="Workplace" name="workplace" value={formData.workplace || ""} onChange={handleChange} editing={isEditing} error={errors.workplace?.[0]} />
                    </Section>

                    {/* Location */}
                    <Section title="Location">
                        <LocationSelect
                            country={formData.country || ""}
                            state={formData.state || ""}
                            city={formData.city || ""}
                            onChange={handleLocationChange}
                            editing={isEditing}
                            availableCountries={availableCountries}
                            error={errors.country?.[0] || errors.state?.[0] || errors.city?.[0]}
                        />
                    </Section>

                    {/* Contact */}
                    <Section title="Contact">
                        <Field label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} editing={isEditing} error={errors.phoneNumber?.[0]} />
                        <Field label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber || ""} onChange={handleChange} editing={isEditing} error={errors.whatsappNumber?.[0]} />
                        <Field label="LinkedIn URL" name="linkedinUrl" value={formData.linkedinUrl || ""} onChange={handleChange} editing={isEditing} error={errors.linkedinUrl?.[0]} />
                        <Field label="Instagram Handle" name="instagramHandle" value={formData.instagramHandle || ""} onChange={handleChange} editing={isEditing} error={errors.instagramHandle?.[0]} />
                        <Field label="Facebook URL" name="facebookUrl" value={formData.facebookUrl || ""} onChange={handleChange} editing={isEditing} error={errors.facebookUrl?.[0]} />
                    </Section>

                    {/* RSVP Status */}
                    <Section title="RSVP Status">
                        {isEditing ? (
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="md:col-span-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Attending?</div>
                                {["attending", "maybe", "not_attending"].map((opt) => (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            isAttending: opt,
                                            hotelSelectionId: opt === 'attending' ? prev.hotelSelectionId : null
                                        }))}
                                        className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${formData.isAttending === opt
                                            ? "border-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300"
                                            : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                    >
                                        {opt.replace('_', ' ').charAt(0).toUpperCase() + opt.replace('_', ' ').slice(1)}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <Field label="Attending?" name="isAttending" value={formData.isAttending?.replace('_', ' ').toUpperCase() || "—"} onChange={handleChange} editing={false} />
                        )}
                        {formData.isAttending === 'attending' && (
                            <>
                                <Field label="Adults (Including yourself)" name="rsvpAdults" value={String(formData.rsvpAdults || 0)} onChange={(e) => setFormData(p => ({ ...p, rsvpAdults: parseInt(e.target.value) || 0 }))} editing={isEditing} type="number" error={errors.rsvpAdults?.[0]} />
                                <Field label="Kids (Under 18)" name="rsvpKids" value={String(formData.rsvpKids || 0)} onChange={(e) => setFormData(p => ({ ...p, rsvpKids: parseInt(e.target.value) || 0 }))} editing={isEditing} type="number" error={errors.rsvpKids?.[0]} />

                                {isEditing ? (
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Select Hotel</label>
                                        <select
                                            name="hotelSelectionId"
                                            value={formData.hotelSelectionId || ""}
                                            onChange={(e) => setFormData(prev => ({ ...prev, hotelSelectionId: e.target.value || null }))}
                                            className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-transparent transition-all"
                                        >
                                            <option value="">-- Select or No Hotel Selection --</option>
                                            {hotels.map(h => (
                                                <option key={h.id} value={h.id}>{h.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                ) : (
                                    <div className="md:col-span-2">
                                        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Staying At</span>
                                        <p className="mt-1 text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                                            {hotels.find(h => h.id === formData.hotelSelectionId)?.name || "Not selected"}
                                            {formData.hotelSelectionId && <span className="text-[10px] bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full">Booked Selection</span>}
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </Section>

                    {/* Bio */}
                    <Section title="About">
                        <TextArea label="Bio / Journey" name="bioJourney" value={formData.bioJourney || ""} onChange={handleChange} editing={isEditing} error={errors.bioJourney?.[0]} />
                        <TextArea label="Favorite Memories" name="favoriteMemories" value={formData.favoriteMemories || ""} onChange={handleChange} editing={isEditing} error={errors.favoriteMemories?.[0]} />
                    </Section>
                </div>
            </div>

            <ImageModal
                src={selectedImage || ""}
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
            />
        </div>
    );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 pb-2 border-b border-gray-200 dark:border-gray-700">
                {title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
        </div>
    );
}

function Field({ label, name, value, onChange, editing, type = "text", error }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; editing: boolean; type?: string; error?: string;
}) {
    if (!editing) {
        return (
            <div>
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
                <p className="mt-1 text-gray-900 dark:text-white">{value || "—"}</p>
            </div>
        );
    }
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800'} text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-transparent transition-all`}
            />
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
}

function TextArea({ label, name, value, onChange, editing, error }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; editing: boolean; error?: string;
}) {
    if (!editing) {
        return (
            <div className="md:col-span-2">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{label}</span>
                <p className="mt-1 text-gray-900 dark:text-white whitespace-pre-wrap">{value || "—"}</p>
            </div>
        );
    }
    return (
        <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">{label}</label>
            <textarea
                name={name}
                value={value}
                onChange={onChange}
                rows={3}
                className={`w-full px-3 py-2 rounded-lg border ${error ? 'border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-300 dark:border-gray-700 focus:ring-indigo-500 bg-gray-50 dark:bg-gray-800'} text-gray-900 dark:text-white text-sm focus:ring-2 focus:border-transparent transition-all`}
            />
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
}
