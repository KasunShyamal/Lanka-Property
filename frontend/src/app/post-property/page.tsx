'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  PlusCircle,
  MapPin,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Repeat,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function PostPropertyPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    purpose: 'SALE',
    property_type: 'HOUSE',
    price_lkr: '',
    land_perches: '',
    floor_sqft: '',
    bedrooms: '3',
    bathrooms: '2',
    parking_slots: '1',
    address: '',
    city: 'Colombo 07',
    district: 'Colombo',
    latitude: 6.9065,
    longitude: 79.8708,
    description: '',
    is_exchange_eligible: false,
    exchange_preferences: '',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!localStorage.getItem('lp_token')) {
        const loginRes = await api.login({
          email: 'malik.fernando@gmail.com',
          password: 'Admin@12345',
        });
        localStorage.setItem('lp_token', loginRes.token);
      }

      await api.createProperty({
        title: formData.title,
        purpose: formData.purpose,
        property_type: formData.property_type,
        price_lkr: Number(formData.price_lkr),
        land_perches: formData.land_perches ? Number(formData.land_perches) : null,
        floor_sqft: formData.floor_sqft ? Number(formData.floor_sqft) : null,
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        parking_slots: Number(formData.parking_slots),
        address: formData.address,
        city: formData.city,
        district: formData.district,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        description: formData.description,
        is_exchange_eligible: formData.is_exchange_eligible,
        exchange_preferences: formData.exchange_preferences,
        images: [formData.imageUrl],
        features: ['3-Phase Electricity', 'Pipe Water', 'Clear Title Deeds'],
      });

      setSuccess(true);
      setTimeout(() => {
        router.push('/');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit property listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-brand-dark to-brand-navy p-6 sm:p-8 text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold mb-3 border border-emerald-500/30">
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Sri Lanka Property Listing Submission</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            List Your Property for Sale, Rent or Barter
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Reach serious local buyers, institutional investors, and overseas diaspora. Fill in accurate GPS coordinates and perch measurements for spatial indexing.
          </p>
        </div>

        {/* Content / Form */}
        <div className="p-6 sm:p-8">
          {success ? (
            <div className="text-center py-12 space-y-3">
              <CheckCircle2 className="w-16 h-16 text-emerald-600 mx-auto animate-bounce" />
              <h2 className="text-2xl font-black text-brand-dark">Listing Submitted Successfully!</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Your listing has been submitted and queued for moderation review by the LankaProperty Compliance Team. Redirecting to home...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-800 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Title & Purpose */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 3BR Architect-Designed House in Rajagiriya"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Listing Purpose
                  </label>
                  <select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="SALE">For Sale</option>
                    <option value="RENT">For Rent / Lease</option>
                  </select>
                </div>
              </div>

              {/* Type & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Property Category
                  </label>
                  <select
                    value={formData.property_type}
                    onChange={(e) => setFormData({ ...formData, property_type: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="HOUSE">Residential House</option>
                    <option value="LUXURY_VILLA">Luxury Villa</option>
                    <option value="APARTMENT">Apartment / Condominium</option>
                    <option value="RESIDENTIAL_LAND">Residential Land</option>
                    <option value="COMMERCIAL">Commercial Building</option>
                    <option value="AGRICULTURAL">Agricultural Estate</option>
                  </select>
                </div>

                <div className="sm:col-span-6">
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Price in Sri Lankan Rupees (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 65000000"
                    value={formData.price_lkr}
                    onChange={(e) => setFormData({ ...formData, price_lkr: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold"
                  />
                </div>
              </div>

              {/* Sri Lanka Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Land Size in Perches
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 12.5"
                    value={formData.land_perches}
                    onChange={(e) => setFormData({ ...formData, land_perches: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Floor Area (Sq Ft)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 3200"
                    value={formData.floor_sqft}
                    onChange={(e) => setFormData({ ...formData, floor_sqft: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Bedrooms / Bathrooms
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Beds"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-1/2 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    />
                    <input
                      type="number"
                      placeholder="Baths"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-1/2 px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Location details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 45/2 Lake Drive"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    City / Suburb *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rajagiriya"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    District
                  </label>
                  <select
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Colombo">Colombo</option>
                    <option value="Gampaha">Gampaha</option>
                    <option value="Kalutara">Kalutara</option>
                    <option value="Kandy">Kandy</option>
                    <option value="Galle">Galle</option>
                    <option value="Matara">Matara</option>
                    <option value="Kurunegala">Kurunegala</option>
                  </select>
                </div>
              </div>

              {/* Photos URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Photo Image URL
                </label>
                <div className="relative">
                  <ImageIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Description &amp; Title Verification Notes *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Detail the neighborhood access (road width), boundary walls, water supply, clear deed history, and structural highlights..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Property Exchange Opt-In */}
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="exchangeOpt"
                    checked={formData.is_exchange_eligible}
                    onChange={(e) => setFormData({ ...formData, is_exchange_eligible: e.target.checked })}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                  />
                  <label htmlFor="exchangeOpt" className="text-xs font-bold text-indigo-950 flex items-center gap-1.5 cursor-pointer">
                    <Repeat className="w-4 h-4 text-indigo-600" />
                    Accept Property Exchange / Asset Swap Offers
                  </label>
                </div>

                {formData.is_exchange_eligible && (
                  <div>
                    <label className="block text-[11px] font-bold text-indigo-900 mb-1">
                      Your Exchange Preference / Criteria
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Willing to consider partial exchange for 2-bedroom apartment in Colombo or Galle coastal land."
                      value={formData.exchange_preferences}
                      onChange={(e) => setFormData({ ...formData, exchange_preferences: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-indigo-300 rounded-lg text-xs"
                    />
                  </div>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 px-6 rounded-xl shadow-lg transition active:scale-98 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <PlusCircle className="w-5 h-5" />
                <span>{loading ? 'Submitting to Moderation Engine...' : 'Publish Property Listing'}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
