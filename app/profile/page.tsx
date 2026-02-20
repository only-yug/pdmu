"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Profile {
    id: string;
    fullName: string;
    rollNumber: number | null;
    profilePhotoUrl: string | null;
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
    rsvpAdults: number;
    rsvpKids: number;
    specialReqs: string | null;
}

export default function ProfilePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [formData, setFormData] = useState<Partial<Profile>>({});

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login");
            return;
        }
        if (status === "authenticated") {
            fetchProfile();
        }
    }, [status]);

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

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

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
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        setMessage(null);

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
                setIsEditing(false);
            } else {
                setMessage({ type: "error", text: data.error || "Failed to update" });
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
                            onClick={() => { setIsEditing(false); setFormData(profile); setMessage(null); }}
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
                {/* Photo + Name Banner */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center gap-6">
                        <div className="relative">
                            {formData.profilePhotoUrl ? (
                                <img src={formData.profilePhotoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover border-4 border-white/30" />
                            ) : (
                                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
                                    {profile.fullName?.charAt(0) || "?"}
                                </div>
                            )}
                            {isEditing && (
                                <label className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1 cursor-pointer shadow-lg">
                                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                                    <svg className="w-4 h-4 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </label>
                            )}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{profile.fullName}</h2>
                            <p className="text-indigo-100 text-sm">{profile.email}</p>
                            {profile.rollNumber && <p className="text-indigo-200 text-xs mt-1">Roll No: {profile.rollNumber}</p>}
                        </div>
                    </div>
                </div>

                {/* Form Sections */}
                <div className="p-8 space-y-8">
                    {/* Professional */}
                    <Section title="Professional Info">
                        <Field label="Full Name" name="fullName" value={formData.fullName || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="Specialization" name="specialization" value={formData.specialization || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="Current Designation" name="currentDesignation" value={formData.currentDesignation || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="Workplace" name="workplace" value={formData.workplace || ""} onChange={handleChange} editing={isEditing} />
                    </Section>

                    {/* Location */}
                    <Section title="Location">
                        <Field label="Country" name="country" value={formData.country || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="State" name="state" value={formData.state || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="City" name="city" value={formData.city || ""} onChange={handleChange} editing={isEditing} />
                    </Section>

                    {/* Contact */}
                    <Section title="Contact">
                        <Field label="Phone Number" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="WhatsApp Number" name="whatsappNumber" value={formData.whatsappNumber || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="LinkedIn URL" name="linkedinUrl" value={formData.linkedinUrl || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="Instagram Handle" name="instagramHandle" value={formData.instagramHandle || ""} onChange={handleChange} editing={isEditing} />
                        <Field label="Facebook URL" name="facebookUrl" value={formData.facebookUrl || ""} onChange={handleChange} editing={isEditing} />
                    </Section>

                    {/* Bio */}
                    <Section title="About">
                        <TextArea label="Bio / Journey" name="bioJourney" value={formData.bioJourney || ""} onChange={handleChange} editing={isEditing} />
                        <TextArea label="Favorite Memories" name="favoriteMemories" value={formData.favoriteMemories || ""} onChange={handleChange} editing={isEditing} />
                    </Section>
                </div>
            </div>
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

function Field({ label, name, value, onChange, editing }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; editing: boolean;
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
                name={name}
                value={value}
                onChange={onChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
        </div>
    );
}

function TextArea({ label, name, value, onChange, editing }: {
    label: string; name: string; value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; editing: boolean;
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
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
            />
        </div>
    );
}
