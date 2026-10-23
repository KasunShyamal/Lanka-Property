'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  Gavel,
  Users,
  AlertCircle,
  Building,
  ArrowRight,
  Lock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, openAuthModal } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [pendingProperties, setPendingProperties] = useState<any[]>([]);
  const [pendingAuctions, setPendingAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  useEffect(() => {
    if (isAdmin) {
      loadAdminData();
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, propsRes, auctionsRes] = await Promise.all([
        api.getAdminStats(),
        api.getPendingProperties(),
        api.getPendingAuctions(),
      ]);

      setStats(statsRes);
      setPendingProperties(propsRes || []);
      setPendingAuctions(auctionsRes || []);
    } catch (err) {
      console.error('Failed to load admin data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (id: string) => {
    try {
      await api.approveProperty(id);
      setActionNotice('Property listing approved and published publicly.');
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Approval failed');
    }
  };

  const handleRejectProperty = async (id: string) => {
    try {
      await api.rejectProperty(id);
      setActionNotice('Property listing rejected.');
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Rejection failed');
    }
  };

  const handleApproveAuction = async (id: string) => {
    try {
      await api.approveAuction(id);
      setActionNotice('Auction approved and live scheduled.');
      loadAdminData();
      setTimeout(() => setActionNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Auction approval failed');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white rounded-3xl border border-slate-200 shadow-xl text-center">
        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-4 border border-purple-100 shadow-inner">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Admin Authentication Required</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Access to the LankaProperty Moderation Console is restricted to authorized platform administrators and governance moderators.
        </p>
        <button
          onClick={() => openAuthModal('login', 'Please authenticate with an Administrator account.')}
          className="w-full py-3 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm shadow-md transition active:scale-95 flex items-center justify-center gap-2"
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Authenticate as Admin</span>
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-brand-dark rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Operations &amp; Compliance CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            LankaProperty Admin Moderation Console
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Review submitted property listings, sanction digital auctions, verify broker licenses, and maintain platform compliance.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-400">Total Listings</span>
            <Building className="w-4 h-4 text-brand-dark" />
          </div>
          <div className="text-2xl font-black text-brand-dark">{stats?.totalProperties ?? '—'}</div>
          <span className="text-[11px] text-slate-400">Published in database</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-amber-500">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">{stats?.pendingProperties ?? '—'}</div>
          <span className="text-[11px] text-amber-600/80 font-semibold">Action required</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-emerald-600">Live Auctions</span>
            <Gavel className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{stats?.liveAuctions ?? '—'}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">Active bidding</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-indigo-600">Verified Agents</span>
            <ShieldCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700">{stats?.verifiedAgents ?? '—'}</div>
          <span className="text-[11px] text-slate-400">Licensed brokers</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-bold text-slate-500">Platform Users</span>
            <Users className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-black text-slate-800">{stats?.totalUsers ?? '—'}</div>
          <span className="text-[11px] text-slate-400">Buyers &amp; Sellers</span>
        </div>
      </div>

      {/* Moderation Queue Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg font-extrabold text-brand-dark">
              Property Moderation Queue ({pendingProperties.length} Awaiting Vetting)
            </h2>
            <p className="text-xs text-slate-500">
              Check title deed references, coordinates accuracy, and pricing before publishing.
            </p>
          </div>
        </div>

        {pendingProperties.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p>Moderation queue is empty. All listings are processed!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingProperties.map((prop) => (
              <div
                key={prop.id}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex gap-3">
                  <div className="w-16 h-16 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                    <img
                      src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{prop.title}</h4>
                    <p className="text-xs text-slate-500">{prop.address}, {prop.city}</p>
                    <div className="text-xs font-black text-brand-dark mt-1">
                      LKR {Number(prop.price_lkr).toLocaleString()}{' '}
                      <span className="font-normal text-slate-400">({prop.land_perches} Perches)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleApproveProperty(prop.id)}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve &amp; Publish</span>
                  </button>
                  <button
                    onClick={() => handleRejectProperty(prop.id)}
                    className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Auctions Queue */}
      {pendingAuctions.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-4">
          <h2 className="text-lg font-extrabold text-brand-dark">
            Pending Digital Auction Approvals ({pendingAuctions.length})
          </h2>

          <div className="space-y-3">
            {pendingAuctions.map((auc) => (
              <div
                key={auc.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{auc.property?.title}</h4>
                  <p className="text-xs text-slate-600">
                    Starting Bid: LKR {Number(auc.starting_bid).toLocaleString()} &bull; Bid Increment: LKR {Number(auc.bid_increment).toLocaleString()}
                  </p>
                </div>

                <button
                  onClick={() => handleApproveAuction(auc.id)}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-sm self-start md:self-auto"
                >
                  <Gavel className="w-4 h-4" />
                  <span>Sanction Auction</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
