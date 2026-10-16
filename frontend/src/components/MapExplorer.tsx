'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Bed, Bath, ArrowRight, Layers, Maximize2, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';

export default function MapExplorer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: string]: any }>({});

  const [isMapReady, setIsMapReady] = useState(false);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  // 1. Fetch properties
  useEffect(() => {
    loadProperties();
  }, [cityFilter]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await api.getProperties({ city: cityFilter || undefined });
      const items = res.items || [];
      setProperties(items);
      if (items.length > 0 && !selectedProperty) {
        setSelectedProperty(items[0]);
      }
    } catch (err) {
      console.error('Failed to load map properties', err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Initialize Leaflet map
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isMounted = true;

    async function initLeafletMap() {
      const L = (await import('leaflet')).default;

      if (!mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      // Center on Colombo, Sri Lanka
      const map = L.map(mapContainerRef.current, {
        center: [6.9271, 79.8612],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Trigger size invalidation to prevent grey tile gaps
      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 250);

      mapInstanceRef.current = map;
      if (isMounted) {
        setIsMapReady(true);
      }
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        setIsMapReady(false);
      }
    };
  }, []);

  // 3. Render and update markers whenever properties, selectedProperty, or isMapReady change
  useEffect(() => {
    if (!isMapReady || !mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      Object.values(markersRef.current).forEach((m: any) => m.remove());
      markersRef.current = {};

      const bounds: [number, number][] = [];

      properties.forEach((prop) => {
        const lat = Number(prop.latitude);
        const lng = Number(prop.longitude);
        if (isNaN(lat) || isNaN(lng)) return;

        bounds.push([lat, lng]);

        const isSelected = selectedProperty?.id === prop.id;
        const priceLabel = `LKR ${(Number(prop.price_lkr) / 1000000).toFixed(1)}M`;

        // Highlighted vs Standard Pin styling
        const html = isSelected
          ? `
            <div style="
              position: relative;
              background: linear-gradient(135deg, #059669 0%, #10B981 100%);
              color: #ffffff;
              padding: 6px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 900;
              border: 3px solid #ffffff;
              box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.4), 0 8px 20px rgba(0,0,0,0.35);
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -100%) scale(1.15);
              transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
              z-index: 9999;
              display: flex;
              align-items: center;
              gap: 4px;
            ">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#ffffff; animation: pulse 1s infinite;"></span>
              <span>${priceLabel}</span>
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 7px solid transparent;
                border-right: 7px solid transparent;
                border-top: 8px solid #059669;
              "></div>
            </div>
          `
          : `
            <div style="
              position: relative;
              background: #0B192C;
              color: #ffffff;
              padding: 4px 9px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              border: 2px solid #10B981;
              box-shadow: 0 4px 12px rgba(0,0,0,0.25);
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -100%);
              transition: all 0.2s ease;
            ">
              <span>${priceLabel}</span>
              <div style="
                position: absolute;
                bottom: -6px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 5px solid transparent;
                border-right: 5px solid transparent;
                border-top: 6px solid #0B192C;
              "></div>
            </div>
          `;

        const customIcon = L.divIcon({
          className: 'lp-marker-container',
          html,
          iconSize: [80, 36],
          iconAnchor: [40, 18],
        });

        const marker = L.marker([lat, lng], {
          icon: customIcon,
          zIndexOffset: isSelected ? 1000 : 100,
        }).addTo(map);

        marker.on('click', () => {
          setSelectedProperty(prop);
          map.panTo([lat, lng], { animate: true, duration: 0.6 });
        });

        markersRef.current[prop.id] = marker;
      });

      // Fit bounds on first load if bounds exist
      if (bounds.length > 0 && !selectedProperty) {
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
      }
    });
  }, [properties, selectedProperty?.id, isMapReady]);

  // When user clicks a property in the sidebar
  const handleSelectProperty = (prop: any) => {
    setSelectedProperty(prop);
    const lat = Number(prop.latitude);
    const lng = Number(prop.longitude);
    if (mapInstanceRef.current && !isNaN(lat) && !isNaN(lng)) {
      mapInstanceRef.current.panTo([lat, lng], { animate: true, duration: 0.7 });
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative">
      {/* Left Sidebar List */}
      <div className="w-full md:w-[420px] lg:w-[460px] h-1/2 md:h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-20">
        <div className="p-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-base font-extrabold text-brand-dark flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Sri Lanka Map Explorer</span>
            </h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {properties.length} Active Listings
            </span>
          </div>

          {/* Quick city filter */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {['', 'Colombo 07', 'Colombo 03', 'Rajagiriya', 'Galle Fort', 'Kandy'].map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-2.5 py-1 rounded-lg shrink-0 transition font-medium ${
                  cityFilter === city
                    ? 'bg-brand-dark text-white font-bold'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {city || 'All Cities'}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-2" />
              <p>Locating verified properties on map...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No listings found in this area.</div>
          ) : (
            properties.map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3 ${
                    isSelected
                      ? 'bg-emerald-50 border-2 border-emerald-500 shadow-md scale-[1.01]'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="w-24 h-20 rounded-xl bg-slate-200 overflow-hidden shrink-0 relative">
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    {prop.is_exchange_eligible && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                        Swap
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black text-brand-dark">
                        LKR {(Number(prop.price_lkr) / 1000000).toFixed(1)}M
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Selected
                        </span>
                      )}
                    </div>
                    {Number(prop.land_perches) > 0 && (
                      <div className="text-[11px] text-emerald-700 font-semibold truncate">
                        LKR {(Number(prop.price_per_perch) / 1000000).toFixed(2)}M / perch ({prop.land_perches}P)
                      </div>
                    )}
                    <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">{prop.title}</h4>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-1 truncate">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{prop.city}, {prop.district}</span>
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="w-full md:flex-1 h-1/2 md:h-full relative z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Preview Card on Map */}
        {selectedProperty && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-emerald-500 z-30 transition-all animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                <img
                  src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-brand-dark/90 text-white text-[9px] font-bold">
                  {selectedProperty.city}
                </span>
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <div className="text-base font-black text-brand-dark tracking-tight">
                      LKR {(Number(selectedProperty.price_lkr) / 1000000).toFixed(1)}M
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Highlighted Pin
                    </span>
                  </div>
                  {Number(selectedProperty.land_perches) > 0 && (
                    <div className="text-[11px] text-emerald-700 font-semibold">
                      LKR {(Number(selectedProperty.price_per_perch) / 1000000).toFixed(2)}M / perch
                    </div>
                  )}
                  <h3 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                    {selectedProperty.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 truncate">
                    {selectedProperty.address}, {selectedProperty.city}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 text-[11px] text-slate-600">
                    {selectedProperty.bedrooms > 0 && <span>{selectedProperty.bedrooms} Beds</span>}
                    {selectedProperty.floor_sqft > 0 && <span>{selectedProperty.floor_sqft} sqft</span>}
                  </div>

                  <Link
                    href={`/property/${selectedProperty.id}`}
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm active:scale-95"
                  >
                    <span>View Property</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
