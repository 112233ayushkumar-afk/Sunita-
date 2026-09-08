import { Phone, ShieldAlert, HeartHandshake, Eye, ClipboardCheck, Calendar, ChevronRight } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';

interface HighRiskPregnancyProps {
  onOpenBookingModal?: (reason?: string) => void;
}

export function HighRiskPregnancy({ onOpenBookingModal }: HighRiskPregnancyProps) {
  const points = [
    {
      icon: Eye,
      title: "Attentive Clinical Monitoring",
      description: "Structured, frequent clinical assessments to closely observe maternal health and fetal developmental progress.",
    },
    {
      icon: ClipboardCheck,
      title: "Individualized Care Planning",
      description: "Every expectant mother's clinical scenario is unique. Guidance is tailored according to individual health indicators.",
    },
    {
      icon: HeartHandshake,
      title: "Compassionate Communication",
      description: "Clear, open explanations regarding health observations, lifestyle precautions, and necessary follow-up schedules.",
    },
  ];

  return (
    <section
      id="high-risk-pregnancy"
      className="py-16 md:py-24 bg-gradient-to-b from-white via-teal-50/30 to-white border-b border-slate-100 relative overflow-hidden"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl bg-white border border-teal-200/80 shadow-xl shadow-teal-900/5 p-8 sm:p-12 lg:p-16">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-teal-100 text-teal-800 border border-teal-200">
                <ShieldAlert className="w-3.5 h-3.5 text-teal-700" />
                Specialist Focus
              </div>

              <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                High-Risk Pregnancy Care
              </h2>

              <p className="text-base sm:text-lg text-slate-700 leading-relaxed">
                A high-risk pregnancy involves health factors that may require closer medical observation and individualized clinical care. Dr. Amita Singh provides thoughtful, attentive clinical monitoring and medical guidance to support both mother and baby through every stage.
              </p>

              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 text-sm text-slate-700 leading-relaxed">
                <p>
                  <strong>Medically Responsible Note:</strong> Clinical factors such as maternal age, pre-existing health conditions, multiple gestations, or specific pregnancy-related observations warrant diligent oversight. Timely consultations and consistent follow-ups help ensure attentive care.
                </p>
              </div>

              {/* Bullet Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                {points.map((pt) => {
                  const Icon = pt.icon;
                  return (
                    <div key={pt.title} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center mb-2.5">
                        <Icon className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mb-1">{pt.title}</h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{pt.description}</p>
                    </div>
                  );
                })}
              </div>

              {/* Call for Consultation CTA */}
              <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    onOpenBookingModal?.('High-Risk Pregnancy Care / Consultation')
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-teal-600 text-white font-bold text-sm shadow-md shadow-teal-600/25 hover:bg-teal-700 active:scale-98 transition-all cursor-pointer"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book High-Risk Consultation</span>
                  <ChevronRight className="w-4 h-4 opacity-70" />
                </button>

                <a
                  href={`tel:${CLINIC_DATA.phoneRaw}`}
                  id="high-risk-call-consultation-btn"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all"
                >
                  <Phone className="w-4 h-4 text-teal-300" />
                  <span>Call {CLINIC_DATA.phone}</span>
                </a>
              </div>

            </div>

            {/* Right Graphic Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl bg-gradient-to-tr from-teal-900 to-slate-900 text-white p-8 relative overflow-hidden shadow-lg">
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-300">
                    <ShieldAlert className="w-6 h-6" />
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    Specialized Medical Supervision
                  </h3>

                  <p className="text-xs text-teal-100/90 leading-relaxed">
                    Under the clinical guidance of Dr. Amita Singh (MD), patients receive comprehensive assessment, routine blood pressure/glucose tracking, fetal growth evaluations, and prudent medical intervention when necessary.
                  </p>

                  <div className="pt-4 border-t border-teal-800/80 space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1 border-b border-teal-800/40">
                      <span className="text-teal-200">Consultation Option</span>
                      <span className="font-bold text-white">In-Clinic &amp; Online</span>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-teal-800/40">
                      <span className="text-teal-200">Primary Center</span>
                      <span className="font-bold text-white">Sadhnapuri, Patna</span>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-teal-200">Timing</span>
                      <span className="font-bold text-white">9:30 AM Onwards</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() =>
                        onOpenBookingModal?.('High-Risk Pregnancy Care / Consultation')
                      }
                      className="w-full py-2.5 px-4 rounded-xl bg-white text-teal-900 font-bold text-xs hover:bg-teal-50 transition-colors text-center cursor-pointer"
                    >
                      Schedule High-Risk Assessment &rarr;
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
