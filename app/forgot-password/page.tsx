"use client";

import { useState } from "react";
export const runtime = 'edge';
import Link from "next/link";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setError(null);
        setIsLoading(true);

        try {
            const res = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            const data = await res.json() as Record<string, any>;

            if (res.ok) {
                setMessage(data.message);
            } else {
                setError(data.error || "Something went wrong");
            }
        } catch {
            setError("Network error. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[70vh] flex items-center justify-center px-4">
            <div className="w-full max-w-md">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Forgot Password
                        </h1>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Enter your email and we&apos;ll send you a reset link
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                placeholder="your@email.com"
                            />
                        </div>

                        {message && (
                            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-300 text-sm">
                                {message}
                            </div>
                        )}

                        {error && (
                            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/login" className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline">
                            ← Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
