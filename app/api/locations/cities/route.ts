import { NextResponse } from "next/server";
import { City, State, Country } from "country-state-city";

export const runtime = 'edge';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const countryName = searchParams.get("country");
        const stateName = searchParams.get("state");

        if (!countryName || !stateName) {
            return NextResponse.json({ error: "Country and state names are required" }, { status: 400 });
        }

        const country = Country.getAllCountries().find(c => c.name === countryName);
        if (!country) return NextResponse.json({ cities: [] });

        const state = State.getStatesOfCountry(country.isoCode).find(s => s.name === stateName);
        if (!state) return NextResponse.json({ cities: [] });

        const cities = City.getCitiesOfState(country.isoCode, state.isoCode);
        const cityNames = cities.map(c => c.name).sort();

        return NextResponse.json({ cities: cityNames });
    } catch (error) {
        console.error("Error fetching cities:", error);
        return NextResponse.json({ error: "Failed to fetch cities" }, { status: 500 });
    }
}
