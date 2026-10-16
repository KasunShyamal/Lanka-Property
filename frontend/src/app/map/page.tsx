'use client';

import dynamic from 'next/dynamic';

const MapExplorer = dynamic(() => import('@/components/MapExplorer'), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-64px)] flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-semibold text-slate-700">Loading Sri Lanka Geospatial Map...</p>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return <MapExplorer />;
}
