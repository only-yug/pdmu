import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";

export const runtime = 'edge';

export async function GET() {
    try {
        const session = await auth();

        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const database = getDrizzleDb();

        let profile = await database.select()
            .from(alumniProfiles)
            .where(eq(alumniProfiles.email, session.user.email))
            .get();

        if (!profile) {
            if (session.user.role === "admin") {
                const alumniId = crypto.randomUUID();
                await database.insert(alumniProfiles).values({
                    id: alumniId,
                    email: session.user.email,
                    fullName: session.user.name || "Admin",
                    profilePhotoUrl: session.user.image,
                }).run();

                profile = await database.select()
                    .from(alumniProfiles)
                    .where(eq(alumniProfiles.email, session.user.email))
                    .get();
            } else {
                return NextResponse.json({ error: "Profile not found" }, { status: 404 });
            }
        }

        return NextResponse.json({ profile });
    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session || !session.user || !session.user.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { profileUpdateSchema } = await import("@/lib/schemas");

        const result = profileUpdateSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json(
                { error: "Validation failed", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const database = getDrizzleDb();

        const updateData: any = Object.fromEntries(
            Object.entries(result.data).filter(([__, v]) => v !== undefined)
        );

        // --- GEOCODING LOGIC ---
        // If city or country is updated, we fetch coordinates to store them permanently
        if (result.data.city || result.data.country) {
            try {
                // Construct search query
                const city = result.data.city || "";
                const country = result.data.country || "";
                const q = [city, country].filter(Boolean).join(", ");

                if (q) {
                    const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`, {
                        headers: { "User-Agent": "Antigravity-Alumni-App" }
                    });
                    const geoData = await geoRes.json() as any[];

                    if (geoData && geoData.length > 0) {
                        updateData.latitude = parseFloat(geoData[0].lat);
                        updateData.longitude = parseFloat(geoData[0].lon);
                        console.log(`✅ Geocoded ${q} to ${updateData.latitude}, ${updateData.longitude}`);
                    }
                }
            } catch (err) {
                console.error("Geocoding failed during profile update:", err);
            }
        }

        if (Object.keys(updateData).length === 0) {
            return NextResponse.json({ message: "No changes detected" });
        }

        await database.update(alumniProfiles)
            .set({ ...updateData, updatedAt: new Date() })
            .where(eq(alumniProfiles.email, session.user.email))
            .run();

        return NextResponse.json({ message: "Profile updated successfully" });

    } catch (error) {
        console.error("Profile update error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
