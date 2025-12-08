
'use client';

import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import { useEffect, useRef } from 'react';
import { LatLngExpression } from 'leaflet';
import dynamic from 'next/dynamic';

// Sample data: [latitude, longitude, intensity]
const addressPoints: [number, number, number][] = [
  [28.6139, 77.2090, 0.8],
  [28.6145, 77.2095, 0.9],
  [28.6150, 77.2100, 1.0],
  [28.5275, 77.2058, 0.7],
  [28.5280, 77.2063, 0.8],
  [28.5270, 77.2053, 0.6],
  [28.6329, 77.2195, 0.9],
  [28.6335, 77.2200, 1.0],
  [28.6324, 77.2190, 0.8],
  [28.5800, 77.2300, 0.5],
  [28.5805, 77.2305, 0.6],
];

// Heatmap component that uses the useMap hook
const HeatmapLayer = () => {
    const map = useMap();

    useEffect(() => {
        const L = require('leaflet');
        // Ensure this runs only once per map instance by checking for a custom property
        if (!(map as any)._heatmapLayer) {
            const heatLayer = (L.heatLayer as any)(addressPoints, {
                radius: 25,
                blur: 15,
                maxZoom: 18,
                gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
            }).addTo(map);
            (map as any)._heatmapLayer = heatLayer;
        }
    }, [map]);

    return null;
};

// Dynamic import to ensure Leaflet is loaded on the client side
const OutbreakHeatmapComponent = () => {
    const position: LatLngExpression = [28.6139, 77.2090]; // Center map on Delhi
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        // This effect hook handles the cleanup.
        // It's crucial for preventing the "Map container is already initialized" error during development with HMR.
        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    return (
        <MapContainer
            center={position}
            zoom={12}
            scrollWheelZoom={false}
            style={{ height: '100%', width: '100%' }}
            className='rounded-lg'
            whenCreated={map => { mapInstance.current = map; }}
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <HeatmapLayer />
        </MapContainer>
    );
};

export const OutbreakHeatmap = dynamic(() => Promise.resolve(OutbreakHeatmapComponent), {
    ssr: false,
    loading: () => <div className="h-full w-full bg-muted animate-pulse rounded-lg" />
});
