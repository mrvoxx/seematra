// components/global/MapView.tsx
'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import type { IMapPin } from '@/types';
import Link from 'next/link';

// We define the icon inside the component or export a function to get it.
let customIcon: L.Icon | undefined;
function getCustomIcon() {
  if (typeof window === 'undefined') return undefined as any;
  if (!customIcon) {
    customIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });
  }
  return customIcon;
}

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
      <style>{`
        .custom-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0;
          overflow: hidden;
          border-radius: 0.75rem;
          background: transparent;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
        }
        .custom-leaflet-popup .leaflet-popup-content {
          margin: 0;
          width: auto !important;
        }
        .custom-leaflet-popup .leaflet-popup-tip {
          background: var(--color-surface);
        }
        .dark .custom-leaflet-popup .leaflet-popup-tip {
          background: var(--color-surface-dark);
        }
      `}</style>
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
          <Marker key={`${pin.itineraryId}-${index}`} position={[pin.lat, pin.lng]} icon={getCustomIcon()}>
            <Popup className="seematra-popup custom-leaflet-popup">
              <div className="flex flex-col w-[240px] font-inter overflow-hidden rounded-xl bg-surface dark:bg-surface-dark border border-brand-border dark:border-brand-border-dark">
                <div className="relative h-32 w-full">
                  <img src={pin.thumbnail} alt={pin.title} className="absolute inset-0 w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h4 className="font-outfit font-bold text-lg leading-tight drop-shadow-md line-clamp-2">{pin.title}</h4>
                  </div>
                </div>
                <div className="p-4 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-brand-text-secondary uppercase tracking-wider font-bold">Price</span>
                    <span className="text-primary font-black text-base">₹{pin.price.toLocaleString('en-IN')}</span>
                  </div>
                  <Link 
                    href={`/itineraries/${pin.itineraryId}`}
                    className="w-full bg-primary text-white text-center py-2.5 rounded-lg text-sm font-bold tracking-wide hover:bg-primary-dark hover:-translate-y-0.5 active:translate-y-0 transition-all shadow-md"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
