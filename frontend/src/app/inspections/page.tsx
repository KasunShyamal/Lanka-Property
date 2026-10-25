'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  User,
  ArrowRight,
  ExternalLink,
  Lock,
  PlusCircle,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function InspectionsPage() {
  const { user, isLoggedIn, isLoading: authLoading, openAuthModal } = useAuth();
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (isLoggedIn) {
      loadInspections();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isLoggedIn, authLoading]);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await api.getInspections();
      setInspections(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await api.updateInspectionStatus(id, {
        status,
        seller_feedback: `Visit ${status.toLowerCase()} by owner.`,
      });
      setNotification(`Inspection marked as ${status}`);
      loadInspections();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update inspection');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 text-sky-600 mx-auto flex items-center justify-center mb-4 border border-sky-100 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Sign In Required</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Please sign in to view and manage your scheduled in-person property inspections and viewing appointments.
        </p>
        <button
          onClick={() => openAuthModal('login', 'Please sign in to view your property inspections.')}
          className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <Calendar className="w-4 h-4" />
          <span>Sign In to View Inspections</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-950 via-slate-900 to-brand-dark rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-bold mb-2 border border-sky-500/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>Sri Lanka In-Person Inspection Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Scheduled Property Visits &amp; Inspections
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Manage buyer viewing appointments with verified identity verification, automated Google/Apple Calendar (.ics) invites, and GPS location guidance.
          </p>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{notification}</span>
        </div>
      )}

      {/* Inspections List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="inline-block w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading scheduled visits...</p>
        </div>
      ) : inspections.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Visits Scheduled Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Prospective buyers can click &quot;Schedule In-Person Inspection&quot; on any property details page.
          </p>
          <Link href="/" className="text-xs font-bold text-sky-600 hover:text-sky-800 underline">
            Browse Properties to Schedule a Visit &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {inspections.map((insp) => (
            <div
              key={insp.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition"
            >
              {/* Property Details */}
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0 relative">
                  <img
                    src={insp.property?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                    alt={insp.property?.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase ${
                        insp.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : insp.status === 'DECLINED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {insp.status}
                    </span>
                    <span className="text-xs text-slate-400">
                      Booking #{insp.id.slice(0, 8)}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-base text-brand-dark">
                    {insp.property?.title}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{insp.property?.address}, {insp.property?.city}</span>
                  </p>

                  <div className="flex items-center gap-3 text-xs text-slate-700 pt-1">
                    <div className="flex items-center gap-1 font-semibold text-sky-700">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(insp.scheduled_at).toLocaleString()} (Sri Lanka Time)</span>
                    </div>
                  </div>

                  {insp.buyer_notes && (
                    <p className="text-xs text-slate-500 italic mt-1">
                      &quot;{insp.buyer_notes}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 shrink-0">
                {insp.status === 'PENDING' && (
                  <>
                    <button
                      onClick={() => handleStatusUpdate(insp.id, 'CONFIRMED')}
                      className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Visit</span>
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(insp.id, 'DECLINED')}
                      className="w-full sm:w-auto px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Decline</span>
                    </button>
                  </>
                )}

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${insp.property?.latitude},${insp.property?.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Google Maps GPS</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
