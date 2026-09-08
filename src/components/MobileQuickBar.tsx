import { Phone, Navigation, Calendar } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';

interface MobileQuickBarProps {
  onOpenBookingModal: () => void;
}

export function MobileQuickBar({ onOpenBookingModal }: MobileQuickBarProps) {
  return (
    <div
      id="mobile-bottom-quickbar"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center justify-around gap-2"
    >
      {/* Book Consult - High visibility primary button */}
      <button
        type="button"
        onClick={onOpenBookingModal}
        id="mobile-quick-book-btn"
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-600 text-white font-bold text-xs shadow-sm active:scale-95 transition-all cursor-pointer"
        aria-label="Book Consultation"
      >
        <Calendar className="w-4 h-4" />
        <span>Book Consult</span>
      </button>

      {/* Call Button */}
      <a
        href={`tel:${CLINIC_DATA.phoneRaw}`}
        id="mobile-quick-call-btn"
        className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-sm active:scale-95 transition-all"
        aria-label="Call clinic directly"
      >
        <Phone className="w-4 h-4 text-teal-400" />
        <span>Call Now</span>
      </a>

      {/* Directions */}
      <a
        href={CLINIC_DATA.mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        id="mobile-quick-directions-btn"
        className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs border border-slate-200 active:scale-95 transition-all"
        aria-label="Get clinic directions in Google Maps"
      >
        <Navigation className="w-4 h-4 text-teal-600" />
      </a>
    </div>
  );
}
