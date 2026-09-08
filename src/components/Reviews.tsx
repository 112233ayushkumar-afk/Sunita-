import { Star, CheckCircle2, Quote, ExternalLink } from 'lucide-react';
import { PATIENT_REVIEWS, CLINIC_DATA } from '../data/clinicData';

export function Reviews() {
  return (
    <section id="reviews" className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
            Patient Feedback
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Patient Rating &amp; Review
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-600">
            Real feedback from patients who have visited Dr. Amita Singh’s clinic in Patna.
          </p>
        </div>

        {/* Aggregate Rating Summary Card */}
        <div className="max-w-2xl mx-auto mb-10">
          <div className="rounded-3xl bg-white border border-teal-100 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex items-center gap-5">
              <div className="text-4xl sm:text-5xl font-extrabold text-slate-900 font-mono">
                5.0
              </div>
              <div>
                <div className="flex items-center text-amber-500 mb-1 justify-center sm:justify-start">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 stroke-amber-500" />
                  ))}
                </div>
                <div className="text-sm font-semibold text-slate-800">
                  Based on 11 reviews
                </div>
                <div className="text-xs text-slate-500">
                  Women's Health Clinic · Patna, Bihar
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end gap-2 text-xs text-teal-800 bg-teal-50 px-4 py-2 rounded-2xl border border-teal-100 shrink-0">
              <span className="flex items-center gap-1.5 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                100% 5-Star Rating
              </span>
              <span className="text-slate-500 text-[11px]">Public Clinic Listing</span>
            </div>
          </div>
        </div>

        {/* Patient Review Card */}
        <div className="max-w-2xl mx-auto">
          {PATIENT_REVIEWS.map((rev) => (
            <div
              key={rev.id}
              id="patient-review-card"
              className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-10 shadow-sm relative overflow-hidden"
            >
              <Quote className="w-12 h-12 text-teal-100 absolute -top-1 -left-1 transform -rotate-12 pointer-events-none" />

              {/* Stars */}
              <div className="flex items-center text-amber-500 mb-4 relative z-10">
                {[...Array(rev.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                ))}
                <span className="ml-2 text-xs font-bold text-slate-800">5.0 / 5.0</span>
              </div>

              {/* Review Text strictly using the provided sentiment */}
              <blockquote className="text-lg sm:text-xl font-medium text-slate-800 italic leading-relaxed relative z-10 mb-6">
                “{rev.text}”
              </blockquote>

              {/* Verified Attribution - no invented name or fake date */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 font-bold flex items-center justify-center text-xs">
                    P
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {rev.verifiedSource}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      Verified Patient Submission
                    </span>
                  </div>
                </div>

                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-[11px] font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  Verified Review
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Note on Transparency & Google Maps Link */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
          <span className="text-xs text-slate-500">
            Showing authentic patient feedback for Dr. Amita Singh · 5.0 Rating
          </span>
          <a
            href={CLINIC_DATA.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-xs font-semibold text-teal-800 hover:bg-slate-50 hover:border-slate-300 transition-colors"
          >
            <span>Read all 11 reviews on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5 text-teal-600" />
          </a>
        </div>

      </div>
    </section>
  );
}
