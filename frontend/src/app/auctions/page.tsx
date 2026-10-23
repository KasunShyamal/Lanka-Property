'use client';

import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  Gavel,
  Clock,
  ShieldCheck,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
  User,
  Sparkles,
} from 'lucide-react';
import { api } from '@/lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:4000';

export default function AuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [activeAuction, setActiveAuction] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [isBidding, setIsBidding] = useState(false);
  const [bidMessage, setBidMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Fetch initial auctions list
  useEffect(() => {
    loadAuctions();
  }, []);

  const loadAuctions = async () => {
    setLoading(true);
    try {
      const data = await api.getAuctions();
      setAuctions(data || []);
      if (data && data.length > 0) {
        // Load single detailed auction with bid history
        const detailed = await api.getAuction(data[0].id);
        setActiveAuction(detailed);
        setBidAmount(Number(detailed.current_highest_bid) + Number(detailed.bid_increment));
      }
    } catch (err) {
      console.error('Failed to load auctions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Real-time WebSocket connection
  useEffect(() => {
    if (!activeAuction) return;

    const socket: Socket = io(WS_URL, {
      transports: ['websocket', 'polling'],
    });

    socket.emit('join_auction', activeAuction.id);

    socket.on('new_bid', (data: any) => {
      setActiveAuction((prev: any) => {
        if (!prev) return prev;
        const updatedBids = [
          {
            id: data.bid_id,
            amount: data.amount,
            bidder: { full_name: data.bidder_name },
            created_at: data.created_at,
            status: 'WINNING',
          },
          ...(prev.bids || []),
        ];

        return {
          ...prev,
          current_highest_bid: data.amount,
          highest_bidder: { full_name: data.bidder_name },
          ends_at: data.ends_at,
          total_bids_count: Number(prev.total_bids_count || 0) + 1,
          is_reserve_met: data.reserve_met,
          bids: updatedBids,
        };
      });

      // Update recommended next bid
      setBidAmount(Number(data.amount) + Number(activeAuction.bid_increment || 2000000));

      if (data.soft_close_extended) {
        setBidMessage({
          type: 'success',
          text: '⚡ Soft-Close Anti-Sniping Triggered! Auction extended by 2 minutes.',
        });
      }
    });

    return () => {
      socket.emit('leave_auction', activeAuction.id);
      socket.disconnect();
    };
  }, [activeAuction?.id]);

  // Live Timer Countdown
  useEffect(() => {
    if (!activeAuction?.ends_at) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(activeAuction.ends_at).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeAuction?.ends_at]);

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeAuction) return;

    setIsBidding(true);
    setBidMessage(null);

    try {
      // Demo authentication simulation if not logged in
      if (!localStorage.getItem('lp_token')) {
        // Auto-authenticate as verified test bidder
        const loginRes = await api.login({
          email: 'rohan.de.silva@outlook.com',
          password: 'Admin@12345',
        });
        localStorage.setItem('lp_token', loginRes.token);
      }

      await api.placeBid(activeAuction.id, bidAmount);
      setBidMessage({
        type: 'success',
        text: `Your bid of LKR ${bidAmount.toLocaleString()} has been submitted successfully!`,
      });
    } catch (err: any) {
      setBidMessage({
        type: 'error',
        text: err.message || 'Failed to place bid. Ensure bid exceeds minimum increment.',
      });
    } finally {
      setIsBidding(false);
    }
  };

  const handleSwitchAuction = async (auctionId: string) => {
    setLoading(true);
    try {
      const detailed = await api.getAuction(auctionId);
      setActiveAuction(detailed);
      setBidAmount(Number(detailed.current_highest_bid) + Number(detailed.bid_increment));
      setBidMessage(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !activeAuction) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-700">Connecting to Real-Time Auction Gateway...</p>
        </div>
      </div>
    );
  }

  const minBidAllowed = Number(activeAuction.current_highest_bid) + Number(activeAuction.bid_increment);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Status Bar */}
      <div className="bg-gradient-to-r from-brand-dark via-slate-900 to-brand-navy rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-white" />
              LIVE DIGITAL AUCTION
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-400 text-xs font-semibold backdrop-blur-md">
              NIC / Passport KYC Verified
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            {activeAuction.property?.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {activeAuction.property?.address}, {activeAuction.property?.city} &bull; Property Reference #{activeAuction.id.slice(0, 8)}
          </p>
        </div>

        {/* Live Countdown */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10 shrink-0">
          <Clock className="w-6 h-6 text-amber-400" />
          <div className="text-center">
            <div className="text-xs uppercase tracking-widest text-slate-400 font-bold">Time Remaining</div>
            <div className="text-2xl font-black font-mono tracking-wider text-amber-400">
              {String(timeLeft.hours).padStart(2, '0')}:
              {String(timeLeft.minutes).padStart(2, '0')}:
              {String(timeLeft.seconds).padStart(2, '0')}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Bidding Console, Right Property Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Bidding Controls & Feed (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Price & Reserve Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 block mb-1">
                  Current Highest Bid
                </span>
                <div className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
                  LKR {Number(activeAuction.current_highest_bid).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Leading Bidder:{' '}
                  <span className="font-bold text-slate-800">
                    {activeAuction.highest_bidder?.full_name || 'Starting Price'}
                  </span>
                </div>
              </div>

              {/* Reserve Status Badge */}
              <div className="flex flex-col items-start sm:items-end">
                <span className="text-xs uppercase tracking-wider font-bold text-slate-400 mb-1">
                  Reserve Status
                </span>
                {activeAuction.is_reserve_met ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Reserve Price Met (Will Sell)
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    Reserve Pending
                  </span>
                )}
                <span className="text-[10px] text-slate-400 mt-1">Confidential reserve protected</span>
              </div>
            </div>

            {/* Soft-close Notice */}
            <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Anti-Sniping Soft Close Active:</span> Bids placed in the final 2 minutes will automatically extend the auction clock by 120 seconds.
              </div>
            </div>

            {/* Bidding Form */}
            <form onSubmit={handlePlaceBid} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Your Bid Amount (LKR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-sm font-bold text-slate-400">LKR</span>
                  <input
                    type="number"
                    step="100000"
                    min={minBidAllowed}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(Number(e.target.value))}
                    className="w-full pl-14 pr-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl text-lg font-black focus:outline-none focus:border-emerald-500 focus:bg-white transition"
                    required
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex justify-between">
                  <span>Minimum acceptable bid: <strong>LKR {minBidAllowed.toLocaleString()}</strong></span>
                  <span>Increment: +LKR {Number(activeAuction.bid_increment).toLocaleString()}</span>
                </div>
              </div>

              {/* Quick increment buttons */}
              <div className="flex flex-wrap gap-2">
                {[1000000, 2000000, 5000000, 10000000].map((inc) => (
                  <button
                    key={inc}
                    type="button"
                    onClick={() =>
                      setBidAmount((prev) => Math.max(minBidAllowed, Number(activeAuction.current_highest_bid) + inc))
                    }
                    className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-700 transition"
                  >
                    +{(inc / 1000000).toFixed(0)}M LKR
                  </button>
                ))}
              </div>

              {/* Notifications */}
              {bidMessage && (
                <div
                  className={`p-3 rounded-xl text-xs font-semibold ${
                    bidMessage.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-red-50 text-red-800 border border-red-200'
                  }`}
                >
                  {bidMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isBidding}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black py-4 px-6 rounded-xl shadow-lg transition active:scale-98 flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                <Gavel className="w-5 h-5" />
                <span>{isBidding ? 'Validating Bid On Redis...' : 'Place Verified Bid Now'}</span>
              </button>
            </form>
          </div>

          {/* Live Bid History Stream */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-sm text-brand-dark flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Live Bid Stream ({activeAuction.bids?.length || 0} Bids)</span>
              </h3>
              <span className="text-[11px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Connected to WebSocket
              </span>
            </div>

            <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto pr-1">
              {(!activeAuction.bids || activeAuction.bids.length === 0) ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No bids recorded yet. Be the first to bid!
                </div>
              ) : (
                activeAuction.bids.map((bid: any, index: number) => (
                  <div key={bid.id || index} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-[11px]">
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">
                          {bid.bidder?.full_name || 'Verified Bidder'}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(bid.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-brand-dark">
                        LKR {Number(bid.amount).toLocaleString()}
                      </div>
                      {index === 0 ? (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">Current Winner</span>
                      ) : (
                        <span className="text-[10px] text-slate-400 uppercase">Outbid</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Property Preview & Available Auctions (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Property Card */}
          <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-md">
            <div className="relative aspect-[16/10] bg-slate-100">
              <img
                src={activeAuction.property?.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800'}
                alt={activeAuction.property?.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-brand-dark/90 backdrop-blur-md text-white text-xs font-bold">
                {activeAuction.property?.property_type?.replace('_', ' ')}
              </div>
            </div>

            <div className="p-5 space-y-3">
              <h3 className="font-bold text-base text-brand-dark">
                {activeAuction.property?.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                {activeAuction.property?.description}
              </p>

              <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Land Area</span>
                  <span className="font-bold text-slate-800">{activeAuction.property?.land_perches} Perches</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase">Starting Bid</span>
                  <span className="font-bold text-slate-800">
                    LKR {Number(activeAuction.starting_bid).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href={`/property/${activeAuction.property?.id}`}
                  className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-2.5 rounded-xl transition"
                >
                  <span>Full Property Details & Deeds</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Switch to other auctions */}
          {auctions.length > 1 && (
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-md">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-400 mb-3">
                Other Live / Upcoming Auctions
              </h4>
              <div className="space-y-2">
                {auctions.map((auc) => (
                  <button
                    key={auc.id}
                    onClick={() => handleSwitchAuction(auc.id)}
                    className={`w-full text-left p-3 rounded-xl border transition flex items-center justify-between text-xs ${
                      activeAuction.id === auc.id
                        ? 'border-emerald-500 bg-emerald-50/50 font-bold'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="text-slate-900 font-semibold truncate">{auc.property?.title}</div>
                      <div className="text-[11px] text-slate-500">{auc.property?.city}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-brand-dark">
                        LKR {(Number(auc.current_highest_bid) / 1000000).toFixed(1)}M
                      </div>
                      <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {auc.status}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
