import { useState, useEffect } from 'react';
import { Phone, Menu, X, Heart, MapPin, Calendar, ShieldCheck, UserCheck, Lock } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';
import { ClinicStatusBadge } from './ClinicStatusBadge';
import { getStoredBookings, BOOKING_UPDATE_EVENT } from '../utils/bookingStorage';

interface HeaderProps {
  onOpenBookingModal: (reason?: string) => void;
  onOpenAdminPortal: () => void;
}

export function Header({ onOpenBookingModal, onOpenAdminPortal }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const updateCount = () => {
      const all = getStoredBookings();
      setTotalCount(all.length);
    };

    updateCount();
    window.addEventListener(BOOKING_UPDATE_EVENT, updateCount);
    return () => window.removeEventListener(BOOKING_UPDATE_EVENT, updateCount);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Services', href: '#services' },
    { name: 'High-Risk Pregnancy', href: '#high-risk-pregnancy' },
    { name: 'Reviews', href: '#reviews' },
    { name: 'Location', href: '#location' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <>
      {/* Top micro-bar for quick local notice & status */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="truncate">
              Sadhnapuri, Road No. 6D, Patna, Bihar – 800001
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <ClinicStatusBadge showSubText={false} className="py-0.5 px-2 bg-slate-800 border-slate-700 text-slate-200" />
            <a
              href={`tel:${CLINIC_DATA.phoneRaw}`}
              className="font-medium text-teal-300 hover:text-teal-200 flex items-center gap-1 transition-colors"
              id="top-bar-phone-link"
            >
              <Phone className="w-3 h-3" />
              <span>{CLINIC_DATA.phone}</span>
            </a>
            <div className="h-3 w-px bg-slate-700 hidden sm:block" />
            {/* Doctor/Admin Portal Quick Trigger */}
            <button
              type="button"
              onClick={onOpenAdminPortal}
              id="topbar-admin-portal-btn"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-teal-300 transition-colors cursor-pointer text-xs border border-slate-700"
              title="Separate Admin Panel (View All Booking Form Data)"
            >
              <Lock className="w-3 h-3 text-teal-400" />
              <span>Admin Panel</span>
              {totalCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-teal-500 text-white font-bold text-[10px]">
                  {totalCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header
        id="main-header"
        className={`sticky top-0 z-40 w-full transition-all duration-200 ${
          isScrolled
            ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/80'
            : 'bg-white border-b border-slate-100'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo / Doctor Title Area */}
            <a
              href="#home"
              id="brand-logo-link"
              className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-teal-600 rounded-lg p-1"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Heart className="w-6 h-6 fill-white/20 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  Dr. Amita Singh
                </span>
                <span className="text-xs font-medium text-teal-700 tracking-wide">
                  MD · Obstetrician &amp; Gynecologist
                </span>
              </div>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-5" aria-label="Main Navigation">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  id={`nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="text-sm font-medium text-slate-600 hover:text-teal-700 transition-colors py-2 px-1 focus:outline-none focus:text-teal-700 border-b-2 border-transparent hover:border-teal-600"
                >
                  {link.name}
                </a>
              ))}
            </nav>

            {/* Desktop CTA */}
            <div className="hidden sm:flex items-center gap-2.5">
              {/* Book Consultation Button */}
              <button
                type="button"
                id="header-book-consultation-btn"
                onClick={() => onOpenBookingModal()}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs sm:text-sm border border-teal-200 transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <Calendar className="w-4 h-4 text-teal-700" />
                <span>Book Consultation</span>
              </button>

              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                id="header-call-now-btn"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-teal-600 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-teal-600/25 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all active:scale-95"
              >
                <Phone className="w-4 h-4" />
                <span>Call Now</span>
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => onOpenBookingModal()}
                className="p-2 rounded-xl bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors text-xs font-bold sm:hidden flex items-center gap-1"
                aria-label="Book Consultation"
              >
                <Calendar className="w-4 h-4" />
                <span>Book</span>
              </button>
              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                id="header-mobile-call-icon-btn"
                className="p-2.5 rounded-full bg-teal-600 text-white hover:bg-teal-700 transition-colors sm:hidden"
                aria-label="Call Clinic"
              >
                <Phone className="w-4 h-4" />
              </a>
              <button
                type="button"
                id="mobile-menu-toggle-btn"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2.5 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-600"
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle navigation menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            id="mobile-menu-dropdown"
            className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 shadow-xl animate-in slide-in-from-top-2"
          >
            <div className="mb-3 px-2">
              <ClinicStatusBadge />
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  id={`mobile-nav-link-${link.name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2.5 rounded-md text-base font-medium text-slate-700 hover:text-teal-700 hover:bg-teal-50/60 transition-colors"
                >
                  {link.name}
                </a>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBookingModal();
                }}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-teal-700 text-white font-bold text-center shadow-md shadow-teal-700/20 active:scale-98"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Consultation (Popup Form)</span>
              </button>

              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                id="mobile-menu-call-now-btn"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 text-slate-800 font-semibold text-center hover:bg-slate-200"
              >
                <Phone className="w-4 h-4 text-teal-600" />
                <span>Call Clinic: {CLINIC_DATA.phone}</span>
              </a>

              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAdminPortal();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                <span>Admin Panel · View All Bookings ({totalCount})</span>
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
