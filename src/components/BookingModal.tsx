import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Video,
  ShieldCheck,
  CalendarCheck,
  ChevronRight,
  Database,
  Cloud,
} from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';
import { BookingGender, ConsultationType, ConsultationBooking } from '../types';
import { saveNewBookingAsync } from '../utils/bookingStorage';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';
import { downloadAppointmentPdf } from '../utils/appointmentPdf';
import { AppointmentConfirmationView } from './AppointmentConfirmationView';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialReason?: string;
  initialConsultationType?: ConsultationType;
}

const COMMON_REASONS = [
  'High-Risk Pregnancy Care / Consultation',
  'Routine Antenatal & Obstetric Checkup',
  'General Gynecological Consultation',
  'Infertility & Conception Guidance',
  'PCOD / PCOS & Menstrual Irregularities',
  'Pre-Pregnancy Planning & Counseling',
  'Postnatal Care & Recovery',
  'Pelvic Pain / Infection Checkup',
  'Second Medical Opinion',
  'Other Women\'s Health Concern',
];

const TIME_SLOTS = [
  'Morning: 09:30 AM - 11:30 AM',
  'Midday: 11:30 AM - 01:30 PM',
  'Afternoon: 02:00 PM - 04:30 PM',
  'Evening: 05:00 PM - 07:00 PM',
  'Late Evening: 07:00 PM - 08:30 PM',
];

export function BookingModal({
  isOpen,
  onClose,
  initialReason,
  initialConsultationType,
}: BookingModalProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<BookingGender>('Female');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Patna, Bihar');
  const [consultationReason, setConsultationReason] = useState(
    initialReason || COMMON_REASONS[0]
  );
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [consultationType, setConsultationType] = useState<ConsultationType>(
    initialConsultationType || 'In-Clinic Consultation'
  );

  // UI state
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<ConsultationBooking | null>(null);
  const [supabaseSynced, setSupabaseSynced] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Set today's date formatted for min date attribute
  const todayStr = new Date().toISOString().split('T')[0];

  // Sync initial reason if changed
  useEffect(() => {
    if (initialReason) {
      setConsultationReason(initialReason);
    }
    if (initialConsultationType) {
      setConsultationType(initialConsultationType);
    }
  }, [initialReason, initialConsultationType]);

  // Set default preferred date to tomorrow if empty
  useEffect(() => {
    if (isOpen && !preferredDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [isOpen, preferredDate]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Prevent background body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!patientName.trim()) {
      newErrors.patientName = 'Patient full name is required.';
    } else if (patientName.trim().length < 2) {
      newErrors.patientName = 'Please enter a valid full name.';
    }

    if (!age) {
      newErrors.age = 'Age is required.';
    } else {
      const ageNum = parseInt(age, 10);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
        newErrors.age = 'Please enter a valid age (1-120).';
      }
    }

    if (!gender) {
      newErrors.gender = 'Please select a gender.';
    }

    const cleanMobile = mobileNumber.replace(/[^0-9]/g, '');
    if (!cleanMobile) {
      newErrors.mobileNumber = 'Mobile number is required.';
    } else if (cleanMobile.length < 10) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    if (email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        newErrors.email = 'Please enter a valid email address.';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'City or address is required.';
    }

    if (!consultationReason.trim()) {
      newErrors.consultationReason = 'Reason for consultation is required.';
    }

    if (!preferredDate) {
      newErrors.preferredDate = 'Preferred consultation date is required.';
    } else {
      const selected = new Date(preferredDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.preferredDate = 'Date cannot be in the past.';
      }
    }

    if (!preferredTime) {
      newErrors.preferredTime = 'Preferred consultation time is required.';
    }

    if (!consultationType) {
      newErrors.consultationType = 'Consultation type is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll top of modal to error banner
      const modalContent = document.getElementById('booking-modal-scroll-content');
      if (modalContent) modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await saveNewBookingAsync({
        patientName: patientName.trim(),
        age: parseInt(age, 10),
        gender,
        mobileNumber: mobileNumber.trim(),
        email: email.trim() || undefined,
        address: address.trim(),
        consultationReason: consultationReason.trim(),
        date: preferredDate,
        time: preferredTime,
        consultationType,
      });

      setSubmittedBooking(res.booking);
      setSupabaseSynced(res.supabaseSuccess);

      // Automatically generate & download the Appointment Confirmation PDF only after booking is saved
      try {
        downloadAppointmentPdf(res.booking);
      } catch (pdfErr) {
        console.warn('Auto PDF generation note:', pdfErr);
      }
    } catch (err) {
      console.error('Error submitting consultation booking:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  const handleResetForAnother = () => {
    setSubmittedBooking(null);
    setSupabaseSynced(null);
    setPatientName('');
    setAge('');
    setGender('Female');
    setMobileNumber('');
    setEmail('');
    setAddress('Patna, Bihar');
    setConsultationReason(COMMON_REASONS[0]);
    setErrors({});
  };

  const handleCopyId = (id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2500);
    }
  };

  return (
    <div
      id="booking-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 sm:py-8 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-modal-title"
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 sm:px-8 sm:py-5 bg-gradient-to-r from-teal-900 via-teal-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700/60 border border-teal-600/60 flex items-center justify-center text-teal-200">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="booking-modal-title" className="text-lg sm:text-xl font-bold text-white leading-tight">
                {submittedBooking ? 'Consultation Confirmed' : 'Book a Consultation'}
              </h2>
              <p className="text-xs text-teal-200/90 mt-0.5">
                Dr. Amita Singh, MD · Obstetrician &amp; Gynecologist · Patna
              </p>
            </div>
          </div>

          <button
            type="button"
            id="booking-modal-close-btn"
            onClick={handleClose}
            className="p-2 rounded-full text-teal-200 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-400"
            aria-label="Close booking modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Container with Smooth Scrolling */}
        <div
          id="booking-modal-scroll-content"
          className="overflow-y-auto px-6 py-6 sm:px-8 sm:py-7 flex-1 space-y-6"
        >
          {submittedBooking ? (
            <AppointmentConfirmationView
              booking={submittedBooking}
              supabaseSynced={supabaseSynced}
              onResetForAnother={handleResetForAnother}
            />
          ) : (
            /* ============================================================
               CONSULTATION BOOKING FORM (11 PATIENT DETAILS)
               ============================================================ */
            <form onSubmit={handleSubmit} id="consultation-booking-form" noValidate className="space-y-5">
              
              {/* Validation Summary if errors exist */}
              {Object.keys(errors).length > 0 && (
                <div
                  id="booking-form-error-banner"
                  className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-3 animate-in fade-in"
                >
                  <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-rose-900">
                      Please correct the following fields to proceed:
                    </div>
                    <ul className="mt-1 list-disc list-inside space-y-0.5 text-xs text-rose-700">
                      {Object.values(errors).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Field 10: Consultation Type Selector (Pills) */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-2">
                  10. Consultation Type <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setConsultationType('In-Clinic Consultation');
                      if (errors.consultationType) {
                        const { consultationType: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      consultationType === 'In-Clinic Consultation'
                        ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        consultationType === 'In-Clinic Consultation'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        In-Clinic Consultation
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Sadhnapuri Clinic, Patna
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setConsultationType('Online Consultation');
                      if (errors.consultationType) {
                        const { consultationType: _, ...rest } = errors;
                        setErrors(rest);
                      }
                    }}
                    className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                      consultationType === 'Online Consultation'
                        ? 'bg-sky-50 border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        consultationType === 'Online Consultation'
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      <Video className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900">
                        Online Consultation
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        Audio / Video Tele-Consult
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Personal Details Section */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Patient Information
                </span>

                {/* Field 1: Patient Full Name */}
                <div>
                  <label htmlFor="patientFullName" className="block text-xs font-bold text-slate-700 mb-1.5">
                    1. Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="patientFullName"
                      value={patientName}
                      onChange={(e) => {
                        setPatientName(e.target.value);
                        if (errors.patientName) {
                          const { patientName: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      placeholder="e.g. Ananya Sharma"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.patientName
                          ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                      } border`}
                    />
                  </div>
                  {errors.patientName && (
                    <p className="mt-1 text-xs text-rose-600">{errors.patientName}</p>
                  )}
                </div>

                {/* Two Column: Age & Gender */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  {/* Field 2: Age */}
                  <div className="sm:col-span-4">
                    <label htmlFor="patientAge" className="block text-xs font-bold text-slate-700 mb-1.5">
                      2. Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="patientAge"
                      min="1"
                      max="120"
                      value={age}
                      onChange={(e) => {
                        setAge(e.target.value);
                        if (errors.age) {
                          const { age: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      placeholder="e.g. 28"
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.age
                          ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                      } border`}
                    />
                    {errors.age && (
                      <p className="mt-1 text-xs text-rose-600">{errors.age}</p>
                    )}
                  </div>

                  {/* Field 3: Gender (Male, Female, Other) */}
                  <div className="sm:col-span-8">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      3. Gender <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Female', 'Male', 'Other'] as BookingGender[]).map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setGender(g);
                            if (errors.gender) {
                              const { gender: _, ...rest } = errors;
                              setErrors(rest);
                            }
                          }}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all text-center ${
                            gender === g
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                    {errors.gender && (
                      <p className="mt-1 text-xs text-rose-600">{errors.gender}</p>
                    )}
                  </div>
                </div>

                {/* Two Column: Mobile Number & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 4: Mobile Number */}
                  <div>
                    <label htmlFor="patientMobile" className="block text-xs font-bold text-slate-700 mb-1.5">
                      4. Mobile Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <input
                        type="tel"
                        id="patientMobile"
                        value={mobileNumber}
                        onChange={(e) => {
                          setMobileNumber(e.target.value);
                          if (errors.mobileNumber) {
                            const { mobileNumber: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        placeholder="10-digit mobile number"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.mobileNumber
                            ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                        } border`}
                      />
                    </div>
                    {errors.mobileNumber && (
                      <p className="mt-1 text-xs text-rose-600">{errors.mobileNumber}</p>
                    )}
                  </div>

                  {/* Field 5: Email Address (Optional) */}
                  <div>
                    <label htmlFor="patientEmail" className="block text-xs font-bold text-slate-700 mb-1.5">
                      5. Email Address <span className="text-xs font-normal text-slate-400">(Optional)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        id="patientEmail"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) {
                            const { email: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        placeholder="patient@example.com"
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.email
                            ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                        } border`}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-1 text-xs text-rose-600">{errors.email}</p>
                    )}
                  </div>
                </div>

                {/* Field 6: City / Address */}
                <div>
                  <label htmlFor="patientAddress" className="block text-xs font-bold text-slate-700 mb-1.5">
                    6. City / Address <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      id="patientAddress"
                      value={address}
                      onChange={(e) => {
                        setAddress(e.target.value);
                        if (errors.address) {
                          const { address: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      placeholder="e.g. Sadhnapuri / Kankarbagh / Danapur, Patna"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.address
                          ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                      } border`}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-rose-600">{errors.address}</p>
                  )}
                </div>
              </div>

              {/* Consultation Details Section */}
              <div className="pt-2 border-t border-slate-100 space-y-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
                  Appointment Preferences
                </span>

                {/* Field 7: Reason for Consultation */}
                <div>
                  <label htmlFor="consultationReason" className="block text-xs font-bold text-slate-700 mb-1.5">
                    7. Reason for Consultation <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      id="consultationReason"
                      value={consultationReason}
                      onChange={(e) => {
                        setConsultationReason(e.target.value);
                        if (errors.consultationReason) {
                          const { consultationReason: _, ...rest } = errors;
                          setErrors(rest);
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                        errors.consultationReason
                          ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                          : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                      } border`}
                    >
                      {COMMON_REASONS.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.consultationReason && (
                    <p className="mt-1 text-xs text-rose-600">{errors.consultationReason}</p>
                  )}
                </div>

                {/* Two Column: Preferred Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Field 8: Preferred Consultation Date */}
                  <div>
                    <label htmlFor="preferredDate" className="block text-xs font-bold text-slate-700 mb-1.5">
                      8. Preferred Consultation Date <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <input
                        type="date"
                        id="preferredDate"
                        min={todayStr}
                        value={preferredDate}
                        onChange={(e) => {
                          setPreferredDate(e.target.value);
                          if (errors.preferredDate) {
                            const { preferredDate: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.preferredDate
                            ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                        } border`}
                      />
                    </div>
                    {errors.preferredDate && (
                      <p className="mt-1 text-xs text-rose-600">{errors.preferredDate}</p>
                    )}
                  </div>

                  {/* Field 9: Preferred Time */}
                  <div>
                    <label htmlFor="preferredTime" className="block text-xs font-bold text-slate-700 mb-1.5">
                      9. Preferred Time <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Clock className="w-4 h-4" />
                      </div>
                      <select
                        id="preferredTime"
                        value={preferredTime}
                        onChange={(e) => {
                          setPreferredTime(e.target.value);
                          if (errors.preferredTime) {
                            const { preferredTime: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
                          errors.preferredTime
                            ? 'border-rose-300 bg-rose-50/50 focus:ring-rose-400'
                            : 'border-slate-200 bg-slate-50/70 focus:bg-white focus:ring-teal-600'
                        } border`}
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.preferredTime && (
                      <p className="mt-1 text-xs text-rose-600">{errors.preferredTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Privacy Note required by prompt */}
              <div className="pt-2 text-center space-y-1">
                <p className="text-xs text-slate-500 italic">
                  “Your information will be used only for appointment and consultation purposes.”
                </p>
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-teal-700 font-medium">
                  <Database className="w-3 h-3 text-teal-600" />
                  <span>Directly connected with Supabase database (Project: {SUPABASE_PROJECT_ID})</span>
                </div>
              </div>

              {/* Submit Button required by prompt */}
              <div className="pt-2">
                <button
                  type="submit"
                  id="confirm-booking-submit-btn"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-teal-600 hover:bg-teal-700 active:scale-99 text-white font-bold text-base shadow-lg shadow-teal-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving to Supabase Database...</span>
                    </div>
                  ) : (
                    <>
                      <span>Confirm Consultation Booking</span>
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
