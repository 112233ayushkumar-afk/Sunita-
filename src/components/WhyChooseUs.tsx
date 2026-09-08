import { GraduationCap, HeartHandshake, Sparkles, MapPin } from 'lucide-react';
import { WHY_CHOOSE_US } from '../data/clinicData';

export function WhyChooseUs() {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6 text-teal-600" />;
      case 'HeartHandshake':
        return <HeartHandshake className="w-6 h-6 text-teal-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-teal-600" />;
      case 'MapPin':
      default:
        return <MapPin className="w-6 h-6 text-teal-600" />;
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 inline-block mb-3">
            Clinic Standards
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Why Choose Dr. Amita Singh’s Clinic
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600">
            Committed to ethical medical consultations, empathetic listening, and accessible women's healthcare in Patna.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {WHY_CHOOSE_US.map((item, idx) => (
            <div
              key={item.title}
              id={`why-choose-card-${idx}`}
              className="p-7 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-teal-300 hover:bg-white hover:shadow-md transition-all duration-200 flex flex-col"
            >
              <div className="w-12 h-12 rounded-2xl bg-teal-100/70 text-teal-700 flex items-center justify-center mb-5">
                {getIcon(item.iconName)}
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {item.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed flex-grow">
                {item.description}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
