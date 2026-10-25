'use client';

import { useState, useEffect } from 'react';
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
  Home,
  Sparkles,
  Building,
  Trees,
  Landmark,
  Tag,
  Lock,
} from 'lucide-react';
import { api, PropertyCategoryItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';
import dynamic from 'next/dynamic';

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="h-64 rounded-2xl bg-slate-100 flex items-center justify-center text-xs text-slate-400 font-semibold border-2 border-slate-200">
      Loading interactive GPS coordinate map picker...
    </div>
  ),
});

const PURPOSE_OPTIONS: SelectOption[] = [
  { value: 'SALE', label: 'For Sale', icon: <Tag className="w-4 h-4 text-emerald-600" /> },
  { value: 'RENT', label: 'For Rent / Lease', icon: <Tag className="w-4 h-4 text-sky-600" /> },
];

const PROPERTY_TYPE_OPTIONS: SelectOption[] = [
  {
    value: 'HOUSE',
    label: 'Residential House',
    icon: <Home className="w-4 h-4 text-emerald-600" />,
    description: 'Detached or semi-detached family homes',
  },
  {
    value: 'LUXURY_VILLA',
    label: 'Luxury Villa',
    icon: <Sparkles className="w-4 h-4 text-amber-500" />,
    description: 'High-end villas with pool & grounds',
  },
  {
    value: 'APARTMENT',
    label: 'Apartment / Condominium',
    icon: <Building className="w-4 h-4 text-sky-600" />,
    description: 'High-rise residential and penthouses',
  },
  {
    value: 'RESIDENTIAL_LAND',
    label: 'Residential Land',
    icon: <MapPin className="w-4 h-4 text-purple-600" />,
    description: 'Plots & highland parcels ready for building',
  },
  {
    value: 'COMMERCIAL',
    label: 'Commercial Building',
    icon: <Landmark className="w-4 h-4 text-indigo-600" />,
    description: 'Office complexes, retail & showrooms',
  },
  {
    value: 'AGRICULTURAL',
    label: 'Agricultural Estate',
    icon: <Trees className="w-4 h-4 text-green-700" />,
    description: 'Tea, rubber, coconut & plantation estates',
  },
];

const DISTRICT_OPTIONS: SelectOption[] = [
  { value: 'Colombo', label: 'Colombo', badge: 'Western' },
  { value: 'Gampaha', label: 'Gampaha', badge: 'Western' },
  { value: 'Kalutara', label: 'Kalutara', badge: 'Western' },
  { value: 'Kandy', label: 'Kandy', badge: 'Central' },
  { value: 'Galle', label: 'Galle', badge: 'Southern' },
  { value: 'Matara', label: 'Matara', badge: 'Southern' },
  { value: 'Kurunegala', label: 'Kurunegala', badge: 'North Western' },
];

export default function PostPropertyPage() {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading, openAuthModal } = useAuth();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<PropertyCategoryItem[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    purpose: 'SALE',
    property_type: 'HOUSE',
    category_id: '',
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

  useEffect(() => {
    api.getPropertyCategories()
      .then((cats) => {
        if (cats && cats.length > 0) {
          setCategories(cats);
          setFormData((prev) => ({
            ...prev,
            property_type: prev.property_type || cats[0].code,
            category_id: prev.category_id || cats[0].id,
          }));
        }
      })
      .catch((err) => console.warn('Could not load categories in post-property:', err));
  }, []);

  const categoryOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.code,
    label: cat.name,
    badge: cat.code,
    description: cat.description || undefined,
    icon: (
      <span
        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
        style={{ backgroundColor: cat.color_code }}
      />
    ),
  }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      openAuthModal('login', 'Please log in to publish your property listing.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await api.createProperty({
        title: formData.title,
        purpose: formData.purpose,
        property_type: formData.property_type,
        category_id: formData.category_id || undefined,
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

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-4 border border-emerald-100 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required to Post Property</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          To maintain verified quality and protect buyers, all property sellers and agents must sign in before publishing listings on LankaProperty.
        </p>
        <button
          onClick={() => openAuthModal('login', 'Please sign in to publish your property listing.')}
          className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Sign In to Post Property</span>
        </button>
      </div>
    );
  }

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
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 relative z-30">
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
                  <CustomSelect
                    label="Listing Purpose"
                    value={formData.purpose}
                    onChange={(val) => setFormData({ ...formData, purpose: val })}
                    options={PURPOSE_OPTIONS}
                  />
                </div>
              </div>

              {/* Type & Price */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 relative z-20">
                <div className="sm:col-span-6">
                  <CustomSelect
                    label="Property Category"
                    value={formData.property_type}
                    onChange={(val) => {
                      const matched = categories.find((c) => c.code === val);
                      setFormData({
                        ...formData,
                        property_type: val,
                        category_id: matched?.id || '',
                      });
                    }}
                    options={categories.length > 0 ? categoryOptions : PROPERTY_TYPE_OPTIONS}
                  />
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 relative z-10">
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
                  <CustomSelect
                    label="District"
                    value={formData.district}
                    onChange={(val) => setFormData({ ...formData, district: val })}
                    options={DISTRICT_OPTIONS}
                  />
                </div>
              </div>

              {/* Interactive Location & GPS Coordinate Map Picker */}
              <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200 relative z-0 isolate">
                <LocationPickerMap
                  latitude={formData.latitude}
                  longitude={formData.longitude}
                  onChange={({ lat, lng }) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                />
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
