'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { MapPin, Bed, Bath, ArrowRight, Layers, Eye } from 'lucide-react';
import { api } from '@/lib/api';

export default function MapExplorer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    loadProperties();
  }, [cityFilter]);

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await api.getProperties({ city: cityFilter || undefined });
      setProperties(res.items || []);
      if (res.items && res.items.length > 0 && !selectedProperty) {
        setSelectedProperty(res.items[0]);
      }
    } catch (err) {
      console.error('Failed to load map properties', err);
    } finally {
      setLoading(false);
    }
  };

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

      mapInstanceRef.current = map;
    }

    initLeafletMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map markers when properties change
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    import('leaflet').then((L) => {
      const map = mapInstanceRef.current;

      // Clear existing markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      const bounds: [number, number][] = [];

      properties.forEach((prop) => {
        if (!prop.latitude || !prop.longitude) return;

        bounds.push([prop.latitude, prop.longitude]);

        // Custom HTML Price Pin
        const priceLabel = `LKR ${(Number(prop.price_lkr) / 1000000).toFixed(1)}M`;
        const customIcon = L.divIcon({
          className: 'custom-map-pin',
          html: `
            <div style="
              background: #0B192C;
              color: #ffffff;
              padding: 4px 8px;
              border-radius: 8px;
              font-size: 11px;
              font-weight: 800;
              border: 2px solid #10B981;
              box-shadow: 0 4px 12px rgba(0,0,0,0.3);
              white-space: nowrap;
              cursor: pointer;
              transform: translate(-50%, -50%);
            ">
              ${priceLabel}
            </div>
          `,
          iconSize: [80, 30],
          iconAnchor: [40, 15],
        });

        const marker = L.marker([prop.latitude, prop.longitude], { icon: customIcon }).addTo(map);

        marker.on('click', () => {
          setSelectedProperty(prop);
          map.panTo([prop.latitude, prop.longitude], { animate: true });
        });

        markersRef.current.push(marker);
      });

      if (bounds.length > 0) {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
      }
    });
  }, [properties]);

  const handleSelectProperty = (prop: any) => {
    setSelectedProperty(prop);
    if (mapInstanceRef.current && prop.latitude && prop.longitude) {
      mapInstanceRef.current.panTo([prop.latitude, prop.longitude], { animate: true });
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
              {properties.length} Listings
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
              <p>Locating verified properties...</p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">No listings found on map.</div>
          ) : (
            properties.map((prop) => (
              <div
                key={prop.id}
                onClick={() => handleSelectProperty(prop)}
                className={`p-3 rounded-xl cursor-pointer transition flex gap-3 ${
                  selectedProperty?.id === prop.id
                    ? 'bg-emerald-50/80 border border-emerald-300'
                    : 'hover:bg-slate-50 border border-transparent'
                }`}
              >
                <div className="w-24 h-20 rounded-lg bg-slate-200 overflow-hidden shrink-0 relative">
                  <img
                    src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                  {prop.is_exchange_eligible && (
                    <span className="absolute bottom-1 left-1 px-1 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                      Swap
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-sm font-extrabold text-brand-dark">
                    LKR {(Number(prop.price_lkr) / 1000000).toFixed(1)}M
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
            ))
          )}
        </div>
      </div>

      {/* Right Map Canvas */}
      <div className="w-full md:flex-1 h-1/2 md:h-full relative z-10">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Preview Card on Map */}
        {selectedProperty && (
          <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-slate-200 z-30 transition-all">
            <div className="flex gap-3">
              <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                <img
                  src={selectedProperty.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                  alt={selectedProperty.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="text-base font-black text-brand-dark tracking-tight">
                    LKR {(Number(selectedProperty.price_lkr) / 1000000).toFixed(1)}M
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
                    className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm"
                  >
                    <span>View</span>
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
