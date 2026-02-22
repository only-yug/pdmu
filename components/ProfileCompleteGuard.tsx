"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";

export default function ProfileCompleteGuard({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === "loading") return;

        // Skip auth/public pages entirely, and /registerProfile since that's where we redirect them!
        const protectedRoutes = ['/dashboard', '/home', '/events', '/alumni', '/map', '/memories', '/accommodation', '/profile'];
        const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

        if (!isProtectedRoute) {
            setIsChecking(false);
            return;
        }

        if (status === "unauthenticated") {
            setIsChecking(false);
            return;
        }

        async function checkProfile() {
            try {
                const res = await fetch('/api/user/profile');
                if (res.ok) {
                    const data = await res.json() as { profile?: Record<string, any> };
                    const profile = data.profile;

                    if (session?.user?.role === 'admin') {
                        setIsChecking(false);
                        return;
                    }

                    if (!profile || (!profile.rollNumber && !profile.specialization && !profile.city)) {
                        router.replace('/registerProfile?incomplete=true');
                    } else {
                        setIsChecking(false);
                    }
                } else {
                    router.replace('/registerProfile?setup=true');
                }
            } catch (error) {
                console.error("Error checking profile status:", error);
                setIsChecking(false);
            }
        }

        checkProfile();
    }, [status, pathname, router, session]);

    if (isChecking) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return <>{children}</>;
}
