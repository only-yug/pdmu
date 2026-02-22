"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon path issues in Next.js
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Marker Icon (Optional: use custom styled markers if requested, but default is fine for now)

// Mock Geocoding Data (Since we don't have lat/lng in DB yet)
const CITY_COORDINATES: Record<string, [number, number]> = {
    "Ahmedabad": [23.0225, 72.5714],
    "Rajkot": [22.3039, 70.8022],
    "Mumbai": [19.0760, 72.8777],
    "Delhi": [28.7041, 77.1025],
    "Bangalore": [12.9716, 77.5946],
    "Chennai": [13.0827, 80.2707],
    "Kolkata": [22.5726, 88.3639],
    "Surat": [21.1702, 72.8311],
    "Pune": [18.5204, 73.8567],
    "Jaipur": [26.9124, 75.7873],
    "Lucknow": [26.8467, 80.9462],
    "Hyderabad": [17.3850, 78.4867],
    "Nagpur": [21.1458, 79.0882],
    "Indore": [22.7196, 75.8577],
    "Vadodara": [22.3072, 73.1812],
    "Bhopal": [23.2599, 77.4126],
    "Visakhapatnam": [17.6868, 83.2185],
    "Patna": [25.5941, 85.1376],
    "Jamnagar": [22.4707, 70.0577],
    "USA": [37.0902, -95.7129],
    "UK": [55.3781, -3.4360],
    "Canada": [56.1304, -106.3468],
    "Australia": [-25.2744, 133.7751],
    "Dubai": [25.2048, 55.2708],
    "London": [51.5074, -0.1278],
    "New York": [40.7128, -74.0060],
    // Default fallback
    "India": [20.5937, 78.9629]
};

// Component to fit bounds
function MapBounds({ markers }: { markers: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const bounds = L.latLngBounds(markers.map(m => m.position));
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }, [markers, map]);

    return null;
}

export default function MapComponent({ alumni }: { alumni: any[] }) {
    const [coordinateCache, setCoordinateCache] = useState<Record<string, [number, number]>>(CITY_COORDINATES);
    const fetchingRef = useRef<Set<string>>(new Set());

    useEffect(() => {
        let isMounted = true;

        const fetchMissingCoordinates = async () => {
            const missingLocations = new Set<string>();

            alumni.forEach(person => {
                const locationKey = person.city || person.country;
                if (!locationKey) return;

                // Check if it exists in cache (case-insensitive)
                const exists = Object.keys(coordinateCache).find(k => k.toLowerCase() === locationKey.toLowerCase());

                if (!exists && !fetchingRef.current.has(locationKey.toLowerCase())) {
                    missingLocations.add(locationKey);
                }
            });

            if (missingLocations.size === 0) return;

            // Fetch sequentially to respect Nominatim rate limit (1 req/sec)
            for (const location of missingLocations) {
                if (!isMounted) break;

                // Mark as fetching
                fetchingRef.current.add(location.toLowerCase());

                try {
                    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`);
                    const data = await response.json() as any[];

                    if (data && data.length > 0 && isMounted) {
                        const lat = parseFloat(data[0].lat);
                        const lon = parseFloat(data[0].lon);

                        setCoordinateCache(prev => ({
                            ...prev,
                            [location]: [lat, lon]
                        }));
                    }
                } catch (error) {
                    console.error(`Geocoding failed for ${location}:`, error);
                }

                // Wait 1.5 seconds between requests
                await new Promise(resolve => setTimeout(resolve, 1500));
            }
        };

        fetchMissingCoordinates();

        return () => {
            isMounted = false;
        };
    }, [alumni, coordinateCache]);

    // Convert alumni to markers
    const markers = alumni.map(person => {
        // Try city, then country, then fallback
        const locationKey = person.city || person.country || "India";
        // Normalize checking (case-insensitive find)
        const key = Object.keys(coordinateCache).find(k => k.toLowerCase() === locationKey.toLowerCase())
            || (person.country ? Object.keys(coordinateCache).find(k => k.toLowerCase() === person.country.toLowerCase()) : null)
            || "India";

        // Add random jitter to avoid exact overlap
        const baseCoords = coordinateCache[key] || coordinateCache["India"];
        const jitterLat = (Math.random() - 0.5) * 0.01;
        const jitterLng = (Math.random() - 0.5) * 0.01;

        return {
            ...person,
            position: [baseCoords[0] + jitterLat, baseCoords[1] + jitterLng] as [number, number]
        };
    }).filter(m => m.position); // Ensure valid positions

    return (
        <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-0 ring-1 ring-black/5 dark:ring-white/10 z-0 relative">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                scrollWheelZoom={true} // "Fluid" zooming
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false} // Clean UI
                attributionControl={false} // Clean UI
            >
                <TileLayer
                    // Using a clean, light map style (CartoDB Positron) for "floating" look
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup>
                            <div className="text-center p-2">
                                <div className="font-bold text-gray-900 text-sm mb-1">{marker.name}</div>
                                <div className="text-xs text-gray-500">{marker.city}, {marker.country}</div>
                                {marker.position_title && <div className="text-xs text-blue-600 mt-1">{marker.position_title}</div>}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds markers={markers} />
            </MapContainer>

            {/* Custom overlay controls could go here if needed */}
        </div>
    );
}
