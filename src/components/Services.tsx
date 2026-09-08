import { Stethoscope, Baby, ShieldAlert, HeartPulse, Phone, Calendar, ArrowUpRight } from 'lucide-react';
import { SERVICES_LIST, CLINIC_DATA } from '../data/clinicData';

interface ServicesProps {
  onOpenBookingModal?: (reason?: string) => void;
}

export function Services({ onOpenBookingModal }: ServicesProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Stethoscope':
        return <Stethoscope className="w-6 h-6 text-teal-600" />;
      case 'Baby':
        return <Baby className="w-6 h-6 text-teal-600" />;
      case 'ShieldAlert':
        return <ShieldAlert className="w-6 h-6 text-teal-600" />;
      case 'HeartPulse':
      default:
        return <HeartPulse className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <section id="services" className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
            Clinical Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Women’s Health &amp; Maternity Services
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Dedicated clinical consultations and medical care provided by Dr. Amita Singh in Sadhnapuri, Patna.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {SERVICES_LIST.map((service, index) => (
            <div
              key={service.id}
              id={`service-card-${service.id}`}
              className="group relative rounded-3xl bg-white border border-slate-200/80 p-7 sm:p-8 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-900/5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                {/* Header with Icon & Index */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-100 flex items-center justify-center group-hover:scale-105 group-hover:bg-teal-100/80 transition-all">
                    <div className="text-teal-700">
                      {getIcon(service.iconName)}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">
                    0{index + 1}
                  </span>
                </div>

                {/* Service Title */}
                <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-700 transition-colors">
                  {service.title}
                </h3>

                {/* Short Description */}
                <p className="mt-2.5 text-sm text-teal-800 font-medium leading-normal">
                  {service.shortDescription}
                </p>

                {/* Detailed Medically Responsible Info */}
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {service.details}
                </p>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-5 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  <strong className="text-slate-700">Suitable for:</strong> {service.suitableFor}
                </span>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenBookingModal?.(service.title)}
                    className="inline-flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold border border-teal-200 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-teal-700" />
                    <span>Book</span>
                  </button>

                  <a
                    href={`tel:${CLINIC_DATA.phoneRaw}`}
                    className="inline-flex items-center gap-1 font-semibold text-slate-600 hover:text-slate-900 py-1.5 px-2.5 rounded-lg hover:bg-slate-100 transition-colors"
                    aria-label={`Call to inquire about ${service.title}`}
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Note banner */}
        <div className="mt-12 p-4 rounded-2xl bg-teal-50/70 border border-teal-100/80 text-center max-w-2xl mx-auto text-xs text-slate-600">
          For specific clinical inquiries, scheduling, or questions regarding consultations, please contact the clinic at{' '}
          <a href={`tel:${CLINIC_DATA.phoneRaw}`} className="font-semibold text-teal-800 underline">
            {CLINIC_DATA.phone}
          </a>.
        </div>

      </div>
    </section>
  );
}
