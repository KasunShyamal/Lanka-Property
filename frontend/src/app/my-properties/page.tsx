'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  Plus,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Eye,
  Edit3,
  Repeat,
  Bed,
  Bath,
  Maximize2,
  ShieldCheck,
  Lock,
  ArrowRight,
  X,
  Save,
  Tag,
  Home,
  Sparkles,
  Building,
  Trees,
  Landmark,
  Image as ImageIcon,
} from 'lucide-react';
import { api, PropertyCategoryItem } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import CustomSelect, { SelectOption } from '@/components/ui/CustomSelect';

const PURPOSE_OPTIONS: SelectOption[] = [
  { value: 'SALE', label: 'For Sale', icon: <Tag className="w-4 h-4 text-emerald-600" /> },
  { value: 'RENT', label: 'For Rent / Lease', icon: <Tag className="w-4 h-4 text-sky-600" /> },
];

const DISTRICT_OPTIONS: SelectOption[] = [
  { value: 'Colombo', label: 'Colombo', badge: 'Western' },
  { value: 'Gampaha', label: 'Gampaha', badge: 'Western' },
  { value: 'Kalutara', label: 'Kalutara', badge: 'Western' },
  { value: 'Kandy', label: 'Kandy', badge: 'Central' },
  { value: 'Matale', label: 'Matale', badge: 'Central' },
  { value: 'Nuwara Eliya', label: 'Nuwara Eliya', badge: 'Central' },
  { value: 'Galle', label: 'Galle', badge: 'Southern' },
  { value: 'Matara', label: 'Matara', badge: 'Southern' },
  { value: 'Hambantota', label: 'Hambantota', badge: 'Southern' },
  { value: 'Jaffna', label: 'Jaffna', badge: 'Northern' },
  { value: 'Kilinochchi', label: 'Kilinochchi', badge: 'Northern' },
  { value: 'Mannar', label: 'Mannar', badge: 'Northern' },
  { value: 'Vavuniya', label: 'Vavuniya', badge: 'Northern' },
  { value: 'Mullaitivu', label: 'Mullaitivu', badge: 'Northern' },
  { value: 'Batticaloa', label: 'Batticaloa', badge: 'Eastern' },
  { value: 'Ampara', label: 'Ampara', badge: 'Eastern' },
  { value: 'Trincomalee', label: 'Trincomalee', badge: 'Eastern' },
  { value: 'Kurunegala', label: 'Kurunegala', badge: 'North Western' },
  { value: 'Puttalam', label: 'Puttalam', badge: 'North Western' },
  { value: 'Anuradhapura', label: 'Anuradhapura', badge: 'North Central' },
  { value: 'Polonnaruwa', label: 'Polonnaruwa', badge: 'North Central' },
  { value: 'Badulla', label: 'Badulla', badge: 'Uva' },
  { value: 'Monaragala', label: 'Monaragala', badge: 'Uva' },
  { value: 'Ratnapura', label: 'Ratnapura', badge: 'Sabaragamuwa' },
  { value: 'Kegalle', label: 'Kegalle', badge: 'Sabaragamuwa' },
];

export default function MyPropertiesPage() {
  const { user, isLoggedIn, isLoading: authLoading, openAuthModal } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<PropertyCategoryItem[]>([]);
  const [notification, setNotification] = useState<string | null>(null);

  // Edit Modal State
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({
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
    city: '',
    district: 'Colombo',
    description: '',
    is_exchange_eligible: false,
    exchange_preferences: '',
    imagesText: '',
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadMyProperties();
      api.getPropertyCategories()
        .then((cats) => {
          if (cats && cats.length > 0) setCategories(cats);
        })
        .catch((err) => console.warn('Could not load categories:', err));
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const loadMyProperties = async () => {
    setLoading(true);
    try {
      const data = await api.getMyProperties();
      setProperties(data || []);
    } catch (err) {
      console.error('Failed to load my properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleOpenEditModal = (prop: any) => {
    setEditingProperty(prop);
    const sourceData = prop.has_pending_update && prop.pending_update ? prop.pending_update : prop;

    setEditFormData({
      title: sourceData.title || prop.title || '',
      purpose: sourceData.purpose || prop.purpose || 'SALE',
      property_type: sourceData.property_type || prop.property_type || 'HOUSE',
      category_id: sourceData.category_id || prop.category_id || '',
      price_lkr: sourceData.price_lkr ? String(sourceData.price_lkr) : '',
      land_perches: sourceData.land_perches ? String(sourceData.land_perches) : '',
      floor_sqft: sourceData.floor_sqft ? String(sourceData.floor_sqft) : '',
      bedrooms: String(sourceData.bedrooms ?? prop.bedrooms ?? 0),
      bathrooms: String(sourceData.bathrooms ?? prop.bathrooms ?? 0),
      parking_slots: String(sourceData.parking_slots ?? prop.parking_slots ?? 0),
      address: sourceData.address || prop.address || '',
      city: sourceData.city || prop.city || '',
      district: sourceData.district || prop.district || 'Colombo',
      description: sourceData.description || prop.description || '',
      is_exchange_eligible: Boolean(sourceData.is_exchange_eligible ?? prop.is_exchange_eligible),
      exchange_preferences: sourceData.exchange_preferences || prop.exchange_preferences || '',
      imagesText: (sourceData.images || prop.images || []).join('\n'),
    });
    setEditError(null);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;
    setSavingEdit(true);
    setEditError(null);

    try {
      const imagesArray = editFormData.imagesText
        .split('\n')
        .map((url: string) => url.trim())
        .filter((url: string) => url.length > 0);

      const payload = {
        title: editFormData.title.trim(),
        purpose: editFormData.purpose,
        property_type: editFormData.property_type,
        category_id: editFormData.category_id || undefined,
        price_lkr: Number(editFormData.price_lkr),
        land_perches: editFormData.land_perches ? Number(editFormData.land_perches) : null,
        floor_sqft: editFormData.floor_sqft ? Number(editFormData.floor_sqft) : null,
        bedrooms: Number(editFormData.bedrooms) || 0,
        bathrooms: Number(editFormData.bathrooms) || 0,
        parking_slots: Number(editFormData.parking_slots) || 0,
        address: editFormData.address.trim(),
        city: editFormData.city.trim(),
        district: editFormData.district,
        description: editFormData.description.trim(),
        is_exchange_eligible: editFormData.is_exchange_eligible,
        exchange_preferences: editFormData.exchange_preferences?.trim() || null,
        images: imagesArray.length > 0 ? imagesArray : editingProperty.images,
      };

      await api.updateProperty(editingProperty.id, payload);
      showNotification('Property edits submitted successfully! Changes are pending admin moderation review.');
      setEditingProperty(null);
      await loadMyProperties();
    } catch (err: any) {
      setEditError(err.message || 'Failed to submit property changes');
    } finally {
      setSavingEdit(false);
    }
  };

  const categorySelectOptions: SelectOption[] = categories.map((cat) => ({
    value: cat.code,
    label: cat.name,
    badge: cat.code,
    icon: (
      <span
        className="w-2.5 h-2.5 rounded-full inline-block shrink-0 shadow-xs"
        style={{ backgroundColor: cat.color_code }}
      />
    ),
  }));

  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-600">Verifying session...</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-brand-dark">Sign In Required</h2>
          <p className="text-sm text-slate-500">
            You must be signed in to view, manage, and edit your posted property listings.
          </p>
          <button
            onClick={() => openAuthModal('login', '/my-properties')}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition shadow-md shadow-emerald-600/20 active:scale-95 text-sm"
          >
            Sign In to My Account
          </button>
        </div>
      </div>
    );
  }

  const approvedCount = properties.filter((p) => p.status === 'APPROVED' && !p.has_pending_update).length;
  const pendingCount = properties.filter((p) => p.status === 'PENDING' || p.has_pending_update).length;
  const rejectedCount = properties.filter((p) => p.status === 'REJECTED').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Success Notification Banner */}
      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-sm animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-brand-dark to-slate-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-2 border border-emerald-500/30">
            <Building2 className="w-3.5 h-3.5" />
            <span>Owner Real Estate Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            My Property Listings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Track your advertisements, manage live listings, and submit edits. Edits are routed through admin moderation with comparison auditing before being published.
          </p>
        </div>

        <Link
          href="/post-property"
          className="relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-3 rounded-xl shadow-lg shadow-emerald-600/30 transition flex items-center gap-2 active:scale-95 whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Property</span>
        </Link>
      </div>

      {/* Stats Counter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-bold text-slate-400">Total Posted</span>
          <div className="text-2xl font-black text-slate-900 mt-1">{properties.length}</div>
          <span className="text-[11px] text-slate-400">All submissions</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-bold text-emerald-600">Active &amp; Live</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</div>
          <span className="text-[11px] text-emerald-600/80">Visible to buyers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-bold text-amber-500">Awaiting Review</span>
          <div className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</div>
          <span className="text-[11px] text-amber-600/80">New or edited</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs uppercase font-bold text-rose-500">Rejected</span>
          <div className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</div>
          <span className="text-[11px] text-rose-600/80">Action required</span>
        </div>
      </div>

      {/* Property Cards List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-black text-brand-dark">
            Your Advertisements ({properties.length})
          </h2>
          <span className="text-xs text-slate-500">
            Real-time status synced with administrative moderation
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400 text-sm">
            <div className="inline-block w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
            <p>Loading your properties...</p>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Building2 className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No properties posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Ready to advertise your Sri Lankan property? Post your first listing to start receiving buyer inquiries and inspection bookings.
            </p>
            <Link
              href="/post-property"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Your First Listing</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property) => {
              const categoryColor = property.category?.color_code || '#059669';
              const categoryName = property.category?.name || property.property_type?.replace(/_/g, ' ') || 'House';

              return (
                <div
                  key={property.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {/* Top Image & Category Badge */}
                  <div>
                    <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                      <img
                        src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600'}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />

                      {/* Status Overlay Badge */}
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        {property.status === 'APPROVED' && (
                          <span className="px-2.5 py-1 rounded-md bg-emerald-600/95 backdrop-blur-md text-white text-[10px] font-black shadow-sm flex items-center gap-1 uppercase tracking-wider">
                            <CheckCircle2 className="w-3 h-3" />
                            Live Ad
                          </span>
                        )}
                        {property.status === 'PENDING' && (
                          <span className="px-2.5 py-1 rounded-md bg-amber-500/95 backdrop-blur-md text-white text-[10px] font-black shadow-sm flex items-center gap-1 uppercase tracking-wider">
                            <Clock className="w-3 h-3" />
                            Pending Review
                          </span>
                        )}
                        {property.status === 'REJECTED' && (
                          <span className="px-2.5 py-1 rounded-md bg-rose-600/95 backdrop-blur-md text-white text-[10px] font-black shadow-sm flex items-center gap-1 uppercase tracking-wider">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </div>

                      {/* Category Badge */}
                      <div
                        className="absolute bottom-3 right-3 text-white text-[11px] px-2.5 py-1 rounded-lg font-bold shadow-md flex items-center gap-1.5 border border-white/20"
                        style={{ backgroundColor: `${categoryColor}E6` }}
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        <span>{categoryName}</span>
                      </div>
                    </div>

                    {/* Pending Update Notice Ribbon */}
                    {property.has_pending_update && (
                      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2 text-[11px] text-amber-800 font-bold">
                        <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>Changes submitted &bull; Awaiting admin approval</span>
                      </div>
                    )}

                    {/* Content Details */}
                    <div className="p-5 space-y-3">
                      {/* Price in LKR */}
                      <div className="flex items-baseline justify-between">
                        <div className="text-xl font-black text-brand-dark tracking-tight">
                          LKR {(Number(property.price_lkr) / 1000000).toFixed(1)}M
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                          {property.purpose === 'RENT' ? 'For Rent' : 'For Sale'}
                        </span>
                      </div>

                      {/* Per-Perch breakdown */}
                      {Number(property.land_perches) > 0 && (
                        <div className="text-xs text-emerald-700 font-semibold">
                          LKR {(Number(property.price_per_perch) / 1000000).toFixed(2)}M / perch &bull; {property.land_perches} perches
                        </div>
                      )}

                      {/* Title */}
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition">
                        {property.title}
                      </h3>

                      {/* Address */}
                      <p className="text-xs text-slate-500 flex items-center gap-1 line-clamp-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{property.address}, {property.city}, {property.district}</span>
                      </p>

                      {/* Key Attributes */}
                      <div className="grid grid-cols-3 gap-1 py-2.5 border-y border-slate-100 text-xs text-slate-600">
                        <div className="flex items-center gap-1">
                          <Bed className="w-3.5 h-3.5 text-slate-400" />
                          <span>{property.bedrooms || 0} Beds</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-3.5 h-3.5 text-slate-400" />
                          <span>{property.bathrooms || 0} Baths</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{property.floor_sqft || 0} sqft</span>
                        </div>
                      </div>

                      {/* Rejection Note (if any) */}
                      {property.status === 'REJECTED' && property.moderation_notes && (
                        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                          <span className="font-bold block mb-0.5">Moderator feedback:</span>
                          <p>{property.moderation_notes}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditModal(property)}
                      className="flex-1 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Edit Ad</span>
                    </button>

                    <Link
                      href={`/property/${property.id}`}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Ad</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EDIT PROPERTY MODAL */}
      {editingProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-100 my-8 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-brand-dark text-white flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold mb-1 border border-emerald-500/30">
                  <Edit3 className="w-3 h-3" />
                  <span>Update Property Listing</span>
                </div>
                <h3 className="text-xl font-bold">Edit Advertisement Details</h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Edits are submitted to admin moderation with comparison auditing before publishing.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingProperty(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Notice */}
            <div className="p-4 bg-emerald-50/70 border-b border-emerald-100 flex items-start gap-2.5 text-xs text-emerald-900 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p>
                <strong>Moderation Guarantee:</strong> If this property is currently live, it will stay active and discoverable on the marketplace with its existing details while the administrator reviews your newly submitted edits.
              </p>
            </div>

            {/* Edit Form */}
            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {editError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{editError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Title *
                </label>
                <input
                  type="text"
                  required
                  value={editFormData.title}
                  onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                  placeholder="e.g. Modern 4-Bedroom Architect Villa with Pool"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Category & Purpose Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Property Category / Type *
                  </label>
                  <CustomSelect
                    value={editFormData.property_type}
                    onChange={(val) => {
                      const matched = categories.find((c) => c.code === val);
                      setEditFormData({
                        ...editFormData,
                        property_type: val,
                        category_id: matched?.id || editFormData.category_id,
                      });
                    }}
                    options={categorySelectOptions}
                    placeholder="Select Category"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Listing Purpose *
                  </label>
                  <CustomSelect
                    value={editFormData.purpose}
                    onChange={(val) => setEditFormData({ ...editFormData, purpose: val })}
                    options={PURPOSE_OPTIONS}
                    placeholder="Select Purpose"
                  />
                </div>
              </div>

              {/* Price & Land Area Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Total Price (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={editFormData.price_lkr}
                    onChange={(e) => setEditFormData({ ...editFormData, price_lkr: e.target.value })}
                    placeholder="e.g. 45000000"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  {editFormData.price_lkr && (
                    <span className="text-[10px] text-emerald-700 font-bold block mt-1">
                      ≈ LKR {(Number(editFormData.price_lkr) / 1000000).toFixed(2)} Million
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Land Area (Perches)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={editFormData.land_perches}
                    onChange={(e) => setEditFormData({ ...editFormData, land_perches: e.target.value })}
                    placeholder="e.g. 15.5"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Floor Area (Sqft)
                  </label>
                  <input
                    type="number"
                    value={editFormData.floor_sqft}
                    onChange={(e) => setEditFormData({ ...editFormData, floor_sqft: e.target.value })}
                    placeholder="e.g. 3200"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Beds / Baths / Parking Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.bedrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bedrooms: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.bathrooms}
                    onChange={(e) => setEditFormData({ ...editFormData, bathrooms: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Parking Slots
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={editFormData.parking_slots}
                    onChange={(e) => setEditFormData({ ...editFormData, parking_slots: e.target.value })}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Location: District, City, Address */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    District *
                  </label>
                  <CustomSelect
                    value={editFormData.district}
                    onChange={(val) => setEditFormData({ ...editFormData, district: val })}
                    options={DISTRICT_OPTIONS}
                    placeholder="Select District"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    City / Neighborhood *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFormData.city}
                    onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                    placeholder="e.g. Colombo 07"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={editFormData.address}
                    onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    placeholder="e.g. 42 Ward Place"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Property Description *
                </label>
                <textarea
                  rows={4}
                  required
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                  placeholder="Detailed description of features, views, proximity to schools, road access..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Images (One URL per line) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Photo URLs (One per line)
                </label>
                <textarea
                  rows={3}
                  value={editFormData.imagesText}
                  onChange={(e) => setEditFormData({ ...editFormData, imagesText: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Property Swap / Exchange Eligibility */}
              <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editFormData.is_exchange_eligible}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, is_exchange_eligible: e.target.checked })
                    }
                    className="w-4 h-4 text-indigo-600 rounded"
                  />
                  <span className="text-xs font-bold text-indigo-900">
                    Open for Property Exchange / Swap
                  </span>
                </label>

                {editFormData.is_exchange_eligible && (
                  <input
                    type="text"
                    value={editFormData.exchange_preferences}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, exchange_preferences: e.target.value })
                    }
                    placeholder="e.g. Willing to swap for Colombo apartment + cash balance"
                    className="w-full px-3 py-2 border border-indigo-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  />
                )}
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingProperty(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-md active:scale-95"
                >
                  {savingEdit ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Submitting for Review...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Submit Edits to Admin</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
