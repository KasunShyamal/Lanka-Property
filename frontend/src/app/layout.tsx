import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Home, MapPin, Gavel, Calendar, Repeat, PlusCircle, ShieldCheck, User } from 'lucide-react';

export const metadata: Metadata = {
  title: 'LankaProperty — Sri Lanka Premier Real Estate & Digital Auctions',
  description:
    'Discover verified properties, live digital real estate auctions, in-person inspection bookings, and property exchanges across Colombo, Kandy, Galle, and Sri Lanka.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
        {/* Top Notification Banner */}
        <div className="bg-brand-dark text-slate-300 text-xs py-1.5 px-4 text-center border-b border-slate-800 flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Live Digital Auctions Active: Cinnamon Gardens 4BR Villa bidding is now open!</span>
          <Link href="/auctions" className="underline font-semibold text-emerald-400 hover:text-emerald-300 ml-1">
            Enter Auction Room &rarr;
          </Link>
        </div>

        {/* Main Navbar */}
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-dark via-brand-navy to-brand-primary flex items-center justify-center text-white shadow-md">
                <Home className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-brand-dark">
                  Lanka<span className="text-emerald-600">Property</span>
                </span>
                <span className="block text-[10px] uppercase tracking-widest text-slate-400 font-semibold -mt-1">
                  Sri Lanka Real Estate
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-1 lg:gap-2">
              <Link
                href="/"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition"
              >
                Buy & Rent
              </Link>
              <Link
                href="/map"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <MapPin className="w-4 h-4 text-emerald-600" />
                Map View
              </Link>
              <Link
                href="/auctions"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <Gavel className="w-4 h-4 text-amber-500" />
                Auctions
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  LIVE
                </span>
              </Link>
              <Link
                href="/inspections"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <Calendar className="w-4 h-4 text-sky-600" />
                Inspections
              </Link>
              <Link
                href="/exchanges"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <Repeat className="w-4 h-4 text-indigo-600" />
                Exchanges
              </Link>
              <Link
                href="/admin"
                className="px-3 py-1.5 text-sm font-medium text-slate-700 hover:text-emerald-600 hover:bg-slate-100 rounded-lg transition flex items-center gap-1.5"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Admin
              </Link>
            </nav>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/post-property"
                className="hidden sm:inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-xl shadow-sm transition active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                Post Property
              </Link>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <footer className="bg-brand-dark text-slate-400 text-sm mt-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                    <Home className="w-4 h-4" />
                  </div>
                  <span className="text-lg font-bold text-white tracking-tight">
                    Lanka<span className="text-emerald-400">Property</span>
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sri Lanka&apos;s verified real estate marketplace featuring digital timed auctions, spatial PostGIS map search, in-person inspection scheduling, and deed-compliant property exchanges.
                </p>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Popular Locations</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><Link href="/?city=Colombo+07" className="hover:text-emerald-400">Colombo 07 (Cinnamon Gardens)</Link></li>
                  <li><Link href="/?city=Colombo+03" className="hover:text-emerald-400">Colombo 03 (Kollupitiya)</Link></li>
                  <li><Link href="/?city=Rajagiriya" className="hover:text-emerald-400">Rajagiriya & Nawala</Link></li>
                  <li><Link href="/?city=Kandy" className="hover:text-emerald-400">Kandy & Central Province</Link></li>
                  <li><Link href="/?city=Galle+Fort" className="hover:text-emerald-400">Galle Fort & Southern Coast</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Platforms & Tools</h4>
                <ul className="space-y-1.5 text-xs">
                  <li><Link href="/map" className="hover:text-emerald-400">Per-Perch Price Map Explorer</Link></li>
                  <li><Link href="/auctions" className="hover:text-emerald-400">Live Digital Timed Auctions</Link></li>
                  <li><Link href="/exchanges" className="hover:text-emerald-400">Property Swap & Barter Engine</Link></li>
                  <li><Link href="/inspections" className="hover:text-emerald-400">In-Person Inspection Booking</Link></li>
                  <li><Link href="http://localhost:4000/api/docs" target="_blank" className="hover:text-emerald-400">OpenAPI Swagger Docs</Link></li>
                </ul>
              </div>

              <div>
                <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">Trust & Legal</h4>
                <p className="text-xs text-slate-400 leading-relaxed mb-2">
                  All listings are subject to verification under Sri Lankan real estate statutes. Bids placed in digital auctions constitute legally binding intent subject to deed execution with licensed Notaries Public.
                </p>
                <div className="text-[11px] text-emerald-400 font-medium">
                  ISO 27001 & Sri Lanka IPG Compliant
                </div>
              </div>
            </div>

            <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
              <p>&copy; {new Date().getFullYear()} LankaProperty (Pvt) Ltd. All Rights Reserved.</p>
              <p className="mt-2 sm:mt-0">Colombo, Sri Lanka &bull; Engineered with Next.js 15, NestJS & Docker</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
