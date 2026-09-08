import { Heart, Phone, MapPin, Clock, ArrowUp, Calendar, UserCheck, Lock } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';

interface FooterProps {
  onOpenBookingModal?: () => void;
  onOpenAdminPortal?: () => void;
}

export function Footer({ onOpenBookingModal, onOpenAdminPortal }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About Dr. Amita Singh', href: '#about' },
    { name: 'Clinical Services', href: '#services' },
    { name: 'High-Risk Pregnancy', href: '#high-risk-pregnancy' },
    { name: 'Patient Reviews', href: '#reviews' },
    { name: 'Clinic Location & Map', href: '#location' },
    { name: 'Book Consultation', href: '#contact' },
  ];

  return (
    <footer id="footer" className="bg-slate-950 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">
          
          {/* Brand & Doctor Intro */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-400">
                <Heart className="w-5 h-5 fill-teal-400/20" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white tracking-tight">
                  Dr. Amita Singh
                </h3>
                <p className="text-xs text-teal-400 font-medium">
                  MD · Obstetrician &amp; Gynecologist
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Dedicated women’s health clinic in Sadhnapuri, Patna. Specialized obstetric care, general gynecological evaluations, and attentive high-risk pregnancy monitoring.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-950/80 border border-teal-800/60 text-teal-300">
                ★ 5.0 Rating (11 Patient Reviews)
              </span>
              {onOpenBookingModal && (
                <button
                  type="button"
                  onClick={onOpenBookingModal}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-600 hover:bg-teal-500 text-white transition-colors cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Consultation</span>
                </button>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="hover:text-teal-400 transition-colors py-1 inline-block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Clinic Address & Contact */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white">
              Clinic Address &amp; Contact
            </h4>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <address className="not-italic leading-relaxed text-slate-300">
                  {CLINIC_DATA.address.line1},<br />
                  {CLINIC_DATA.address.line2},<br />
                  {CLINIC_DATA.address.line3}, {CLINIC_DATA.address.city}, {CLINIC_DATA.address.state} – {CLINIC_DATA.address.pincode}
                </address>
              </div>

              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <a
                  href={`tel:${CLINIC_DATA.phoneRaw}`}
                  className="font-bold text-white hover:text-teal-300 transition-colors"
                >
                  {CLINIC_DATA.phone}
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-teal-400 shrink-0" />
                <span>Opening Time: {CLINIC_DATA.openingTime}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href={CLINIC_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 underline"
              >
                View on Google Maps &rarr;
              </a>
              {onOpenAdminPortal && (
                <button
                  type="button"
                  onClick={onOpenAdminPortal}
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-teal-300 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-teal-400" />
                  <span>Admin Panel (Doctor &amp; Staff Login)</span>
                </button>
              )}
            </div>
          </div>

        </div>

        {/* Copyright and Back to Top */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Dr. Amita Singh. All rights reserved.</p>

          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 hover:text-white transition-colors focus:outline-none cursor-pointer"
            aria-label="Back to top"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </footer>
  );
}
