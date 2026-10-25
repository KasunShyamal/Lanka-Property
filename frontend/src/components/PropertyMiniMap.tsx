'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Maximize2,
  Minimize2,
  Compass,
  ExternalLink,
  Navigation,
  X,
  Layers,
} from 'lucide-react';

interface PropertyMiniMapProps {
  latitude: number;
  longitude: number;
  title: string;
  price_lkr?: number | string;
  categoryColor?: string;
  categoryName?: string;
  address?: string;
  city?: string;
  district?: string;
}

export default function PropertyMiniMap({
  latitude,
  longitude,
  title,
  price_lkr,
  categoryColor = '#10B981',
  categoryName = 'Property',
  address,
  city,
  district,
}: PropertyMiniMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const fullMapContainerRef = useRef<HTMLDivElement>(null);

  const miniMapInstanceRef = useRef<any>(null);
  const fullMapInstanceRef = useRef<any>(null);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const validLat = latitude && !isNaN(Number(latitude)) && Number(latitude) !== 0 ? Number(latitude) : 6.9271;
  const validLng = longitude && !isNaN(Number(longitude)) && Number(longitude) !== 0 ? Number(longitude) : 79.8612;
  const priceMillions = price_lkr ? (Number(price_lkr) / 1000000).toFixed(1) : null;

  // Initialize Mini Map
  useEffect(() => {
    if (typeof window === 'undefined') return;
    let isMounted = true;

    async function initMiniMap() {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }

      // Clear any previous leaflet instance id
      const container = mapContainerRef.current;
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center: [validLat, validLng],
        zoom: 15,
        zoomControl: true,
        scrollWheelZoom: false, // Prevents unintended page scroll capture
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Create Custom High-Vis Colored Pin
      const pinHtml = `
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(-50%, -100%);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1000;
        ">
          <!-- Pulsing Halo Badge in Category Color -->
          <div style="
            background: ${categoryColor};
            color: #ffffff;
            padding: 6px 14px;
            border-radius: 9999px;
            font-family: inherit;
            font-size: 12px;
            font-weight: 900;
            border: 2.5px solid #ffffff;
            box-shadow: 0 0 0 5px ${categoryColor}44, 0 8px 20px rgba(0,0,0,0.35);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 5px;
            letter-spacing: -0.01em;
          ">
            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#fef08a; box-shadow:0 0 6px #fef08a;"></span>
            <span>${priceMillions ? `LKR ${priceMillions}M` : 'Property Location'}</span>
          </div>
          <!-- Pointer Arrow -->
          <div style="
            width: 0;
            height: 0;
            border-left: 7px solid transparent;
            border-right: 7px solid transparent;
            border-top: 8px solid ${categoryColor};
            margin-top: -1px;
            filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));
          "></div>
          <!-- Pin Ground Ring -->
          <div style="
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: ${categoryColor};
            border: 2px solid #ffffff;
            margin-top: -4px;
            box-shadow: 0 0 10px ${categoryColor};
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'lp-marker-container',
        html: pinHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([validLat, validLng], { icon: customIcon }).addTo(map);

      // Neighborhood Proximity Circle (150m radius)
      L.circle([validLat, validLng], {
        radius: 150,
        color: categoryColor,
        fillColor: categoryColor,
        fillOpacity: 0.12,
        weight: 1.5,
        dashArray: '4, 4',
      }).addTo(map);

      miniMapInstanceRef.current = map;

      setTimeout(() => {
        if (map && isMounted) map.invalidateSize();
      }, 250);

      if (isMounted) setIsReady(true);
    }

    initMiniMap();

    return () => {
      isMounted = false;
      if (miniMapInstanceRef.current) {
        miniMapInstanceRef.current.remove();
        miniMapInstanceRef.current = null;
      }
    };
  }, [validLat, validLng, categoryColor, priceMillions]);

  // Initialize Full Screen Modal Map when opened
  useEffect(() => {
    if (!isFullScreen) {
      if (fullMapInstanceRef.current) {
        fullMapInstanceRef.current.remove();
        fullMapInstanceRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function initFullMap() {
      const L = (await import('leaflet')).default;

      if (!fullMapContainerRef.current) return;

      const container = fullMapContainerRef.current;
      if ((container as any)._leaflet_id) {
        delete (container as any)._leaflet_id;
      }

      const map = L.map(container, {
        center: [validLat, validLng],
        zoom: 16,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom Pin in Full Screen
      const pinHtml = `
        <div style="
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(-50%, -100%);
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1000;
        ">
          <div style="
            background: ${categoryColor};
            color: #ffffff;
            padding: 8px 16px;
            border-radius: 9999px;
            font-family: inherit;
            font-size: 13px;
            font-weight: 900;
            border: 3px solid #ffffff;
            box-shadow: 0 0 0 6px ${categoryColor}44, 0 10px 25px rgba(0,0,0,0.4);
            white-space: nowrap;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#fef08a; box-shadow:0 0 8px #fef08a;"></span>
            <span>${priceMillions ? `★ LKR ${priceMillions}M` : 'Property'}</span>
          </div>
          <div style="
            width: 0;
            height: 0;
            border-left: 8px solid transparent;
            border-right: 8px solid transparent;
            border-top: 9px solid ${categoryColor};
            margin-top: -1px;
          "></div>
          <div style="
            width: 10px;
            height: 10px;
            border-radius: 50%;
            background: ${categoryColor};
            border: 2px solid #ffffff;
            margin-top: -5px;
          "></div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: 'lp-marker-container',
        html: pinHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      L.marker([validLat, validLng], { icon: customIcon }).addTo(map);

      // Neighborhood 200m circle
      L.circle([validLat, validLng], {
        radius: 200,
        color: categoryColor,
        fillColor: categoryColor,
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);

      fullMapInstanceRef.current = map;

      setTimeout(() => {
        if (map && isMounted) map.invalidateSize();
      }, 300);
    }

    initFullMap();

    return () => {
      isMounted = false;
      if (fullMapInstanceRef.current) {
        fullMapInstanceRef.current.remove();
        fullMapInstanceRef.current = null;
      }
    };
  }, [isFullScreen, validLat, validLng, categoryColor, priceMillions]);

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${validLat},${validLng}`;

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden group">
      {/* Mini Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Floating Action Controls on Top Right */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5">
        {/* Full Map Expander Icon Button */}
        <button
          type="button"
          onClick={() => setIsFullScreen(true)}
          title="Expand Full Screen Map"
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-emerald-700 shadow-md border border-slate-200/80 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <Maximize2 className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Full Map</span>
        </button>

        {/* Google Maps Directions */}
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Open in Google Maps / Get Directions"
          className="p-2 rounded-xl bg-white/95 backdrop-blur-md hover:bg-white text-slate-700 hover:text-sky-600 shadow-md border border-slate-200/80 transition active:scale-95 flex items-center gap-1.5 text-xs font-bold"
        >
          <Navigation className="w-4 h-4 text-sky-600" />
          <span className="hidden sm:inline">Directions</span>
        </a>

        {/* Explore on LankaProperty Map Explorer */}
        <Link
          href={`/map?city=${encodeURIComponent(city || '')}`}
          title="Explore Sri Lanka Map View"
          className="p-2 rounded-xl bg-slate-900/90 backdrop-blur-md hover:bg-slate-950 text-white shadow-md transition active:scale-95 flex items-center gap-1 text-xs font-bold"
        >
          <Compass className="w-4 h-4 text-emerald-400" />
          <span className="hidden md:inline">Map View</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </Link>
      </div>

      {/* Bottom Floating Info Pill */}
      <div className="absolute bottom-3 left-3 z-20 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-md text-[11px] text-slate-600 font-semibold flex items-center gap-2 pointer-events-none">
        <span
          className="w-2 h-2 rounded-full shrink-0 shadow-xs"
          style={{ backgroundColor: categoryColor }}
        />
        <span className="truncate max-w-[220px]">
          {city ? `${city}, ` : ''}{district || 'Sri Lanka'}
        </span>
        <span className="text-slate-300">|</span>
        <span className="text-[10px] text-slate-400 font-mono">
          {validLat.toFixed(4)}°N, {validLng.toFixed(4)}°E
        </span>
      </div>

      {/* ============================================================== */}
      {/* FULL-SCREEN INTERACTIVE MAP MODAL                              */}
      {/* ============================================================== */}
      {isFullScreen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          {/* Top Bar */}
          <div className="bg-slate-900/95 text-white px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between shrink-0 shadow-lg">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                style={{ backgroundColor: categoryColor }}
              >
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span
                    className="text-[10px] font-black uppercase px-2 py-0.2 rounded text-white"
                    style={{ backgroundColor: categoryColor }}
                  >
                    {categoryName}
                  </span>
                  <h3 className="font-extrabold text-sm sm:text-base text-white truncate">
                    {title}
                  </h3>
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {address ? `${address}, ` : ''}{city}, {district} &bull; GPS: {validLat.toFixed(6)}, {validLng.toFixed(6)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
              <Link
                href={`/map?city=${encodeURIComponent(city || '')}`}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 transition"
              >
                <Compass className="w-4 h-4" />
                <span>Full Map Explorer</span>
              </Link>

              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-sky-400 transition"
              >
                <Navigation className="w-4 h-4" />
                <span>Google Maps</span>
              </a>

              <button
                type="button"
                onClick={() => setIsFullScreen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Full Screen Map View */}
          <div className="flex-1 w-full h-full relative">
            <div ref={fullMapContainerRef} className="w-full h-full" />

            {/* Floating Details Footer inside Modal */}
            <div className="absolute bottom-6 left-6 right-6 sm:right-auto sm:max-w-md bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 z-20">
              <div className="flex items-center justify-between mb-1.5">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: categoryColor }}
                >
                  {categoryName}
                </span>
                {priceMillions && (
                  <span className="text-sm font-black text-brand-dark">
                    LKR {priceMillions}M
                  </span>
                )}
              </div>
              <h4 className="text-xs font-bold text-slate-900 truncate mb-1">
                {title}
              </h4>
              <p className="text-[11px] text-slate-500 mb-3 truncate">
                📍 {address ? `${address}, ` : ''}{city}, {district}
              </p>
              <div className="flex items-center gap-2">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Get Directions</span>
                </a>
                <Link
                  href={`/map?city=${encodeURIComponent(city || '')}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold text-center transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Map Explorer</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
