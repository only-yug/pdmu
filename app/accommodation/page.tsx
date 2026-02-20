import { getDrizzleDb } from "@/lib/db";
import { hotels, alumniProfiles } from "@/lib/db/schema";
import { asc, eq, count, sql } from "drizzle-orm";
import AccommodationGrid from "./AccommodationGrid";

export const runtime = 'edge';

async function getHotels() {
    try {
        const db = getDrizzleDb();

        // Get hotels with guest count via subquery
        const results = await db.select({
            id: hotels.id,
            name: hotels.hotelName,
            description: hotels.description,
            websiteUrl: hotels.websiteUrl,
            guestCount: sql<number>`(SELECT COUNT(*) FROM alumni_profiles WHERE alumni_profiles.hotel_selection_id = ${hotels.id})`,
        })
            .from(hotels)
            .orderBy(asc(hotels.createdAt))
            .all();

        return results.map(h => ({
            id: h.id,
            name: h.name,
            description: h.description,
            website_url: h.websiteUrl,
            guest_count: h.guestCount || 0,
        }));
    } catch (e) {
        console.error("Failed to fetch hotels:", e);
        return [];
    }
}

export default async function AccommodationPage() {
    const hotels = await getHotels();

    return (
        <div className="min-h-screen bg-white bg-gradient-to-br from-teal-500 to-blue-600 dark:from-teal-900 dark:to-blue-900 transition-colors duration-300">
            <AccommodationGrid initialHotels={hotels} />
        </div>
    );
}
