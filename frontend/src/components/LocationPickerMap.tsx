'use client';

import { useEffect, useRef, useState } from 'react';
import { MapPin, Navigation, Sparkles } from 'lucide-react';

interface LocationPickerProps {
  latitude: number;
  longitude: number;
  onChange: (coords: { lat: number; lng: number }) => void;
}

export default function LocationPickerMap({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [isReady, setIsReady] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    async function initMap() {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const initialLat = latitude || 6.9271;
      const initialLng = longitude || 79.8612;

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 13,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom draggable pin
      const pinHtml = `
        <div style="
          background: #059669;
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          font-weight: 800;
          font-size: 11px;
          border: 2px solid white;
          box-shadow: 0 4px 15px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 4px;
          cursor: grab;
          transform: translate(-50%, -100%);
        ">
          <span>📍 Pin Location</span>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'lp-marker-container',
        html: pinHtml,
        iconSize: [110, 32],
        iconAnchor: [55, 16],
      });

      const marker = L.marker([initialLat, initialLng], {
        icon: customIcon,
        draggable: true,
      }).addTo(map);

      // Handle marker drag
      marker.on('dragend', (e: any) => {
        const { lat, lng } = e.target.getLatLng();
        onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
      });

      // Handle map click
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        marker.setLatLng([lat, lng]);
        onChange({ lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)) });
      });

      markerRef.current = marker;
      mapInstanceRef.current = map;

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);

      if (isMounted) setIsReady(true);
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsReady(false);
      }
    };
  }, []);

  // Sync external coordinates
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setLatLng([latitude, longitude]);
    }
  }, [latitude, longitude]);

  const presetLocations = [
    { name: 'Colombo 07', lat: 6.9065, lng: 79.8708 },
    { name: 'Colombo 03', lat: 6.9182, lng: 79.8488 },
    { name: 'Rajagiriya', lat: 6.8912, lng: 79.8894 },
    { name: 'Kandy', lat: 7.2721, lng: 80.6288 },
    { name: 'Galle Fort', lat: 6.0329, lng: 80.2168 },
    { name: 'Negombo', lat: 7.2083, lng: 79.8358 },
  ];

  const handleSelectPreset = (lat: number, lng: number) => {
    onChange({ lat, lng });
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.panTo([lat, lng], { animate: true });
      markerRef.current.setLatLng([lat, lng]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <span>Interactive Location &amp; GPS Coordinates Picker *</span>
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          Click map or drag the pin to pinpoint the property
        </span>
      </div>

      {/* Quick Location Presets */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 font-medium shrink-0">Jump to:</span>
        {presetLocations.map((loc) => (
          <button
            key={loc.name}
            type="button"
            onClick={() => handleSelectPreset(loc.lat, loc.lng)}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-600 font-semibold transition shrink-0 border border-slate-200"
          >
            {loc.name}
          </button>
        ))}
      </div>

      {/* Map Container (Isolated Stacking Context so Leaflet cannot bleed over dropdowns) */}
      <div className="relative isolate z-0 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-inner h-64 sm:h-72 bg-slate-100">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Live Coordinate Fields */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Latitude (GPS)
          </label>
          <input
            type="number"
            step="0.000001"
            value={latitude}
            onChange={(e) => onChange({ lat: Number(e.target.value), lng: longitude })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">
            Longitude (GPS)
          </label>
          <input
            type="number"
            step="0.000001"
            value={longitude}
            onChange={(e) => onChange({ lat: latitude, lng: Number(e.target.value) })}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>
      </div>
    </div>
  );
}
