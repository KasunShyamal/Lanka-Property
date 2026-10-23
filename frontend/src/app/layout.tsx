import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import Script from 'next/script';
import { Home } from 'lucide-react';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import AuthModal from '@/components/auth/AuthModal';

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
        <Script src="https://accounts.google.com/gsi/client" strategy="afterInteractive" />
        <AuthProvider>
          {/* Dynamic Interactive Navbar */}
          <Navbar />

          {/* Global Auth Modal for Sign in, Register, Google OAuth */}
          <AuthModal />

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
        </AuthProvider>
      </body>
    </html>
  );
}
