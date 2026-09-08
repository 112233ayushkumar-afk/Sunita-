import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { getClinicCurrentStatus } from '../data/clinicData';

interface ClinicStatusBadgeProps {
  showSubText?: boolean;
  className?: string;
}

export function ClinicStatusBadge({ showSubText = true, className = '' }: ClinicStatusBadgeProps) {
  const [status, setStatus] = useState(getClinicCurrentStatus());

  useEffect(() => {
    // Re-check status every 60 seconds
    const interval = setInterval(() => {
      setStatus(getClinicCurrentStatus());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="clinic-status-badge"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors ${status.badgeClass} ${className}`}
      title="Clinic hours: 9:30 AM onwards"
    >
      <span className="relative flex h-2 w-2">
        {status.isOpen && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        )}
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            status.isOpen ? 'bg-emerald-500' : 'bg-slate-400'
          }`}
        ></span>
      </span>

      <span className="font-semibold flex items-center gap-1">
        <Clock className="w-3.5 h-3.5" />
        {status.statusText}
      </span>

      {showSubText && (
        <>
          <span className="text-slate-300">|</span>
          <span className="opacity-90">{status.subText}</span>
        </>
      )}
    </div>
  );
}
