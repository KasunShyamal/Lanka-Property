'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Repeat,
  ShieldCheck,
  Phone,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  X,
  Compass,
  ExternalLink,
} from 'lucide-react';
import { api } from '@/lib/api';
import CustomSelect from '@/components/ui/CustomSelect';

const PropertyMiniMap = dynamic(() => import('@/components/PropertyMiniMap'), {
  ssr: false,
  loading: () => (
    <div className="h-72 w-full rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-semibold border border-slate-200">
      Loading property spatial map...
    </div>
  ),
});

export default function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [property, setProperty] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  // Inspection Modal
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionDate, setInspectionDate] = useState('');
  const [inspectionNotes, setInspectionNotes] = useState('');
  const [inspectionSuccess, setInspectionSuccess] = useState(false);

  // Exchange Modal
  const [showExchangeModal, setShowExchangeModal] = useState(false);
  const [userProperties, setUserProperties] = useState<any[]>([]);
  const [selectedOfferProp, setSelectedOfferProp] = useState('');
  const [cashAdjustment, setCashAdjustment] = useState('');
  const [exchangeNotes, setExchangeNotes] = useState('');
  const [exchangeSuccess, setExchangeSuccess] = useState(false);

  useEffect(() => {
    loadProperty();
  }, [resolvedParams.id]);

  const loadProperty = async () => {
    setLoading(true);
    try {
      const data = await api.getProperty(resolvedParams.id);
      setProperty(data);

      // Also load available properties for swap
      const allProps = await api.getProperties();
      setUserProperties(allProps.items?.filter((p: any) => p.id !== data.id) || []);
      if (allProps.items && allProps.items.length > 0) {
        setSelectedOfferProp(allProps.items[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspectionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      if (!localStorage.getItem('lp_token')) {
        const loginRes = await api.login({
          email: 'rohan.de.silva@outlook.com',
          password: 'Admin@12345',
        });
        localStorage.setItem('lp_token', loginRes.token);
      }

      await api.createInspection({
        property_id: property.id,
        scheduled_at: new Date(inspectionDate).toISOString(),
        buyer_notes: inspectionNotes,
      });

      setInspectionSuccess(true);
      setTimeout(() => {
        setShowInspectionModal(false);
        setInspectionSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to submit inspection request');
    }
  };

  const handleExchangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!property) return;

    try {
      if (!localStorage.getItem('lp_token')) {
        const loginRes = await api.login({
          email: 'chamari.senanayake@yahoo.com',
          password: 'Admin@12345',
        });
        localStorage.setItem('lp_token', loginRes.token);
      }

      await api.createExchange({
        offered_property_id: selectedOfferProp,
        target_property_id: property.id,
        cash_adjustment_lkr: Number(cashAdjustment || 0),
        proposal_notes: exchangeNotes,
      });

      setExchangeSuccess(true);
      setTimeout(() => {
        setShowExchangeModal(false);
        setExchangeSuccess(false);
      }, 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to propose property exchange');
    }
  };

  if (loading || !property) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Loading Property Details & Deeds...</p>
        </div>
      </div>
    );
  }

  const images = property.images && property.images.length > 0 ? property.images : [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Search &amp; Discovery</span>
      </Link>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {property.category && (
              <span
                className="px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 shadow-2xs"
                style={{
                  backgroundColor: `${property.category.color_code || '#10B981'}15`,
                  color: property.category.color_code || '#10B981',
                  borderColor: `${property.category.color_code || '#10B981'}40`,
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: property.category.color_code || '#10B981' }}
                />
                <span>{property.category.name}</span>
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Verified Title Deed
            </span>
            {property.is_exchange_eligible && (
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold flex items-center gap-1">
                <Repeat className="w-3.5 h-3.5 text-indigo-600" />
                Exchange Eligible
              </span>
            )}
            <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase">
              {property.purpose}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-brand-dark tracking-tight">
            {property.title}
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{property.address}, {property.city}, {property.district} Province</span>
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="text-left md:text-right shrink-0">
          <div className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            LKR {Number(property.price_lkr).toLocaleString()}
          </div>
          {Number(property.land_perches) > 0 && (
            <div className="text-sm text-emerald-700 font-bold">
              LKR {(Number(property.price_per_perch) / 1000000).toFixed(2)}M / Perch &bull; {property.land_perches} Perches
            </div>
          )}
          {Number(property.floor_sqft) > 0 && (
            <div className="text-xs text-slate-400">
              LKR {Number(property.price_per_sqft).toLocaleString()} / sqft
            </div>
          )}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="space-y-3">
        <div className="relative aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden bg-slate-900 shadow-xl border border-slate-200">
          <img
            src={images[activeImage]}
            alt={property.title}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Gallery Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {images.map((img: string, idx: number) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImage(idx)}
                className={`relative w-28 h-20 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                  activeImage === idx ? 'border-emerald-500 scale-105' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Grid: Details Left, Sidebar Actions Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Key Metrics */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Land Size</span>
              <span className="text-lg font-black text-brand-dark">{property.land_perches || '—'} Perches</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Floor Area</span>
              <span className="text-lg font-black text-brand-dark">{property.floor_sqft || '—'} sqft</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Bedrooms</span>
              <span className="text-lg font-black text-brand-dark">{property.bedrooms || '—'} Beds</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] text-slate-400 uppercase font-bold block mb-1">Bathrooms</span>
              <span className="text-lg font-black text-brand-dark">{property.bathrooms || '—'} Baths</span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-lg font-extrabold text-brand-dark">Property Overview</h2>
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>

            {property.is_exchange_eligible && property.exchange_preferences && (
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-1">
                <span className="text-xs font-bold text-indigo-900 uppercase flex items-center gap-1.5">
                  <Repeat className="w-4 h-4 text-indigo-600" />
                  Owner&apos;s Property Exchange Criteria:
                </span>
                <p className="text-xs text-indigo-800 leading-relaxed">
                  {property.exchange_preferences}
                </p>
              </div>
            )}
          </div>

          {/* Features & Amenities */}
          {property.features && property.features.length > 0 && (
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-lg font-extrabold text-brand-dark">Features &amp; Amenities</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.features.map((feat: string, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-semibold">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Property GPS Location & Geospatial Mini Map Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: property.category?.color_code || '#10B981' }}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <h2 className="text-lg font-extrabold text-brand-dark">Property Location &amp; Spatial View</h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {property.address ? `${property.address}, ` : ''}{property.city}, {property.district} &bull; GPS: {Number(property.latitude).toFixed(4)}° N, {Number(property.longitude).toFixed(4)}° E
                </p>
              </div>

              {/* Action Buttons: Full Map Link */}
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/map?city=${encodeURIComponent(property.city || '')}`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Load Full Map</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>

            {/* Embedded Mini Leaflet Map */}
            <div className="h-72 sm:h-80 w-full rounded-2xl overflow-hidden border border-slate-200 relative z-0">
              <PropertyMiniMap
                latitude={Number(property.latitude)}
                longitude={Number(property.longitude)}
                title={property.title}
                price_lkr={property.price_lkr}
                categoryColor={property.category?.color_code}
                categoryName={property.category?.name}
                address={property.address}
                city={property.city}
                district={property.district}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Interaction Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Owner / Agent Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden shrink-0">
                <img
                  src={property.owner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
                  alt={property.owner?.full_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-brand-dark">
                  {property.owner?.full_name || 'Verified Owner'}
                </h3>
                <p className="text-xs text-slate-400">
                  {property.owner?.agency_name || 'Direct Property Owner'}
                </p>
                <div className="text-[11px] text-emerald-600 font-bold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Identity &amp; Title</span>
                </div>
              </div>
            </div>

            {/* Direct Contact Button */}
            <a
              href={`https://wa.me/94771234567?text=Hi%2C+I+am+interested+in+${encodeURIComponent(property.title)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition active:scale-98 text-sm"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp Direct Enquiry</span>
            </a>

            {/* In-Person Inspection Button */}
            <button
              type="button"
              onClick={() => setShowInspectionModal(true)}
              className="w-full inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 px-4 rounded-xl shadow-md transition active:scale-98 text-sm"
            >
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span>Schedule In-Person Inspection</span>
            </button>

            {/* Propose Exchange Button */}
            {property.is_exchange_eligible && (
              <button
                type="button"
                onClick={() => setShowExchangeModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition active:scale-98 text-sm"
              >
                <Repeat className="w-4 h-4" />
                <span>Propose Property Swap / Exchange</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Inspection Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowInspectionModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-brand-dark">
                  Schedule On-Site Inspection
                </h3>
                <p className="text-xs text-slate-400">
                  Select a visit date and time in Sri Lanka Standard Time (UTC+5:30)
                </p>
              </div>
            </div>

            {inspectionSuccess ? (
              <div className="p-6 text-center text-emerald-800 bg-emerald-50 rounded-xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                <h4 className="font-bold text-sm">Inspection Request Submitted!</h4>
                <p className="text-xs text-slate-600">
                  The property owner has received your request. You will be notified upon confirmation.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInspectionSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Date &amp; Time (Sri Lanka Time)
                  </label>
                  <input
                    type="datetime-local"
                    value={inspectionDate}
                    onChange={(e) => setInspectionDate(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Notes for Seller / Broker
                  </label>
                  <textarea
                    rows={3}
                    placeholder="E.g., I would like to review the boundary survey plan and visit with our architect."
                    value={inspectionNotes}
                    onChange={(e) => setInspectionNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Both parties receive calendar invites (.ics) and sanitized contact exchange upon seller approval.
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
                >
                  Send Inspection Request
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Property Exchange Modal */}
      {showExchangeModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-slate-200">
            <button
              onClick={() => setShowExchangeModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-brand-dark">
                  Propose Property Swap / Exchange
                </h3>
                <p className="text-xs text-slate-400">
                  Offer an asset you own + cash balance in exchange for {property.title}
                </p>
              </div>
            </div>

            {exchangeSuccess ? (
              <div className="p-6 text-center text-indigo-800 bg-indigo-50 rounded-xl space-y-2">
                <CheckCircle2 className="w-10 h-10 text-indigo-600 mx-auto" />
                <h4 className="font-bold text-sm">Exchange Proposal Sent!</h4>
                <p className="text-xs text-slate-600">
                  The property owner has received your swap proposal. Review negotiations under the Exchanges portal.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExchangeSubmit} className="space-y-4">
                <div>
                  <CustomSelect
                    label="Select Your Property to Offer"
                    value={selectedOfferProp}
                    onChange={(val) => setSelectedOfferProp(val)}
                    options={userProperties.map((p) => ({
                      value: p.id,
                      label: `${p.title} (LKR ${(Number(p.price_lkr) / 1000000).toFixed(1)}M)`,
                      description: `${p.city} • ${p.land_perches || 0} Perches`,
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Cash Adjustment Balance (LKR, optional)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 25000000"
                    value={cashAdjustment}
                    onChange={(e) => setCashAdjustment(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-[10px] text-slate-400">
                    Additional cash to balance valuation differences.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Proposal Terms &amp; Message
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide details on your property condition, deed status, and why this swap is mutually advantageous."
                    value={exchangeNotes}
                    onChange={(e) => setExchangeNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-500">
                  Agreement in principle subject to legal title searches and execution of a Deed of Exchange via licensed Notaries Public.
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition shadow-md text-sm"
                >
                  Submit Swap Proposal
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
