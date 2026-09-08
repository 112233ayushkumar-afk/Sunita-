import { Phone, Navigation, Star, ShieldCheck, MapPin, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';
import { ClinicStatusBadge } from './ClinicStatusBadge';

interface HeroProps {
  onOpenBookingModal?: (reason?: string) => void;
}

export function Hero({ onOpenBookingModal }: HeroProps) {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 bg-gradient-to-b from-teal-50/50 via-white to-slate-50 border-b border-slate-100"
    >
      {/* Decorative subtle medical background elements */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-cyan-200/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Core Hero Info */}
          <div className="lg:col-span-7 flex flex-col items-start space-y-6">
            
            {/* Status & Category Badges */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-100/70 text-teal-800 border border-teal-200">
                <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                Women's Health Clinic
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                Patna, Bihar
              </span>
              <ClinicStatusBadge />
            </div>

            {/* Headings */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Compassionate Women’s Healthcare in Patna
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-teal-800">
                Dr. Amita Singh – MD, Obstetrician &amp; Gynecologist
              </p>
              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed pt-1">
                Providing attentive gynecological consultations, comprehensive obstetric care, and specialized medical supervision for high-risk pregnancies in Sadhnapuri, Patna.
              </p>
            </div>

            {/* Trust and Rating Highlights */}
            <div className="flex flex-wrap items-center gap-4 py-2 border-y border-slate-200/70 w-full">
              <div className="flex items-center gap-2">
                <div className="flex items-center text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-500" />
                  ))}
                </div>
                <span className="font-bold text-slate-900 text-sm">5.0</span>
                <span className="text-xs text-slate-500">·</span>
                <span className="font-semibold text-slate-900 text-xs sm:text-sm">11 reviews</span>
                <span className="text-xs text-emerald-700 font-medium">· 100% positive feedback</span>
              </div>
              <div className="hidden sm:block h-4 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5 text-xs sm:text-sm text-teal-700 font-medium">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>Specialist in High-Risk Pregnancy</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto pt-2">
              {/* Primary Book Consultation CTA */}
              <button
                type="button"
                id="hero-book-consultation-btn"
                onClick={() => {
                  if (onOpenBookingModal) {
                    onOpenBookingModal();
                  } else {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-base shadow-md shadow-teal-600/30 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all active:scale-98 cursor-pointer"
              >
                <Calendar className="w-5 h-5 text-teal-100" />
                <span>Book Consultation</span>
                <ChevronRight className="w-4 h-4 opacity-70" />
              </button>

              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                id="hero-call-clinic-btn"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-base shadow hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-all active:scale-98"
              >
                <Phone className="w-5 h-5 text-teal-300" />
                <span>Call {CLINIC_DATA.phone}</span>
              </a>

              <a
                href={CLINIC_DATA.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                id="hero-get-directions-btn"
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-white text-slate-800 font-semibold text-sm border border-slate-200 shadow-sm hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 transition-all active:scale-98"
              >
                <Navigation className="w-4 h-4 text-teal-600" />
                <span>Directions</span>
              </a>
            </div>

            {/* Micro details */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>In-Clinic &amp; Online Consultations Available</span>
              <span className="text-slate-300">·</span>
              <span>1st Floor, Raj Market, Sadhnapuri</span>
            </div>
          </div>

          {/* Right Column: Doctor & Clinic Presentation Card */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Main Card Container */}
              <div className="relative rounded-3xl bg-white border border-teal-100/90 p-5 sm:p-6 shadow-xl shadow-teal-950/5">
                
                {/* Doctor Photo with overlay details */}
                <div className="relative rounded-2xl overflow-hidden bg-slate-900 mb-5 shadow-sm">
                  <img
                    src={CLINIC_DATA.photoUrl || "/images/dr-amita-singh-clinic.jpg"}
                    alt="Dr. Amita Singh, MD Obstetrician & Gynecologist Patna"
                    className="w-full h-56 sm:h-64 object-cover object-top"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/20 to-transparent pointer-events-none" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-slate-800 text-[11px] font-bold shadow-sm">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                      5.0 (11 Reviews)
                    </span>
                    <span className="px-2.5 py-1 rounded-full bg-teal-900/90 text-teal-100 text-[11px] font-medium backdrop-blur">
                      Sadhnapuri, Patna
                    </span>
                  </div>

                  {/* Bottom Text Over Photo */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="text-lg font-bold leading-tight drop-shadow-sm">Dr. Amita Singh</h3>
                    <p className="text-xs text-teal-200 mt-0.5">
                      Obstetrician &amp; Gynecologist · MD
                    </p>
                  </div>
                </div>

                {/* Direct Highlights List */}
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Doctor Qualification</span>
                    <span className="font-bold text-slate-900">MD</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Specialization</span>
                    <span className="font-bold text-teal-700">High-Risk Pregnancy</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Clinic Opening Hours</span>
                    <span className="font-bold text-teal-700">{CLINIC_DATA.openingTime}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-600 font-medium">Location</span>
                    <span className="font-medium text-slate-800">1st Floor, Raj Market</span>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-5 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (onOpenBookingModal) {
                        onOpenBookingModal();
                      } else {
                        const el = document.getElementById('contact');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    id="hero-request-consult-btn"
                    className="flex items-center justify-center py-2.5 px-3 rounded-xl bg-teal-600 text-white font-semibold text-xs hover:bg-teal-700 transition-colors text-center cursor-pointer shadow-xs"
                  >
                    Book Consultation
                  </button>
                  <a
                    href={CLINIC_DATA.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-teal-50 text-teal-800 border border-teal-200 font-medium text-xs hover:bg-teal-100 transition-colors text-center"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>View on Map</span>
                  </a>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
