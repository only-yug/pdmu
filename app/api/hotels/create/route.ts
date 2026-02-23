import { NextRequest, NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { hotels } from "@/lib/db/schema";
import { auth } from "@/auth";

export const runtime = 'edge';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as Record<string, any>;
        const { name, description, website_url } = body;

        if (!name || !website_url) {
            return NextResponse.json({ success: false, message: "Name and Website URL are required" }, { status: 400 });
        }

        const session = await auth();

        if (!session?.user?.alumniProfileId && session?.user?.role !== 'admin') {
            return NextResponse.json({ success: false, message: "Unauthorized: Only batchmates or admins can suggest hotels" }, { status: 403 });
        }

        const userId = session.user.id;

        const db = getDrizzleDb();

        // Insert new hotel
        await db.insert(hotels).values({
            id: crypto.randomUUID(),
            hotelName: name,
            description,
            websiteUrl: website_url,
            userId: userId,
        }).run();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error creating hotel:", error);
        return NextResponse.json({ success: false, error: "Failed to create hotel" }, { status: 500 });
    }
}
