"use client";

import { useEffect } from "react";
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

// Component to fit bounds
function MapBounds({ markers }: { markers: any[] }) {
    const map = useMap();

    useEffect(() => {
        if (markers.length > 0) {
            const validMarkers = markers.filter(m => m.position && !isNaN(m.position[0]));
            if (validMarkers.length > 0) {
                const bounds = L.latLngBounds(validMarkers.map(m => m.position));
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 8 });
            }
        }
    }, [markers, map]);

    return null;
}

export default function MapComponent({ alumni }: { alumni: any[] }) {
    // Convert alumni to markers based ONLY on database coordinates
    const markers = alumni
        .filter(person => person.latitude && person.longitude) // Only show users with saved coords
        .map(person => {
            // Add slight jitter to avoid exact overlap for people in the same building/city
            // Use their ID as a seed for consistent jitter
            const seed = person.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
            const jitterLat = ((seed % 100) / 100 - 0.5) * 0.05;
            const jitterLng = (((seed * 1.5) % 100) / 100 - 0.5) * 0.05;

            return {
                ...person,
                position: [person.latitude + jitterLat, person.longitude + jitterLng] as [number, number]
            };
        });

    return (
        <div className="h-[600px] w-full rounded-[2.5rem] overflow-hidden shadow-2xl transform transition-transform duration-500 hover:-translate-y-2 hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border-0 ring-1 ring-black/5 dark:ring-white/10 z-0 relative">
            <MapContainer
                center={[20.5937, 78.9629]}
                zoom={5}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%", zIndex: 0 }}
                zoomControl={false}
                attributionControl={false}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {markers.map((marker) => (
                    <Marker key={marker.id} position={marker.position}>
                        <Popup>
                            <div className="text-center p-2">
                                <div className="font-bold text-gray-900 text-sm mb-1">{marker.name}</div>
                                <div className="text-xs text-gray-500">{marker.city}, {marker.country}</div>
                                {marker.position && (
                                    <div className="text-xs text-blue-600 mt-1">{marker.position}</div>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                ))}

                <MapBounds markers={markers} />
            </MapContainer>
        </div>
    );
}
