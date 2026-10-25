'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import L from 'leaflet';
import {
  MapPin,
  ArrowRight,
  Layers,
  Sparkles,
  Compass,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { api, PropertyCategoryItem } from '@/lib/api';

export default function MapExplorer() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);
  const [layerGroup, setLayerGroup] = useState<L.LayerGroup | null>(null);

  const [properties, setProperties] = useState<any[]>([]);
  const [categories, setCategories] = useState<PropertyCategoryItem[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const initialFitDoneRef = useRef(false);

  // 1. Fetch categories on mount
  useEffect(() => {
    api.getPropertyCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
        }
      })
      .catch((err) => console.warn('Could not load categories in map:', err));
  }, []);

  // 2. Fetch properties from API whenever filters change
  useEffect(() => {
    let isCancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const res = await api.getProperties({
          city: cityFilter || undefined,
          property_type: categoryFilter || undefined,
        });
        if (!isCancelled) {
          const items = res.items || [];
          setProperties(items);
          if (items.length > 0) {
            setSelectedProperty(items[0]);
          } else {
            setSelectedProperty(null);
          }
          // Reset initial fit when filter changes
          initialFitDoneRef.current = false;
        }
      } catch (err) {
        console.error('Failed to load map properties:', err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isCancelled = true;
    };
  }, [cityFilter, categoryFilter]);

  // 3. Initialize Leaflet Map once
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstance) return;

    // Check if container already has a Leaflet map attached
    const container = mapContainerRef.current;
    if ((container as any)._leaflet_id) {
      delete (container as any)._leaflet_id;
    }

    // Default center on Sri Lanka
    const map = L.map(container, {
      center: [6.9271, 79.8612],
      zoom: 12,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    const lg = L.layerGroup().addTo(map);

    setMapInstance(map);
    setLayerGroup(lg);

    // Invalidate size to ensure full container coverage
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 300);

    return () => {
      clearTimeout(timer);
      map.remove();
      setMapInstance(null);
      setLayerGroup(null);
    };
  }, []);

  // 4. Render markers whenever mapInstance, layerGroup, properties, categories, or selectedProperty changes
  useEffect(() => {
    if (!mapInstance || !layerGroup) return;

    // Clear previous markers
    layerGroup.clearLayers();

    if (properties.length === 0) return;

    const bounds: [number, number][] = [];

    properties.forEach((prop) => {
      const lat = parseFloat(prop.latitude);
      const lng = parseFloat(prop.longitude);
      if (isNaN(lat) || isNaN(lng) || lat === 0 || lng === 0) return;

      bounds.push([lat, lng]);

      const isSelected = selectedProperty?.id === prop.id;
      const priceMillions = (Number(prop.price_lkr) / 1000000).toFixed(1);
      const perchPriceMillions = (Number(prop.price_per_perch) / 1000000).toFixed(2);

      // Determine category details and color code
      const matchedCat =
        prop.category ||
        categories.find(
          (c) => c.code === prop.property_type || c.id === prop.category_id,
        );
      const catColor = matchedCat?.color_code || '#059669';
      const catName =
        matchedCat?.name || prop.property_type?.replace(/_/g, ' ') || 'Property';

      // Create marker HTML using the category color code
      const markerHtml = isSelected
        ? `
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            transform: translate(-50%, -100%);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 10000;
          ">
            <!-- Pulsing Halo Badge in Category Color -->
            <div style="
              background: ${catColor};
              color: #ffffff;
              padding: 7px 15px;
              border-radius: 9999px;
              font-family: inherit;
              font-size: 13px;
              font-weight: 900;
              border: 3px solid #ffffff;
              box-shadow: 0 0 0 5px ${catColor}55, 0 10px 25px rgba(0,0,0,0.45);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 6px;
              letter-spacing: -0.01em;
            ">
              <span style="display:inline-block; width:8px; height:8px; border-radius:50%; background:#fef08a; box-shadow:0 0 8px #fef08a;"></span>
              <span>★ LKR ${priceMillions}M</span>
            </div>
            <!-- Pointer Arrow -->
            <div style="
              width: 0;
              height: 0;
              border-left: 8px solid transparent;
              border-right: 8px solid transparent;
              border-top: 9px solid ${catColor};
              margin-top: -1px;
              filter: drop-shadow(0 2px 2px rgba(0,0,0,0.35));
            "></div>
            <!-- Pin Ground Ring -->
            <div style="
              width: 10px;
              height: 10px;
              border-radius: 50%;
              background: ${catColor};
              border: 2px solid #ffffff;
              margin-top: -5px;
              box-shadow: 0 0 12px ${catColor};
            "></div>
          </div>
        `
        : `
          <div style="
            position: absolute;
            left: 0;
            top: 0;
            transform: translate(-50%, -100%);
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            z-index: 100;
            transition: transform 0.15s ease-in-out;
          ">
            <!-- Colored Category Badge -->
            <div style="
              background: ${catColor};
              color: #ffffff;
              padding: 5px 12px;
              border-radius: 9999px;
              font-family: inherit;
              font-size: 11px;
              font-weight: 800;
              border: 2px solid #ffffff;
              box-shadow: 0 4px 14px rgba(0,0,0,0.35);
              white-space: nowrap;
              display: flex;
              align-items: center;
              gap: 5px;
              letter-spacing: -0.01em;
            ">
              <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#ffffff; opacity:0.85; box-shadow:0 0 4px rgba(255,255,255,0.8);"></span>
              <span>LKR ${priceMillions}M</span>
            </div>
            <!-- Pointer Arrow -->
            <div style="
              width: 0;
              height: 0;
              border-left: 6px solid transparent;
              border-right: 6px solid transparent;
              border-top: 7px solid ${catColor};
              margin-top: -1px;
              filter: drop-shadow(0 2px 2px rgba(0,0,0,0.25));
            "></div>
            <!-- Pin Ground Ring -->
            <div style="
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background: ${catColor};
              border: 1.5px solid #ffffff;
              margin-top: -3px;
              box-shadow: 0 0 8px ${catColor};
            "></div>
          </div>
        `;

      const customIcon = L.divIcon({
        className: 'lp-marker-container',
        html: markerHtml,
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], {
        icon: customIcon,
        zIndexOffset: isSelected ? 10000 : 100,
      });

      // Build Hover Tooltip Card HTML
      const specs: string[] = [];
      if (prop.bedrooms > 0) specs.push(`${prop.bedrooms} Beds`);
      if (prop.bathrooms > 0) specs.push(`${prop.bathrooms} Baths`);
      if (prop.floor_sqft > 0) specs.push(`${prop.floor_sqft} sqft`);
      if (prop.land_perches > 0) specs.push(`${prop.land_perches} Perches`);

      const specsHtml =
        specs.length > 0
          ? `<div style="display:flex; align-items:center; gap:6px; font-size:10px; font-weight:700; color:#475569; padding-top:4px; border-top:1px solid #f1f5f9; margin-top:4px;">
              ${specs.map((s) => `<span>${s}</span>`).join('<span style="color:#cbd5e1;">•</span>')}
            </div>`
          : '';

      const perchText =
        Number(prop.land_perches) > 0
          ? `<div style="font-size:10px; font-weight:700; color:#059669; margin-bottom:3px;">LKR ${perchPriceMillions}M / perch (${prop.land_perches}P)</div>`
          : '';

      const safeTitle = (prop.title || 'Property Listing')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
      const safeAddress = `${prop.city || ''}${prop.city && prop.district ? ', ' : ''}${prop.district || ''}`
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      const imgUrl =
        prop.images?.[0] ||
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400';

      const tooltipHtml = `
        <div style="
          width: 250px;
          background: #ffffff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 16px 36px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08);
          border: 1px solid rgba(226, 232, 240, 0.95);
          font-family: inherit;
          text-align: left;
          pointer-events: none;
        ">
          <!-- Image Header with Category Badge and Price Tag -->
          <div style="position: relative; width: 100%; height: 115px; background: #e2e8f0; overflow: hidden;">
            <img src="${imgUrl}" alt="${safeTitle}" style="width: 100%; height: 100%; object-fit: cover; display: block;" />
            
            <!-- Category Badge with exact Category Color -->
            <div style="
              position: absolute;
              top: 8px;
              left: 8px;
              background: ${catColor};
              color: #ffffff;
              padding: 3px 9px;
              border-radius: 9999px;
              font-size: 10px;
              font-weight: 800;
              letter-spacing: 0.02em;
              box-shadow: 0 2px 8px rgba(0,0,0,0.35);
              border: 1.5px solid rgba(255,255,255,0.7);
              text-transform: uppercase;
              max-width: 160px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
            ">
              ${catName}
            </div>

            <!-- Price Tag -->
            <div style="
              position: absolute;
              bottom: 8px;
              left: 8px;
              background: rgba(11, 25, 44, 0.9);
              backdrop-filter: blur(4px);
              color: #ffffff;
              padding: 3px 8px;
              border-radius: 7px;
              font-size: 12px;
              font-weight: 900;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              border: 1px solid rgba(255,255,255,0.2);
            ">
              LKR ${priceMillions}M
            </div>

            ${
              prop.is_exchange_eligible
                ? `
              <div style="
                position: absolute;
                bottom: 8px;
                right: 8px;
                background: #4f46e5;
                color: #ffffff;
                padding: 2px 6px;
                border-radius: 6px;
                font-size: 9px;
                font-weight: 800;
                text-transform: uppercase;
              ">
                Swap
              </div>
            `
                : ''
            }
          </div>

          <!-- Body Information -->
          <div style="padding: 10px 12px;">
            <div style="
              font-weight: 800;
              font-size: 12px;
              color: #0f172a;
              line-height: 1.35;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-bottom: 2px;
            ">
              ${safeTitle}
            </div>
            ${perchText}
            <div style="
              font-size: 11px;
              font-weight: 600;
              color: #64748b;
              display: flex;
              align-items: center;
              gap: 4px;
              overflow: hidden;
              text-overflow: ellipsis;
              white-space: nowrap;
              margin-bottom: 6px;
            ">
              <span>📍 ${safeAddress}</span>
            </div>
            ${specsHtml}
            <div style="
              margin-top: 6px;
              padding-top: 4px;
              font-size: 10px;
              font-weight: 700;
              color: #059669;
              display: flex;
              align-items: center;
              justify-content: space-between;
            ">
              <span>Click pin to view full details</span>
              <span>→</span>
            </div>
          </div>
        </div>
      `;

      // Bind hover tooltip
      marker.bindTooltip(tooltipHtml, {
        direction: 'top',
        offset: [0, -32],
        opacity: 1,
        className: 'lp-map-hover-card',
      });

      marker.on('click', () => {
        setSelectedProperty(prop);
        mapInstance.flyTo([lat, lng], 14, { duration: 0.8 });
      });

      marker.addTo(layerGroup);
    });

    // Auto fit bounds on first load or filter change
    if (bounds.length > 0 && !initialFitDoneRef.current) {
      if (bounds.length === 1) {
        mapInstance.flyTo(bounds[0], 14, { duration: 0.8 });
      } else {
        mapInstance.fitBounds(bounds, {
          padding: [80, 80],
          maxZoom: 13,
        });
      }
      initialFitDoneRef.current = true;
    }
  }, [mapInstance, layerGroup, properties, categories, selectedProperty]);

  // Handle selecting property from sidebar
  const handleSelectProperty = (prop: any) => {
    setSelectedProperty(prop);
    const lat = parseFloat(prop.latitude);
    const lng = parseFloat(prop.longitude);
    if (mapInstance && !isNaN(lat) && !isNaN(lng)) {
      mapInstance.flyTo([lat, lng], 14, { duration: 0.8 });
    }
  };

  // Reset to view all properties
  const handleFitAll = () => {
    if (!mapInstance || properties.length === 0) return;
    const bounds: [number, number][] = properties
      .map(
        (p) =>
          [parseFloat(p.latitude), parseFloat(p.longitude)] as [number, number],
      )
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng) && lat !== 0);

    if (bounds.length > 0) {
      mapInstance.fitBounds(bounds, { padding: [80, 80], maxZoom: 13 });
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col md:flex-row overflow-hidden relative">
      {/* Left Sidebar List */}
      <div className="w-full md:w-[420px] lg:w-[460px] h-1/2 md:h-full bg-white border-r border-slate-200 flex flex-col shadow-lg z-20">
        {/* Header & Filter Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-extrabold text-brand-dark flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-600" />
              <span>Sri Lanka Map Explorer</span>
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {properties.length} Active Listings
            </span>
          </div>

          {/* Master Data Category Filter */}
          <div>
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span>Property Category</span>
              </span>
              {categoryFilter && (
                <button
                  onClick={() => setCategoryFilter('')}
                  className="text-emerald-600 hover:underline normal-case font-semibold text-[11px]"
                >
                  Clear filter
                </button>
              )}
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {/* Default: All Categories */}
              <button
                onClick={() => setCategoryFilter('')}
                className={`px-3 py-1.5 rounded-xl shrink-0 transition font-bold text-xs flex items-center gap-1.5 ${
                  categoryFilter === ''
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-slate-900/20'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>All Categories</span>
              </button>

              {/* Dynamic Master Categories */}
              {categories.map((cat) => {
                const isActive = categoryFilter === cat.code;
                return (
                  <button
                    key={cat.id || cat.code}
                    onClick={() => setCategoryFilter(isActive ? '' : cat.code)}
                    className={`px-2.5 py-1.5 rounded-xl shrink-0 transition font-bold text-xs flex items-center gap-1.5 ${
                      isActive
                        ? 'text-white shadow-sm ring-2 ring-offset-1'
                        : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                    }`}
                    style={
                      isActive
                        ? {
                            backgroundColor: cat.color_code,
                            borderColor: cat.color_code,
                          }
                        : undefined
                    }
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{
                        backgroundColor: isActive ? '#ffffff' : cat.color_code,
                      }}
                    />
                    <span className="whitespace-nowrap">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick city filter chips */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              <span>City / Suburb</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
              {['', 'Colombo 07', 'Colombo 03', 'Rajagiriya', 'Galle Fort', 'Kandy'].map(
                (city) => (
                  <button
                    key={city}
                    onClick={() => setCityFilter(city)}
                    className={`px-2.5 py-1 rounded-lg shrink-0 transition font-semibold text-[11px] ${
                      cityFilter === city
                        ? 'bg-slate-800 text-white shadow-sm'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {city || 'All Cities'}
                  </button>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Scrollable Listings List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 space-y-1">
          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              <div className="inline-block w-7 h-7 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-semibold text-slate-600">
                Locating verified properties on map...
              </p>
            </div>
          ) : properties.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-sm">
              <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold">No listings found for this filter.</p>
              <div className="flex items-center justify-center gap-2 mt-3">
                {categoryFilter && (
                  <button
                    onClick={() => setCategoryFilter('')}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Clear Category
                  </button>
                )}
                {cityFilter && (
                  <button
                    onClick={() => setCityFilter('')}
                    className="text-xs text-emerald-600 font-bold hover:underline"
                  >
                    Show all locations
                  </button>
                )}
              </div>
            </div>
          ) : (
            properties.map((prop) => {
              const isSelected = selectedProperty?.id === prop.id;
              const priceMillions = (Number(prop.price_lkr) / 1000000).toFixed(1);
              const perchPriceMillions = (Number(prop.price_per_perch) / 1000000).toFixed(2);

              const matchedCat =
                prop.category ||
                categories.find(
                  (c) => c.code === prop.property_type || c.id === prop.category_id,
                );
              const catColor = matchedCat?.color_code || '#059669';
              const catName =
                matchedCat?.name || prop.property_type?.replace(/_/g, ' ') || 'Property';

              return (
                <div
                  key={prop.id}
                  onClick={() => handleSelectProperty(prop)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 flex gap-3 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-2 border-emerald-500 shadow-md scale-[1.01]'
                      : 'hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <div className="w-24 h-22 rounded-xl bg-slate-200 overflow-hidden shrink-0 relative">
                    <img
                      src={
                        prop.images?.[0] ||
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
                      }
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                    {/* Category pill on thumbnail */}
                    <span
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-white text-[9px] font-black uppercase tracking-wider shadow-xs"
                      style={{ backgroundColor: catColor }}
                    >
                      {catName}
                    </span>
                    {prop.is_exchange_eligible && (
                      <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[9px] font-bold">
                        Swap
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-black text-brand-dark">
                          LKR {priceMillions}M
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 shadow-sm">
                            <Sparkles className="w-3 h-3" />
                            Selected
                          </span>
                        )}
                      </div>

                      {Number(prop.land_perches) > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold truncate">
                          LKR {perchPriceMillions}M / perch ({prop.land_perches}P)
                        </div>
                      )}

                      <h4 className="text-xs font-semibold text-slate-800 truncate mt-0.5">
                        {prop.title}
                      </h4>
                    </div>

                    <p className="text-[11px] text-slate-400 flex items-center gap-1 truncate mt-1">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>
                        {prop.city}, {prop.district}
                      </span>
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

        {/* Map Control: Reset/Fit Bounds Button */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={handleFitAll}
            title="Fit All Properties in View"
            className="bg-white/95 backdrop-blur hover:bg-white text-slate-700 hover:text-emerald-700 p-2.5 rounded-xl shadow-lg border border-slate-200 transition-all font-bold text-xs flex items-center gap-2 active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-600" />
            <span className="hidden sm:inline">Fit All Listings</span>
          </button>
        </div>

        {/* Floating Selected Property Preview Card */}
        {selectedProperty &&
          (() => {
            const matchedSelectedCat =
              selectedProperty.category ||
              categories.find(
                (c) =>
                  c.code === selectedProperty.property_type ||
                  c.id === selectedProperty.category_id,
              );
            const selectedCatColor = matchedSelectedCat?.color_code || '#059669';
            const selectedCatName =
              matchedSelectedCat?.name ||
              selectedProperty.property_type?.replace(/_/g, ' ') ||
              'Property';

            return (
              <div className="absolute bottom-6 left-6 right-6 md:right-auto md:w-96 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-emerald-500 z-30 transition-all animate-in fade-in-0 slide-in-from-bottom-4 duration-200">
                <div className="flex gap-3.5">
                  <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                    <img
                      src={
                        selectedProperty.images?.[0] ||
                        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'
                      }
                      alt={selectedProperty.title}
                      className="w-full h-full object-cover"
                    />
                    <span
                      className="absolute top-1 left-1 px-1.5 py-0.5 rounded text-white text-[9px] font-black uppercase tracking-wider shadow-xs"
                      style={{ backgroundColor: selectedCatColor }}
                    >
                      {selectedCatName}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="text-base font-black text-brand-dark tracking-tight">
                          LKR{' '}
                          {(
                            Number(selectedProperty.price_lkr) / 1000000
                          ).toFixed(1)}
                          M
                        </div>
                        <span
                          className="text-[10px] font-extrabold text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs"
                          style={{ backgroundColor: selectedCatColor }}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          Highlighted Pin
                        </span>
                      </div>

                      {Number(selectedProperty.land_perches) > 0 && (
                        <div className="text-[11px] text-emerald-700 font-semibold">
                          LKR{' '}
                          {(
                            Number(selectedProperty.price_per_perch) / 1000000
                          ).toFixed(2)}
                          M / perch ({selectedProperty.land_perches}P)
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
                        {selectedProperty.bedrooms > 0 && (
                          <span>{selectedProperty.bedrooms} Beds</span>
                        )}
                        {selectedProperty.floor_sqft > 0 && (
                          <span>{selectedProperty.floor_sqft} sqft</span>
                        )}
                      </div>

                      <Link
                        href={`/property/${selectedProperty.id}`}
                        className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg transition flex items-center gap-1 shadow-sm active:scale-95"
                      >
                        <span>View Property</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
      </div>
    </div>
  );
}
