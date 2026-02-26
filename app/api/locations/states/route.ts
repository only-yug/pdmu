import { NextResponse } from "next/server";
import { State, Country } from "country-state-city";

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const countryName = searchParams.get("country");

        if (!countryName) {
            return NextResponse.json({ error: "Country name is required" }, { status: 400 });
        }

        // Find the country object to get its ISO code
        const countries = Country.getAllCountries();
        const country = countries.find(c => c.name === countryName);

        if (!country) {
            return NextResponse.json({ states: [] });
        }

        // Get states for the found country ISO code
        const states = State.getStatesOfCountry(country.isoCode);
        const stateNames = states.map(s => s.name).sort();

        return NextResponse.json({ states: stateNames });
    } catch (error) {
        console.error("Error fetching states:", error);
        return NextResponse.json({ error: "Failed to fetch states" }, { status: 500 });
    }
}
