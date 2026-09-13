import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Copy,
  Check,
  Building2,
  Video,
  Download,
  Printer,
  Phone,
  Calendar,
  Clock,
  User,
  ShieldCheck,
  Database,
  FileCheck,
} from 'lucide-react';
import { ConsultationBooking } from '../types';
import { CLINIC_DATA } from '../data/clinicData';
import { downloadAppointmentPdf } from '../utils/appointmentPdf';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';

interface AppointmentConfirmationViewProps {
  booking: ConsultationBooking;
  supabaseSynced?: boolean | null;
  onResetForAnother: () => void;
  autoDownloadTriggered?: boolean;
}

export function AppointmentConfirmationView({
  booking,
  supabaseSynced,
  onResetForAnother,
}: AppointmentConfirmationViewProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Handle manual PDF download
  const handleDownloadPdf = () => {
    setIsDownloading(true);
    try {
      downloadAppointmentPdf(booking);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyId = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(booking.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  // Format date nicely
  let formattedDate = booking.date;
  try {
    const d = new Date(booking.date + 'T00:00:00');
    formattedDate = d.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    // fallback to booking.date
  }

  return (
    <div id="appointment-confirmation-screen" className="space-y-6 text-center animate-in fade-in duration-300">
      
      {/* 1. Header Requirement: Booking Request Submitted Successfully & Pending confirmation */}
      <div className="space-y-3">
        <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-50 border-4 border-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
          <Clock className="w-9 h-9 sm:w-11 sm:h-11" />
        </div>
        <div>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center justify-center gap-2">
            <span>Booking Request Submitted Successfully</span>
          </h3>
          <p className="mt-1.5 text-base sm:text-lg font-bold text-amber-800 max-w-md mx-auto leading-relaxed">
            Your consultation request is Pending confirmation.
          </p>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Our clinic reception has received your details and will verify Dr. Amita Singh's schedule to confirm your appointment.
          </p>
        </div>
      </div>

      {/* 2. Structured Confirmation Details Card (All Required Fields) */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 text-left space-y-3.5 shadow-sm">
        
        {/* Booking ID */}
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-500">
              Booking ID
            </span>
            <div className="text-lg font-mono font-extrabold text-teal-800">
              {booking.id}
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyId}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors shadow-xs cursor-pointer"
            title="Copy Booking ID"
          >
            {copiedId ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy ID</span>
              </>
            )}
          </button>
        </div>

        {/* Patient Name */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Patient Name</span>
          <span className="font-bold text-slate-900">{booking.patientName}</span>
        </div>

        {/* Age & Gender */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Age &amp; Gender</span>
          <span className="font-semibold text-slate-900">{booking.age} Years · {booking.gender}</span>
        </div>

        {/* Mobile Number */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Mobile Number</span>
          <span className="font-semibold text-slate-900">+91 {booking.mobileNumber}</span>
        </div>

        {/* Consultation Date */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Consultation Date</span>
          <span className="font-semibold text-slate-900">{formattedDate}</span>
        </div>

        {/* Consultation Time */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Consultation Time</span>
          <span className="font-semibold text-teal-800">{booking.time}</span>
        </div>

        {/* Consultation Type */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Consultation Type</span>
          <span className="inline-flex items-center gap-1.5 font-bold text-slate-800">
            {booking.consultationType === 'In-Clinic Consultation' ? (
              <Building2 className="w-4 h-4 text-teal-600" />
            ) : (
              <Video className="w-4 h-4 text-sky-600" />
            )}
            {booking.consultationType}
          </span>
        </div>

        {/* Consultation Reason */}
        <div className="flex items-center justify-between text-sm pb-2.5 border-b border-slate-200/80">
          <span className="text-slate-500 font-medium">Reason</span>
          <span className="font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs">{booking.consultationReason}</span>
        </div>

        {/* Additional Message (if present) */}
        {booking.additionalMessage && (
          <div className="flex flex-col text-sm pb-2.5 border-b border-slate-200/80 gap-1">
            <span className="text-slate-500 font-medium">Additional Notes</span>
            <span className="text-xs text-slate-700 italic bg-white p-2 rounded-lg border border-slate-200/80">
              "{booking.additionalMessage}"
            </span>
          </div>
        )}

        {/* Status: Initial status ALWAYS 'Pending' */}
        <div className="flex items-center justify-between text-sm pt-1">
          <span className="text-slate-500 font-medium">Booking Status</span>
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-extrabold ${
            booking.status === 'Confirmed'
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : 'bg-amber-100 text-amber-800 border border-amber-300'
          }`}>
            <Clock className="w-3.5 h-3.5" />
            <span>{booking.status}</span>
          </span>
        </div>

        {/* Supabase Storage Confirmation */}
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-100/60 border border-teal-200/80 text-xs text-teal-900 mt-2">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-700 shrink-0" />
            <span className="font-semibold">
              {supabaseSynced ? 'Saved in Supabase: consultation_bookings' : 'Saved to Clinic Records'}
            </span>
          </div>
          <span className="font-mono text-[10px] text-teal-700 bg-white/80 px-2 py-0.5 rounded border border-teal-200">
            Supabase: {SUPABASE_PROJECT_ID}
          </span>
        </div>
      </div>

      {/* 3. Prominent PDF Generation & Download Action */}
      <div className="space-y-3">
        {/* Main "Download PDF Booking Receipt" button */}
        <button
          type="button"
          id="download-appointment-pdf-btn"
          onClick={handleDownloadPdf}
          disabled={isDownloading}
          className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-base shadow-lg shadow-teal-700/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
        >
          <Download className="w-5 h-5 text-teal-100" />
          <span>{downloadSuccess ? 'PDF Downloaded Successfully!' : 'Download PDF Booking Receipt'}</span>
        </button>

        <p className="text-xs text-slate-500">
          Your official consultation booking receipt with unique Booking ID ({booking.id}) and clinic visit instructions is ready to save or print.
        </p>
      </div>

      {/* 4. Secondary Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href={`tel:${CLINIC_DATA.phoneRaw}`}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors"
        >
          <Phone className="w-4 h-4 text-teal-700" />
          <span>Call Clinic ({CLINIC_DATA.phone})</span>
        </a>

        <button
          type="button"
          onClick={onResetForAnother}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
        >
          <span>Book Another Consultation</span>
        </button>
      </div>

    </div>
  );
}
