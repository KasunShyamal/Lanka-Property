'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Home,
  MapPin,
  Gavel,
  Calendar,
  Repeat,
  Plus,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  ChevronDown,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  Building,
  Search,
  ArrowUpRight,
  Flame,
  Globe2,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, isLoggedIn, isAdmin, openAuthModal, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  const navLinks = [
    {
      href: '/',
      label: 'Buy & Rent',
      icon: Search,
      iconColor: 'text-emerald-600',
    },
    {
      href: '/map',
      label: 'Map Explorer',
      icon: MapPin,
      iconColor: 'text-teal-600',
    },
    {
      href: '/auctions',
      label: 'Auctions',
      icon: Gavel,
      iconColor: 'text-amber-500',
      badge: 'LIVE',
      badgeColor: 'bg-gradient-to-r from-amber-500 to-rose-500 text-white animate-pulse',
    },
    {
      href: '/inspections',
      label: 'Inspections',
      icon: Calendar,
      iconColor: 'text-sky-600',
    },
    {
      href: '/exchanges',
      label: 'Property Swap',
      icon: Repeat,
      iconColor: 'text-indigo-600',
    },
  ];

  return (
    <header className="sticky top-0 z-50 transition-all duration-300">
      {/* Top Ambient Ticker Bar */}
      <div className="bg-gradient-to-r from-slate-950 via-brand-dark to-slate-950 text-slate-300 text-[11px] py-1.5 px-4 border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex h-2 w-2 relative flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-slate-300 tracking-wide text-xs">
              <span className="text-emerald-400 font-bold uppercase tracking-wider text-[10px] mr-1.5 px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                Live Auction
              </span>
              Cinnamon Gardens 4BR Villa bidding is active now
            </span>
            <Link
              href="/auctions"
              className="hidden sm:inline-flex items-center gap-1 font-bold text-amber-400 hover:text-amber-300 transition underline underline-offset-2 ml-1"
            >
              <span>Bid Room</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <Globe2 className="w-3 h-3 text-slate-400" />
              Sri Lanka (LKR &bull; UTC+5:30)
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Verified Deeds Only
            </span>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Navigation Bar */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-slate-200/80 shadow-[0_4px_30px_rgba(0,0,0,0.03)]">
        <div className="max-w-[1480px] mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-2 lg:gap-4">
          
          {/* Brand Logo & Tagline */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group flex-shrink-0">
            <div className="relative">
              {/* Glowing Aura on Hover */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-300" />
              
              <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-slate-900 via-brand-dark to-slate-900 p-[1.5px] shadow-md flex items-center justify-center">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/30 via-transparent to-teal-400/20" />
                  <Home className="w-5 h-5 text-emerald-400 relative z-10 transition-transform group-hover:scale-110 duration-200" />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-baseline">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 group-hover:text-slate-950 transition">
                  Lanka
                </span>
                <span className="text-xl sm:text-2xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 bg-clip-text text-transparent">
                  Property
                </span>
              </div>
              <div className="flex items-center gap-1 -mt-1">
                <span className="text-[8px] sm:text-[9px] font-extrabold uppercase tracking-widest text-slate-400 group-hover:text-slate-500 transition">
                  Verified Real Estate
                </span>
                <span className="text-[8px] text-amber-500">✦</span>
              </div>
            </div>
          </Link>

          {/* Center Navigation Capsule Links */}
          <nav className="hidden lg:flex items-center bg-slate-100/80 p-1 sm:p-1.5 rounded-2xl border border-slate-200/60 shadow-inner backdrop-blur-md gap-0.5 xl:gap-1 flex-shrink">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                pathname === '/'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Search className={`w-3.5 h-3.5 ${pathname === '/' ? 'text-emerald-600' : 'text-slate-500'}`} />
              <span>Buy &amp; Rent</span>
            </Link>

            <Link
              href="/map"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                pathname === '/map'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <MapPin className={`w-3.5 h-3.5 ${pathname === '/map' ? 'text-emerald-600' : 'text-teal-600'}`} />
              <span>Map View</span>
            </Link>

            <Link
              href="/auctions"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                pathname === '/auctions'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Gavel className="w-3.5 h-3.5 text-amber-500" />
              <span>Auctions</span>
              <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full uppercase tracking-wider bg-gradient-to-r from-amber-500 to-rose-500 text-white animate-pulse">
                LIVE
              </span>
            </Link>

            <Link
              href="/inspections"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                pathname === '/inspections'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-sky-600" />
              <span>Inspections</span>
            </Link>

            <Link
              href="/exchanges"
              className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                pathname === '/exchanges'
                  ? 'bg-white text-emerald-700 shadow-sm shadow-slate-200/50 scale-[1.02]'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Repeat className="w-3.5 h-3.5 text-indigo-600" />
              <span>Swaps</span>
            </Link>

            {/* Admin link in center capsule ONLY if admin */}
            {isAdmin && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap ${
                  pathname === '/admin'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-purple-700 bg-purple-50 hover:bg-purple-100/80 border border-purple-200/60'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
                <span>Admin</span>
                <span className="text-[8px] font-black px-1.5 py-0.2 rounded bg-purple-200 text-purple-800">
                  HQ
                </span>
              </Link>
            )}
          </nav>

          {/* Right Action Suite: Post Property Button & User Profile Suite */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Post Property Button: Gated to authenticated users */}
            {isLoggedIn ? (
              <Link
                href="/post-property"
                className="relative group overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 bg-[length:200%_auto] hover:bg-right text-white font-bold text-xs px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 transition-all duration-300 active:scale-95 flex items-center gap-1.5 sm:gap-2 whitespace-nowrap flex-shrink-0"
              >
                <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-lg bg-white/20 flex items-center justify-center transition-transform group-hover:rotate-90 duration-300">
                  <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white" />
                </div>
                <span>Post Property</span>
              </Link>
            ) : null}

            {/* User Account / Profile Area */}
            <div className="relative flex-shrink-0" ref={dropdownRef}>
              {isLoggedIn && user ? (
                /* Authenticated User Pill with Avatar First */
                <button
                  type="button"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`flex items-center gap-2 p-1.5 pl-2 pr-2.5 rounded-2xl border transition-all duration-200 text-left cursor-pointer group flex-shrink-0 ${
                    dropdownOpen
                      ? 'bg-white border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20'
                      : 'bg-white/95 hover:bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                  aria-label="User account menu"
                >
                  {/* Avatar on Left with Status Ring */}
                  <div className="relative flex-shrink-0">
                    <div className="w-8 h-8 rounded-xl overflow-hidden bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-bold text-xs shadow-sm ring-1 ring-emerald-500/30">
                      {user.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar_url}
                          alt={user.full_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{user.full_name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white border border-emerald-600/20" />
                  </div>

                  {/* User details on right of avatar */}
                  <div className="flex flex-col min-w-0 pr-0.5 hidden sm:flex">
                    <span className="text-xs font-bold text-slate-800 truncate max-w-[100px] lg:max-w-[125px] leading-tight">
                      {user.full_name}
                    </span>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded-full border ${
                          user.role === 'SUPER_ADMIN' || user.group?.code === 'SUPER_ADMIN'
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : user.role === 'AGENT' || user.group?.code === 'AGENT'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        }`}
                      >
                        {user.group?.name || (user.role === 'SUPER_ADMIN' ? 'Admin' : user.role.toLowerCase().replace('_', ' '))}
                      </span>
                    </div>
                  </div>

                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 flex-shrink-0 ${
                      dropdownOpen ? 'rotate-180 text-emerald-600' : ''
                    }`}
                  />
                </button>
              ) : (
                /* Unauthenticated Sign In Button */
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  className="group relative flex items-center gap-2 py-2 px-3.5 rounded-xl bg-gradient-to-r from-slate-900 via-brand-dark to-slate-900 text-white font-bold text-xs shadow-md shadow-slate-900/10 hover:shadow-lg hover:shadow-slate-900/20 transition-all duration-200 active:scale-95 whitespace-nowrap overflow-hidden flex-shrink-0"
                  aria-label="Sign in"
                >
                  <div className="w-5 h-5 rounded-lg bg-white/10 flex items-center justify-center text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition duration-200">
                    <UserIcon className="w-3 h-3" />
                  </div>
                  <span>Sign In</span>
                </button>
              )}

              {/* Ultra-Stylish Profile Popover Dropdown */}
              {isLoggedIn && user && dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-64 sm:w-72 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-slate-100 p-3 z-50 animate-in fade-in zoom-in-95 duration-150 origin-top-right">
                  {/* User Profile Card Header */}
                  <div className="p-3.5 bg-gradient-to-br from-slate-900 via-brand-dark to-slate-950 rounded-2xl text-white mb-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl" />
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 ring-2 ring-emerald-400/40 flex-shrink-0">
                        {user.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatar_url}
                            alt={user.full_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-emerald-400 text-sm">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate flex items-center gap-1.5">
                          <span>{user.full_name}</span>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-300 truncate opacity-80">{user.email}</div>
                        <div className="mt-1">
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Action Links */}
                  <div className="space-y-1 text-xs text-slate-700">
                    {/* Admin Dashboard: Highlighted in purple */}
                    {isAdmin && (
                      <Link
                        href="/admin"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/80 hover:bg-purple-100/80 text-purple-800 font-bold transition border border-purple-200/60 group"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-purple-600" />
                          <span>Admin Moderation Console</span>
                        </div>
                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-purple-200 text-purple-900 font-black">
                          HQ
                        </span>
                      </Link>
                    )}

                    <Link
                      href="/post-property"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 font-semibold transition"
                    >
                      <Plus className="w-4 h-4 text-emerald-600" />
                      <span>Create New Property Ad</span>
                    </Link>

                    <Link
                      href="/inspections"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 font-medium transition"
                    >
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>My Inspection Bookings</span>
                    </Link>

                    <Link
                      href="/auctions"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 font-medium transition"
                    >
                      <Gavel className="w-4 h-4 text-amber-500" />
                      <span>Live Bidding Room</span>
                    </Link>

                    <Link
                      href="/exchanges"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 font-medium transition"
                    >
                      <Repeat className="w-4 h-4 text-indigo-600" />
                      <span>Property Swap Requests</span>
                    </Link>

                    <div className="my-1.5 border-t border-slate-100" />

                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl text-rose-600 hover:bg-rose-50 font-semibold transition text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition flex-shrink-0"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-4 pt-3 pb-6 space-y-2 animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-1 gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-between p-3 rounded-xl font-bold text-sm transition ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${link.iconColor}`} />
                      <span>{link.label}</span>
                    </div>
                    {link.badge && (
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider ${link.badgeColor}`}>
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between p-3 rounded-xl bg-purple-50 text-purple-700 font-bold text-sm border border-purple-200"
                >
                  <div className="flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    <span>Admin Moderation Console</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-purple-200 text-purple-900 font-black">
                    HQ
                  </span>
                </Link>
              )}

              {isLoggedIn && (
                <Link
                  href="/post-property"
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-emerald-600 text-white font-bold text-sm mt-2 shadow-md shadow-emerald-600/20"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post a Property Listing</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
