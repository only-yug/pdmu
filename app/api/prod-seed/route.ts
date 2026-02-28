import { NextResponse } from "next/server";
import { getDrizzleDb } from "@/lib/db";
import { alumniProfiles } from "@/lib/db/schema";

export const runtime = "edge";

export async function GET(req: Request) {
    try {
        const db = getDrizzleDb();

        const testProfiles = [
            { fullName: "Alumni Test 1", email: "alumnitest1@gmail.com", rollNumber: 9901 },
            { fullName: "Alumni Test 2", email: "alumnitest2@gmail.com", rollNumber: 9902 },
            { fullName: "Admin Test 1", email: "admintest1@gmail.com", rollNumber: 9903 }
        ];

        for (const profile of testProfiles) {
            await db.insert(alumniProfiles).values(profile).run();
        }

        return NextResponse.json({ success: true, message: "Successfully inserted 3 test profiles into the REMOTE production database" });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message });
    }
}
