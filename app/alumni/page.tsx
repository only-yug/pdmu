import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { auth } from "@/auth";
import AlumniGrid from "./AlumniGrid";

export const runtime = 'edge';

async function getAlumni() {
    try {
        const db = getDrizzleDb();

        // Fetch Alumni Profiles ordered by full name
        const alumniResult = await db.select().from(alumniProfiles).orderBy(asc(alumniProfiles.fullName));

        return alumniResult.map((a: any) => {
            // Split fullName into first/last for AlumniGrid compatibility
            const nameParts = (a.fullName || "").split(" ");
            const firstName = nameParts[0] || "";
            const lastName = nameParts.slice(1).join(" ") || "";

            return {
                id: a.id,
                roll_number: a.rollNumber,
                first_name: firstName,
                last_name: lastName,
                current_city: a.city,
                specialization: a.specialization,
                profile_photo_url: a.profilePhotoUrl,
                cover_photo_url: a.coverPhotoUrl,
                status: (a.userId ? 'claimed' : 'unclaimed') as 'unclaimed' | 'claimed' | 'self-registered',
                isAttending: a.isAttending === 'attending',
                is_attending_status: a.isAttending,
            };
        });
    } catch (e) {
        console.error("Failed to fetch alumni:", e);
        return [];
    }
}

export default async function AlumniPage() {
    const session = await auth();
    const isLoggedIn = !!session?.user;
    const alumni = await getAlumni();

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative pt-16 pb-32 overflow-hidden bg-blue-900 dark:bg-gray-900">
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>

                {/* Gradient Blobs */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-800/50 to-transparent blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-teal-500/20 blur-[100px] rounded-full"></div>

                <div className="max-w-7xl mx-auto px-4 relative z-10 text-center">
                    {/* <div className="inline-flex items-center gap-2 bg-blue-800/50 backdrop-blur-sm border border-blue-700/50 px-4 py-1.5 rounded-full mb-6">
                        <span className="text-blue-300">👨‍⚕️</span>
                        <span className="text-sm font-medium text-blue-100 uppercase tracking-wider">The Class of 2001</span>
                    </div> */}

                    <h1 className="text-4xl md:text-6xl font-black text-white mb-6 tracking-tight">
                        Our Batchmates
                    </h1>

                    <p className="text-xl text-blue-100/80 max-w-2xl mx-auto font-light leading-relaxed">
                        Pandit Dindayal Upadhyay Medical College, Batch of 2001
                    </p>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-4 pb-24 relative z-20">
                <AlumniGrid initialAlumni={alumni} isLoggedIn={isLoggedIn} />
            </section>
        </div>
    );
}
