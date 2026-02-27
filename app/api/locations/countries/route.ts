import { NextResponse } from "next/server";
import { Country } from "country-state-city";

export const runtime = 'edge';

export async function GET() {
    try {
        const countries = Country.getAllCountries();
        const countryNames = countries.map(c => c.name).sort();
        return NextResponse.json({ countries: countryNames });
    } catch (error) {
        console.error("Error fetching countries:", error);
        return NextResponse.json({ error: "Failed to fetch countries" }, { status: 500 });
    }
}
