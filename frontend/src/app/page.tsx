'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  MapPin,
  Gavel,
  Repeat,
  Bed,
  Bath,
  Maximize2,
  ArrowRight,
  ShieldCheck,
  Flame,
  Sparkles,
  TrendingUp,
  Home,
  Building,
  Trees,
  Landmark,
  Layers,
} from 'lucide-react';
import { api, PropertyCategoryItem } from '@/lib/api';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

const SEARCH_PROPERTY_TYPES: SelectOption[] = [
  { value: '', label: 'All Property Types', icon: <Layers className="w-4 h-4 text-slate-400" /> },
  { value: 'LUXURY_VILLA', label: 'Luxury Villa', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
  { value: 'HOUSE', label: 'Residential House', icon: <Home className="w-4 h-4 text-emerald-600" /> },
  { value: 'APARTMENT', label: 'Apartment / Condominium', icon: <Building className="w-4 h-4 text-sky-600" /> },
  { value: 'RESIDENTIAL_LAND', label: 'Residential Land', icon: <MapPin className="w-4 h-4 text-purple-600" /> },
  { value: 'COMMERCIAL', label: 'Commercial Building', icon: <Landmark className="w-4 h-4 text-indigo-600" /> },
  { value: 'AGRICULTURAL', label: 'Agricultural Estate', icon: <Trees className="w-4 h-4 text-green-700" /> },
];

export default function HomePage() {
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [purpose, setPurpose] = useState<'SALE' | 'RENT'>('SALE');
  const [search, setSearch] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [categories, setCategories] = useState<PropertyCategoryItem[]>([]);

  useEffect(() => {
    api.getPropertyCategories()
      .then((cats) => {
        if (cats && cats.length > 0) setCategories(cats);
      })
      .catch((err) => console.warn('Could not load categories:', err));
  }, []);

  const categoryOptions: SelectOption[] = [
    { value: '', label: 'All Property Types', icon: <Layers className="w-4 h-4 text-slate-400" /> },
    ...categories.map((c) => ({
      value: c.code,
      label: c.name,
      badge: c.code,
      icon: (
        <span
          className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
          style={{ backgroundColor: c.color_code }}
        />
      ),
    })),
  ];

  useEffect(() => {
    loadData();
  }, [purpose, selectedCity, propertyType]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [propsRes, auctionsRes] = await Promise.all([
        api.getProperties({
          purpose,
          city: selectedCity,
          property_type: propertyType || undefined,
          search: search || undefined,
        }),
        api.getAuctions(),
      ]);
      setProperties(propsRes.items || []);
      setAuctions(auctionsRes || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const liveAuction = auctions.find((a) => a.status === 'LIVE') || auctions[0];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-dark via-slate-900 to-brand-navy text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center space-y-4 max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-md border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Sri Lanka&apos;s Verified Digital Real Estate Ecosystem</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              Discover, Bid &amp; Exchange <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
                Prime Sri Lankan Real Estate
              </span>
            </h1>
            <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Explore verified properties with per-perch pricing, participate in live digital auctions, book in-person inspections, or negotiate direct property swaps.
            </p>
          </div>

          {/* Search Box Card */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl text-slate-800 border border-slate-100 max-w-4xl mx-auto relative z-30">
            {/* Purpose Tabs */}
            <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
              <button
                type="button"
                onClick={() => setPurpose('SALE')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                  purpose === 'SALE'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Buy Properties
              </button>
              <button
                type="button"
                onClick={() => setPurpose('RENT')}
                className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${
                  purpose === 'RENT'
                    ? 'bg-brand-dark text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Rent / Lease
              </button>
              <Link
                href="/exchanges"
                className="ml-auto flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition"
              >
                <Repeat className="w-3.5 h-3.5" />
                Property Exchange Mode
              </Link>
            </div>

            {/* Inputs Form */}
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-12 gap-3 relative z-30">
              <div className="sm:col-span-5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Location, neighborhood, or keyword (e.g. Cinnamon Gardens, Nawala)..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                />
              </div>

              <div className="sm:col-span-4">
                <CustomSelect
                  value={propertyType}
                  onChange={(val) => setPropertyType(val)}
                  options={categories.length > 0 ? categoryOptions : SEARCH_PROPERTY_TYPES}
                  placeholder="All Property Types"
                />
              </div>

              <div className="sm:col-span-3 flex gap-2">
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-1.5 active:scale-95 text-sm"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </form>

            {/* Quick Location Pills */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Popular:</span>
              {[
                { name: 'All Locations', value: '' },
                { name: 'Colombo 07', value: 'Colombo 07' },
                { name: 'Colombo 03', value: 'Colombo 03' },
                { name: 'Rajagiriya', value: 'Rajagiriya' },
                { name: 'Galle Fort', value: 'Galle Fort' },
                { name: 'Kandy', value: 'Kandy' },
              ].map((loc) => (
                <button
                  key={loc.name}
                  type="button"
                  onClick={() => setSelectedCity(loc.value)}
                  className={`px-2.5 py-1 rounded-md transition ${
                    selectedCity === loc.value
                      ? 'bg-emerald-100 text-emerald-800 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Auction Spotlight Banner (If active) */}
      {liveAuction && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
          <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-brand-dark rounded-2xl p-6 shadow-xl border border-amber-500/30 text-white flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                <Gavel className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-full bg-red-500/80 text-[10px] font-black uppercase tracking-wider text-white flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    LIVE AUCTION
                  </span>
                  <span className="text-xs text-amber-300 font-medium">Soft-Close Protected</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  {liveAuction.property?.title || 'Prime Colombo 07 Villa Auction'}
                </h3>
                <p className="text-xs text-slate-300">
                  Current Highest Bid:{' '}
                  <span className="text-emerald-400 font-extrabold text-sm">
                    LKR {Number(liveAuction.current_highest_bid).toLocaleString()}
                  </span>{' '}
                  &bull; Total Bids: {liveAuction.total_bids_count}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
              <Link
                href="/auctions"
                className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold px-6 py-3 rounded-xl shadow-lg transition active:scale-95 text-sm"
              >
                <span>Enter Live Auction Room</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Properties Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Verified Market Opportunities</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight">
              Featured Sri Lanka Properties
            </h2>
            <p className="text-sm text-slate-500">
              Per-perch breakdown, verified ownership, and direct seller contact.
            </p>
          </div>

          <Link
            href="/map"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 px-4 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <MapPin className="w-4 h-4 text-emerald-600" />
            <span>Explore on Map</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading verified Sri Lankan properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <p className="text-slate-600 font-semibold mb-2">No properties matched your criteria.</p>
            <p className="text-xs text-slate-400 mb-4">Try clearing filters or checking other districts.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCity('');
                setPropertyType('');
              }}
              className="text-xs font-bold text-emerald-600 underline"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => (
              <div
                key={property.id}
                onClick={() => router.push(`/property/${property.id}`)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group cursor-pointer"
              >
                {/* Image Container */}
                <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                  <img
                    src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {property.is_exchange_eligible && (
                      <span className="px-2.5 py-1 rounded-md bg-indigo-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <Repeat className="w-3 h-3" />
                        Exchange Eligible
                      </span>
                    )}
                    {property.is_urgent && (
                      <span className="px-2.5 py-1 rounded-md bg-red-600/90 backdrop-blur-md text-white text-[11px] font-bold shadow-sm flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Urgent
                      </span>
                    )}
                  </div>

                  <div
                    className="absolute bottom-3 right-3 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg font-bold shadow-md flex items-center gap-1.5 border border-white/20"
                    style={{
                      backgroundColor: `${property.category?.color_code || '#0f172a'}E6`,
                    }}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>{property.category?.name || property.property_type?.replace('_', ' ')}</span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Price in LKR */}
                    <div className="flex items-baseline justify-between mb-1.5">
                      <div className="text-2xl font-black text-brand-dark tracking-tight">
                        LKR {(Number(property.price_lkr) / 1000000).toFixed(1)}M
                      </div>
                      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        {property.purpose === 'RENT' ? '/ Month' : 'Total Price'}
                      </span>
                    </div>

                    {/* Per-Perch breakdown */}
                    {Number(property.land_perches) > 0 && (
                      <div className="text-xs text-emerald-700 font-semibold mb-3">
                        LKR {(Number(property.price_per_perch) / 1000000).toFixed(2)}M / perch &bull; {property.land_perches} perches
                      </div>
                    )}

                    {/* Title */}
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-emerald-600 transition line-clamp-1 mb-1">
                      {property.title}
                    </h3>

                    {/* Location */}
                    <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{property.address}, {property.city}</span>
                    </p>

                    {/* Key Attributes */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-slate-100 text-xs text-slate-600 mb-4">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bed className="w-4 h-4 text-slate-400" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Bath className="w-4 h-4 text-slate-400" />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                      )}
                      {property.floor_sqft > 0 && (
                        <div className="flex items-center gap-1.5">
                          <Maximize2 className="w-4 h-4 text-slate-400" />
                          <span>{property.floor_sqft} sqft</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions footer */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 overflow-hidden">
                        <img
                          src={property.owner?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={property.owner?.full_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="text-xs text-slate-600 font-medium truncate max-w-[120px]">
                        {property.owner?.full_name || 'Verified Owner'}
                      </span>
                    </div>

                    <Link
                      href={`/property/${property.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition flex items-center gap-1"
                    >
                      <span>View Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Why LankaProperty Advantage */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8 border-y border-slate-200">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-dark tracking-tight mb-2">
              Engineered Beyond Classifieds
            </h2>
            <p className="text-sm text-slate-500">
              How LankaProperty modernizes real estate transactions for Sri Lankan buyers, sellers, and diaspora.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Spatial PostGIS Discovery</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore parcels across Sri Lanka with per-perch calculated price overlays and high-resolution boundary markers.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <Gavel className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Timed Digital Auctions</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Real-time bidding with microsecond Redis concurrency, confidential reserve safeguards, and 2-minute soft-close anti-sniping.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-4">
                <Repeat className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Property Barter / Swap</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Exchange properties directly with cash differential balances, addressing liquidity challenges in high-value land holdings.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200/80">
              <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-slate-900 mb-2">Verified Deed Title Badging</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Admin moderation checklists ensuring clear title deeds, licensed agent verification, and anti-fraud safeguards.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
