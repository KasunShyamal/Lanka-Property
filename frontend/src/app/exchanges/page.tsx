'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Repeat,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { api } from '@/lib/api';

export default function ExchangesPage() {
  const [exchanges, setExchanges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    loadExchanges();
  }, []);

  const loadExchanges = async () => {
    setLoading(true);
    try {
      if (!localStorage.getItem('lp_token')) {
        const loginRes = await api.login({
          email: 'malik.fernando@gmail.com',
          password: 'Admin@12345',
        });
        localStorage.setItem('lp_token', loginRes.token);
      }

      const data = await api.getExchanges();
      setExchanges(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      await api.updateExchangeStatus(id, {
        status,
        response_notes: `Status updated to ${status} via owner action.`,
      });
      setActionMessage(`Exchange proposal ${status.replace(/_/g, ' ')} successfully.`);
      loadExchanges();
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to update exchange status');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-brand-dark rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold mb-2 border border-indigo-500/30">
            <Repeat className="w-3.5 h-3.5" />
            <span>Sri Lanka Asset Barter &amp; Swap Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Property Exchange Negotiation Portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Facilitating direct property trades with cash balance settlements. Avoid market liquidity bottlenecks by swapping parcels and residential assets.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-3 rounded-xl shadow-lg transition active:scale-95 text-xs shrink-0"
        >
          <span>Find Exchange-Eligible Properties</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {actionMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Legal Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Sri Lanka Legal Notice &amp; Deed of Exchange:</span> Acceptance of an exchange on this portal constitutes an &quot;Agreement in Principle&quot;. Title transfers are legally finalized upon execution of a formal Deed of Exchange through a licensed Sri Lankan Notary Public, alongside survey plan verifications and stamp duty clearance.
        </div>
      </div>

      {/* Exchanges List */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-sm">
          <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
          <p>Loading active exchange negotiations...</p>
        </div>
      ) : exchanges.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
          <Repeat className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No Exchange Proposals Yet</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
            Visit any property with the &quot;Exchange Eligible&quot; badge to propose a direct swap offering one of your approved properties.
          </p>
          <Link
            href="/"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 underline"
          >
            Browse Exchange-Eligible Properties &rarr;
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {exchanges.map((ex) => (
            <div
              key={ex.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 overflow-hidden space-y-6"
            >
              {/* Proposal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Proposal ID #{ex.id.slice(0, 8)}
                  </span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="text-xs text-slate-500">
                    {new Date(ex.created_at).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase ${
                      ex.status === 'ACCEPTED_IN_PRINCIPLE'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ex.status === 'DECLINED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {ex.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>

              {/* Side-by-Side Comparison */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                {/* Offered Property */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded">
                    Property Offered in Swap
                  </span>
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={ex.offered_property?.images?.[0] || 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400'}
                        alt={ex.offered_property?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {ex.offered_property?.title}
                      </h4>
                      <p className="text-xs text-slate-500">{ex.offered_property?.city}</p>
                      <div className="text-sm font-black text-brand-dark mt-1">
                        LKR {(Number(ex.offered_property?.price_lkr) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ex.offered_property?.land_perches} Perches
                      </div>
                    </div>
                  </div>
                </div>

                {/* Target Property */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Target Requested Property
                  </span>
                  <div className="flex gap-3">
                    <div className="w-20 h-20 rounded-lg bg-slate-200 overflow-hidden shrink-0">
                      <img
                        src={ex.target_property?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400'}
                        alt={ex.target_property?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 line-clamp-1">
                        {ex.target_property?.title}
                      </h4>
                      <p className="text-xs text-slate-500">{ex.target_property?.city}</p>
                      <div className="text-sm font-black text-brand-dark mt-1">
                        LKR {(Number(ex.target_property?.price_lkr) / 1000000).toFixed(1)}M
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ex.target_property?.land_perches} Perches
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cash Adjustment Breakdown */}
              <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-bold text-indigo-950 block">Cash Differential Adjustment</span>
                  <p className="text-slate-600 mt-0.5">
                    {ex.proposal_notes || 'Standard valuation differential proposed by seller.'}
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <span className="text-base font-black text-indigo-900">
                    + LKR {Number(ex.cash_adjustment_lkr).toLocaleString()}
                  </span>
                  <span className="block text-[10px] text-slate-500 uppercase">Cash from Proposer</span>
                </div>
              </div>

              {/* Action Buttons */}
              {ex.status === 'PROPOSED' || ex.status === 'UNDER_REVIEW' ? (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    onClick={() => handleUpdateStatus(ex.id, 'DECLINED')}
                    className="px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Decline Offer</span>
                  </button>

                  <button
                    onClick={() => handleUpdateStatus(ex.id, 'ACCEPTED_IN_PRINCIPLE')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept in Principle (Proceed to Legal)</span>
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
