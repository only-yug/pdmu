import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles, events, hotels, memories, users } from "@/lib/db/schema";
import { count, sql, isNotNull, gt } from "drizzle-orm";
import AdminDashboardClient from "./AdminDashboardClient";

export const runtime = 'edge';

export default async function AdminPage() {
    const db = getDrizzleDb();

    // Stats
    const totalAlumni = await db.select({ count: count() }).from(alumniProfiles).get();
    const registeredAlumni = await db.select({ count: count() }).from(alumniProfiles).where(isNotNull(alumniProfiles.userId)).get();
    const totalEvents = await db.select({ count: count() }).from(events).get();
    const totalMemories = await db.select({ count: count() }).from(memories).get();
    const totalHotels = await db.select({ count: count() }).from(hotels).get();
    const totalUsers = await db.select({ count: count() }).from(users).get();

    const attendingAlumni = await db.select({ count: count() })
        .from(alumniProfiles)
        .where(gt(alumniProfiles.rsvpAdults, 0))
        .get();

    const totalAdults = await db.select({
        total: sql<number>`COALESCE(SUM(${alumniProfiles.rsvpAdults}), 0)`
    }).from(alumniProfiles).get();

    const totalKids = await db.select({
        total: sql<number>`COALESCE(SUM(${alumniProfiles.rsvpKids}), 0)`
    }).from(alumniProfiles).get();

    // Lists
    const alumniList = await db.select({
        id: alumniProfiles.id,
        fullName: alumniProfiles.fullName,
        email: alumniProfiles.email,
        rollNumber: alumniProfiles.rollNumber,
        userId: alumniProfiles.userId,
        city: alumniProfiles.city,
        country: alumniProfiles.country,
        specialization: alumniProfiles.specialization,
        rsvpAdults: alumniProfiles.rsvpAdults,
        rsvpKids: alumniProfiles.rsvpKids,
    }).from(alumniProfiles).all();

    const eventList = await db.select().from(events).all();
    const hotelList = await db.select().from(hotels).all();

    const stats = {
        totalAlumni: totalAlumni?.count || 0,
        registeredAlumni: registeredAlumni?.count || 0,
        attendingAlumni: attendingAlumni?.count || 0,
        totalEvents: totalEvents?.count || 0,
        totalMemories: totalMemories?.count || 0,
        totalHotels: totalHotels?.count || 0,
        totalUsers: totalUsers?.count || 0,
        totalAdults: totalAdults?.total || 0,
        totalKids: totalKids?.total || 0,
    };

    return (
        <AdminDashboardClient
            stats={stats}
            alumniList={alumniList}
            eventList={eventList}
            hotelList={hotelList}
        />
    );
}
