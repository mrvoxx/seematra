// components/global/MapView.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { IMapPin } from '@/types';
import Link from 'next/link';

// Fix leaflet default icon issue in Next.js
const customIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Helper component to auto-fit bounds
function MapBounds({ pins }: { pins: IMapPin[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 0) {
      const bounds = L.latLngBounds(pins.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else {
      // Default Uttarakhand center
      map.setView([30.0668, 79.0193], 7);
    }
  }, [map, pins]);
  return null;
}

interface MapViewProps {
  pins: IMapPin[];
  height?: string;
  interactive?: boolean;
}

export default function MapView({ pins, height = 'h-[500px]', interactive = true }: MapViewProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className={`${height} w-full bg-surface-dark/10 animate-pulse rounded-xl`} />;

  return (
    <div className="w-full h-[300px] md:h-[500px] rounded-xl overflow-hidden shadow-md z-0 relative border border-brand-border dark:border-brand-border-dark">
      <MapContainer 
        center={[30.0668, 79.0193]} // Uttarakhand center
        zoom={7} 
        scrollWheelZoom={interactive}
        dragging={interactive}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds pins={pins} />
        {pins.map((pin, index) => (
          <Marker key={`${pin.itineraryId}-${index}`} position={[pin.lat, pin.lng]} icon={customIcon}>
            <Popup className="seematra-popup rounded-lg border-2 border-primary">
              <div className="flex flex-col gap-2 min-w-[200px] p-1 font-inter">
                <img src={pin.thumbnail} alt={pin.title} className="w-full h-24 object-cover rounded-md" />
                <h4 className="font-outfit font-bold text-base leading-tight mt-1">{pin.title}</h4>
                <p className="text-primary font-bold text-sm">₹{pin.price.toLocaleString('en-IN')}</p>
                <Link 
                  href={`/itineraries/${pin.itineraryId}`}
                  className="mt-1 bg-primary text-surface text-center py-1.5 rounded-md text-xs font-bold hover:bg-primary-dark transition-colors"
                >
                  View Package
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
