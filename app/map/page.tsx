import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { isNotNull, or, asc } from "drizzle-orm";
import WorldMapClient from "./WorldMapClient";

export const runtime = "edge";

async function getAlumniLocations() {
    try {
        const db = getDrizzleDb();

        const results = await db.select({
            id: alumniProfiles.id,
            fullName: alumniProfiles.fullName,
            city: alumniProfiles.city,
            state: alumniProfiles.state,
            country: alumniProfiles.country,
            currentDesignation: alumniProfiles.currentDesignation,
            workplace: alumniProfiles.workplace,
            profilePhotoUrl: alumniProfiles.profilePhotoUrl,
            latitude: alumniProfiles.latitude,
            longitude: alumniProfiles.longitude,
        })
            .from(alumniProfiles)
            .where(
                or(
                    isNotNull(alumniProfiles.country),
                    isNotNull(alumniProfiles.city)
                )
            )
            .orderBy(asc(alumniProfiles.country), asc(alumniProfiles.fullName))
            .all();

        return results.map(row => ({
            id: row.id,
            name: row.fullName,
            city: row.city,
            state: row.state,
            country: row.country || "Unknown",
            position: row.currentDesignation || row.workplace || "Medical Professional",
            image_url: row.profilePhotoUrl,
            latitude: row.latitude,
            longitude: row.longitude,
        }));
    } catch (e) {
        console.error("Failed to fetch alumni for map:", e);
        return [];
    }
}

export default async function MapPage() {
    const alumni = await getAlumniLocations();

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="pt-8 pb-16">
                <WorldMapClient alumni={alumni} />
            </div>
        </main>
    );
}
