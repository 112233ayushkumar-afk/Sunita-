import { MapPin, Navigation, Phone, Clock, Building2, Compass, ExternalLink, CheckCircle2 } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';
import { ClinicStatusBadge } from './ClinicStatusBadge';

export function LocationSection() {
  // Exact coordinates from Dr. Amita Singh's Google Maps profile (25.5879512, 85.1154222)
  const mapEmbedUrl = `https://maps.google.com/maps?q=25.5879512,85.1154222+(Dr.+Amita+Singh+Clinic)&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <section id="location" className="py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
            Clinic Address &amp; Access
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Visit Dr. Amita Singh’s Clinic
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-600">
            Centrally located in Sadhnapuri, Patna. Accessible by auto, cab, or private vehicle.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Address Details, Landmarks & Hours */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Address Card */}
            <div className="p-7 rounded-3xl bg-slate-50 border border-slate-200/90 shadow-sm space-y-6">
              
              {/* Full Address Block */}
              <div>
                <div className="flex items-center gap-2 text-teal-700 font-bold text-xs uppercase tracking-wider mb-2">
                  <MapPin className="w-4 h-4" />
                  Clinic Address
                </div>
                <div className="text-slate-900 font-bold text-lg leading-snug">
                  1st Floor, Raj Market, Road No. 6D
                </div>
                <div className="text-slate-700 font-medium text-sm mt-1">
                  Near Bharat Gas Godown, Behind Sai Mandir
                </div>
                <div className="text-slate-600 text-sm mt-0.5">
                  Sadhnapuri, Patna, Bihar – 800001
                </div>
              </div>

              {/* Landmark breakdown */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Key Location Landmarks
                </div>
                <div className="grid grid-cols-1 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/70">
                    <Building2 className="w-4 h-4 text-teal-600 shrink-0" />
                    <span><strong>1st Floor, Raj Market</strong> (Road No. 6D)</span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/70">
                    <Compass className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Near <strong>Bharat Gas Godown</strong></span>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white border border-slate-200/70">
                    <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Directly <strong>Behind Sai Mandir</strong></span>
                  </div>
                </div>
              </div>

              {/* Hours & Live Dynamic Status */}
              <div className="pt-4 border-t border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Clinic Timings
                  </span>
                  <span className="font-bold text-slate-900">9:30 AM onwards</span>
                </div>
                <div className="pt-1">
                  <ClinicStatusBadge showSubText={true} className="w-full justify-center py-2" />
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <a
                  href={CLINIC_DATA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  id="location-get-directions-btn"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 text-white font-semibold text-sm shadow-sm hover:bg-teal-700 transition-colors text-center"
                >
                  <Navigation className="w-4 h-4" />
                  <span>Get Directions</span>
                </a>

                <a
                  href={`tel:${CLINIC_DATA.phoneRaw}`}
                  id="location-call-clinic-btn"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-800 font-semibold text-sm border border-slate-200 hover:bg-slate-50 transition-colors text-center"
                >
                  <Phone className="w-4 h-4 text-teal-600" />
                  <span>Call Clinic</span>
                </a>
              </div>

            </div>

            {/* Official Google Business Profile Verification Card */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex items-center gap-4">
              <img
                src={CLINIC_DATA.photoUrl || "/images/dr-amita-singh-clinic.jpg"}
                alt="Clinic photo preview"
                className="w-16 h-16 rounded-xl object-cover object-top border border-teal-200 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>Official Google Maps Listing</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5 truncate">
                  Dr. Amita Singh · 5.0 ★ (11 Reviews)
                </p>
                <a
                  href={CLINIC_DATA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-700 hover:text-teal-900 mt-1"
                >
                  <span>Open clinic in Google Maps</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

          </div>

          {/* Right Column: Google Maps Embed Area */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl border border-slate-200 bg-slate-100 overflow-hidden shadow-sm flex flex-col h-[460px] relative">
              
              {/* Top Banner on Map */}
              <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 border-b border-slate-200 flex items-center justify-between z-10 text-xs">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-600" />
                  Dr. Amita Singh Clinic · Sadhnapuri, Patna
                </span>
                <a
                  href={CLINIC_DATA.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-teal-700 hover:text-teal-900 font-medium underline"
                >
                  Open in Google Maps
                </a>
              </div>

              {/* Embedded Map Frame */}
              <div className="flex-1 w-full h-full relative">
                <iframe
                  title="Dr. Amita Singh Clinic Location Map"
                  src={mapEmbedUrl}
                  className="w-full h-full border-0"
                  loading="lazy"
                  allowFullScreen
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>

              {/* Bottom Quick Bar */}
              <div className="bg-slate-900 text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs z-10">
                <span>
                  📍 1st Floor, Raj Market, Road No. 6D, Patna – 800001
                </span>
                <a
                  href={`tel:${CLINIC_DATA.phoneRaw}`}
                  className="text-teal-300 font-semibold hover:text-white flex items-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>{CLINIC_DATA.phone}</span>
                </a>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
