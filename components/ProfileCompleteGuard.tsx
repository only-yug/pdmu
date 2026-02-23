"use client";

// Disabled because it conflicts with the new "Progressive Profiling" and Frictionless Login design.
// Guests and incomplete profiles no longer need to be aggressively redirected.
export default function ProfileCompleteGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
