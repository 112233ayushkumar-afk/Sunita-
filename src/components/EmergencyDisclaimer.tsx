import { AlertTriangle } from 'lucide-react';

export function EmergencyDisclaimer() {
  return (
    <section aria-label="Medical Disclaimer" className="bg-amber-50/80 border-y border-amber-200/60 py-6 px-4">
      <div className="max-w-5xl mx-auto flex items-start sm:items-center gap-3.5 text-xs text-amber-950">
        <div className="p-2 rounded-xl bg-amber-100 text-amber-800 shrink-0 mt-0.5 sm:mt-0">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div className="leading-relaxed">
          <span className="font-bold uppercase tracking-wider text-[11px] block sm:inline mr-1 text-amber-900">
            Emergency Notice &amp; Medical Disclaimer:
          </span>
          This website provides general clinic information and is not a substitute for professional medical advice. In a medical emergency, contact local emergency services or visit the nearest emergency department.
        </div>
      </div>
    </section>
  );
}
