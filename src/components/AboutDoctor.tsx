import { Award, UserCheck, Heart, Sparkles, MapPin, ExternalLink, CheckCircle2 } from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';

export function AboutDoctor() {
  return (
    <section id="about" className="py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200/60 inline-block mb-3">
            Doctor Profile &amp; Clinic Care
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Meet Dr. Amita Singh
          </h2>
          <p className="mt-2 text-lg font-semibold text-teal-800">
            MD | Obstetrician &amp; Gynecologist
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Visual Presentation: Authentic Doctor & Clinic Photo */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm">
              
              {/* Image Container with Doctor Photo */}
              <div className="relative group overflow-hidden bg-slate-900">
                <img
                  src={CLINIC_DATA.photoUrl || "/images/dr-amita-singh-clinic.jpg"}
                  alt="Dr. Amita Singh - MD Obstetrician & Gynecologist Patna at consultation desk"
                  className="w-full h-80 sm:h-96 object-cover object-top hover:scale-102 transition-transform duration-500"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/30 to-transparent pointer-events-none" />
                
                {/* Overlay Badge */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur text-teal-900 text-xs font-bold shadow-md">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                    Verified Google Maps Photo
                  </span>
                </div>

                {/* Bottom Overlay Label */}
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <div className="text-lg font-bold leading-tight">Dr. Amita Singh, MD</div>
                  <p className="text-xs text-teal-200 mt-0.5">
                    Obstetrician &amp; Gynecologist · Sadhnapuri Clinic
                  </p>
                </div>
              </div>

              {/* Card Meta & Qualifications */}
              <div className="p-6">
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500">Degree &amp; Credential:</span>
                    <span className="font-bold text-slate-900">MD</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500">Specialty:</span>
                    <span className="font-semibold text-slate-900">Obstetrician &amp; Gynecologist</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500">Practice Focus:</span>
                    <span className="font-bold text-teal-700">High-Risk Pregnancy Specialist</span>
                  </div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold text-slate-900">Raj Market, Sadhnapuri, Patna</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Clinic Hours:</span>
                    <span className="font-semibold text-slate-900">9:30 AM onwards</span>
                  </div>
                </div>

                {/* Direct Google Maps Link */}
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <a
                    href={CLINIC_DATA.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-semibold border border-teal-200 transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-600" />
                    <span>View Location on Google Maps</span>
                    <ExternalLink className="w-3 h-3 ml-0.5 text-teal-500" />
                  </a>
                </div>
              </div>

            </div>
          </div>

          {/* Right Column: Medically Responsible Narrative & Pillars */}
          <div className="lg:col-span-7 space-y-6">
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed text-base space-y-4">
              <p>
                <strong className="text-slate-900">Dr. Amita Singh</strong> is an MD-qualified Obstetrician and Gynecologist practicing in Patna, Bihar. The clinic is committed to delivering dedicated, patient-centered women’s healthcare in a comfortable, respectful, and attentive clinical setting.
              </p>
              <p>
                The clinic’s focus encompasses comprehensive gynecological consultations, routine obstetric guidance for expectant mothers, and specialized medical oversight for high-risk pregnancies. Each patient receives personalized attention where concerns are carefully evaluated and explained with clinical clarity.
              </p>
              <p>
                Whether you are scheduling a routine women’s health check, seeking guidance during pregnancy, or requiring careful clinical supervision for a high-risk pregnancy, Dr. Amita Singh offers thoughtful, medically grounded care tailored to your individual health journey.
              </p>
            </div>

            {/* Core Practice Pillars (strictly based on provided details) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">MD Qualification</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Certified postgraduate medical qualification in Obstetrics &amp; Gynecology.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">High-Risk Pregnancy Focus</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Specialized medical monitoring for pregnancies requiring closer observation.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Patient-Centered Care</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Respectful, supportive discussions focused on patient comfort and clear explanations.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-teal-50/50 border border-teal-100 flex items-start gap-3">
                <div className="p-2 rounded-xl bg-teal-100 text-teal-700 shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Accessible Patna Clinic</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Conveniently located at Sadhnapuri, near Bharat Gas Godown and Sai Mandir.
                  </p>
                </div>
              </div>
            </div>

            {/* Direct Call to Action */}
            <div className="pt-2">
              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 underline underline-offset-4"
              >
                Call the clinic at {CLINIC_DATA.phone} for consultation details &rarr;
              </a>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
