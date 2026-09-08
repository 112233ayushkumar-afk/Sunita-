import React, { useState, useEffect } from 'react';
import {
  Phone,
  Calendar,
  Clock,
  User,
  Mail,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Building2,
  Video,
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Database,
} from 'lucide-react';
import { CLINIC_DATA } from '../data/clinicData';
import { BookingGender, ConsultationType, ConsultationBooking } from '../types';
import { saveNewBookingAsync } from '../utils/bookingStorage';
import { SUPABASE_PROJECT_ID } from '../lib/supabase';
import { downloadAppointmentPdf } from '../utils/appointmentPdf';
import { AppointmentConfirmationView } from './AppointmentConfirmationView';

interface AppointmentSectionProps {
  onOpenBookingModal?: (reason?: string) => void;
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

export function AppointmentSection({ onOpenBookingModal }: AppointmentSectionProps) {
  // Form State
  const [patientName, setPatientName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<BookingGender>('Female');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('Patna, Bihar');
  const [consultationReason, setConsultationReason] = useState(COMMON_REASONS[0]);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState(TIME_SLOTS[0]);
  const [consultationType, setConsultationType] = useState<ConsultationType>(
    'In-Clinic Consultation'
  );

  // UI State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBooking, setSubmittedBooking] = useState<ConsultationBooking | null>(null);
  const [supabaseSynced, setSupabaseSynced] = useState<boolean | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Set default preferred date to tomorrow if empty
  useEffect(() => {
    if (!preferredDate) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setPreferredDate(tomorrow.toISOString().split('T')[0]);
    }
  }, [preferredDate]);

  const todayStr = new Date().toISOString().split('T')[0];

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
      const el = document.getElementById('contact');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
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
        console.warn('Auto PDF download notice:', pdfErr);
      }
    } catch (err) {
      console.error('Error in on-page booking submission:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
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
    <section id="contact" className="py-16 md:py-24 bg-slate-50 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-teal-700 bg-teal-100/60 px-3.5 py-1.5 rounded-full border border-teal-200 inline-block mb-3">
            In-Clinic &amp; Online Scheduling
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Book Consultation
          </h2>
          <p className="mt-2 text-base sm:text-lg text-slate-600">
            Schedule an appointment with Dr. Amita Singh (MD · Obstetrician &amp; Gynecologist) in Sadhnapuri, Patna.
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Direct Call & Clinic Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-3xl bg-teal-800 text-white p-7 sm:p-8 shadow-md relative overflow-hidden">
              <div className="w-12 h-12 rounded-2xl bg-teal-700/80 flex items-center justify-center text-teal-200 mb-5">
                <Phone className="w-6 h-6" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                Need Immediate Assistance?
              </h3>
              <p className="text-sm text-teal-100/90 leading-relaxed mb-6">
                You can reach the clinic reception directly by phone for instant assistance, emergency queries, or visiting directions.
              </p>

              {/* Direct Phone Call Button */}
              <a
                href={`tel:${CLINIC_DATA.phoneRaw}`}
                id="contact-call-now-btn"
                className="w-full flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-white text-teal-900 font-bold text-base shadow hover:bg-teal-50 transition-all active:scale-98"
              >
                <Phone className="w-4 h-4 text-teal-700" />
                <span>Call {CLINIC_DATA.phone}</span>
              </a>

              <div className="mt-6 pt-5 border-t border-teal-700/60 text-xs text-teal-200 space-y-2">
                <div className="flex justify-between">
                  <span>Clinic Timings:</span>
                  <span className="font-semibold text-white">{CLINIC_DATA.openingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Doctor:</span>
                  <span className="font-semibold text-white">Dr. Amita Singh, MD</span>
                </div>
                <div className="flex justify-between">
                  <span>Location:</span>
                  <span className="font-semibold text-white">Sadhnapuri, Patna</span>
                </div>
                <div className="flex justify-between">
                  <span>Specialization:</span>
                  <span className="font-semibold text-teal-300">High-Risk Pregnancy</span>
                </div>
              </div>
            </div>

            {/* Note on Appointment Process */}
            <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-xs text-slate-600 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <ShieldCheck className="w-4 h-4 text-teal-600" />
                <span>How Our Booking Flow Works</span>
              </div>
              <p className="leading-relaxed">
                After you submit your consultation details, our team receives your request in our clinical database and calls you on your mobile number to confirm your preferred slot.
              </p>
              {onOpenBookingModal && (
                <button
                  type="button"
                  onClick={() => onOpenBookingModal()}
                  className="mt-2 text-teal-700 hover:text-teal-900 font-semibold inline-flex items-center gap-1"
                >
                  <span>Open quick booking popup</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Complete 11-Field Booking Form & Confirmation */}
          <div className="lg:col-span-7">
            <div className="rounded-3xl bg-white border border-slate-200/80 p-6 sm:p-8 shadow-sm">
              
              {submittedBooking ? (
                <AppointmentConfirmationView
                  booking={submittedBooking}
                  supabaseSynced={supabaseSynced}
                  onResetForAnother={handleReset}
                />
              ) : (
                /* ============================================================
                   COMPLETE 11-FIELD FORM
                   ============================================================ */
                <form onSubmit={handleSubmit} id="appointment-booking-form" noValidate className="space-y-4">
                  
                  <div className="border-b border-slate-100 pb-3">
                    <h3 className="text-lg font-bold text-slate-900">
                      Patient Consultation Details
                    </h3>
                    <p className="text-xs text-slate-500">
                      Please enter the patient information to request an in-clinic or online appointment.
                    </p>
                  </div>

                  {/* Error Notification Banner */}
                  {Object.keys(errors).length > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <div className="font-bold">Please complete all required fields (*):</div>
                        <div className="mt-1 text-rose-700">
                          {Object.values(errors)[0]}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Field 10: Consultation Type */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      10. Consultation Type <span className="text-rose-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setConsultationType('In-Clinic Consultation');
                          if (errors.consultationType) {
                            const { consultationType: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          consultationType === 'In-Clinic Consultation'
                            ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Building2 className={`w-4 h-4 ${consultationType === 'In-Clinic Consultation' ? 'text-teal-700' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">In-Clinic</div>
                          <div className="text-[10px] text-slate-500">Sadhnapuri Clinic</div>
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
                        className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                          consultationType === 'Online Consultation'
                            ? 'bg-sky-50 border-sky-500 ring-1 ring-sky-500'
                            : 'bg-white border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <Video className={`w-4 h-4 ${consultationType === 'Online Consultation' ? 'text-sky-700' : 'text-slate-400'}`} />
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-900">Online</div>
                          <div className="text-[10px] text-slate-500">Audio / Video</div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Field 1: Patient Full Name */}
                  <div>
                    <label htmlFor="onpage-patientName" className="block text-xs font-bold text-slate-700 mb-1.5">
                      1. Patient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <User className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="onpage-patientName"
                        value={patientName}
                        onChange={(e) => {
                          setPatientName(e.target.value);
                          if (errors.patientName) {
                            const { patientName: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        placeholder="Enter full name"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border ${
                          errors.patientName ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                        } focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.patientName && <p className="mt-1 text-xs text-rose-600">{errors.patientName}</p>}
                  </div>

                  {/* Field 2 & 3: Age & Gender */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                    <div className="sm:col-span-4">
                      <label htmlFor="onpage-age" className="block text-xs font-bold text-slate-700 mb-1.5">
                        2. Age <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        id="onpage-age"
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
                        placeholder="Age"
                        className={`w-full px-3 py-2.5 rounded-xl text-sm border ${
                          errors.age ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                        } focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all`}
                      />
                      {errors.age && <p className="mt-1 text-xs text-rose-600">{errors.age}</p>}
                    </div>

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
                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                              gender === g
                                ? 'bg-teal-600 text-white border-teal-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {g}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Field 4 & 5: Mobile & Email */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="onpage-mobile" className="block text-xs font-bold text-slate-700 mb-1.5">
                        4. Mobile Number <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Phone className="w-4 h-4" />
                        </div>
                        <input
                          type="tel"
                          id="onpage-mobile"
                          value={mobileNumber}
                          onChange={(e) => {
                            setMobileNumber(e.target.value);
                            if (errors.mobileNumber) {
                              const { mobileNumber: _, ...rest } = errors;
                              setErrors(rest);
                            }
                          }}
                          placeholder="10-digit mobile"
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border ${
                            errors.mobileNumber ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                          } focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all`}
                        />
                      </div>
                      {errors.mobileNumber && <p className="mt-1 text-xs text-rose-600">{errors.mobileNumber}</p>}
                    </div>

                    <div>
                      <label htmlFor="onpage-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                        5. Email Address <span className="text-xs font-normal text-slate-400">(Optional)</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          id="onpage-email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="patient@example.com"
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Field 6: City / Address */}
                  <div>
                    <label htmlFor="onpage-address" className="block text-xs font-bold text-slate-700 mb-1.5">
                      6. City / Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        id="onpage-address"
                        value={address}
                        onChange={(e) => {
                          setAddress(e.target.value);
                          if (errors.address) {
                            const { address: _, ...rest } = errors;
                            setErrors(rest);
                          }
                        }}
                        placeholder="e.g. Sadhnapuri / Kankarbagh, Patna"
                        className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border ${
                          errors.address ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                        } focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all`}
                      />
                    </div>
                    {errors.address && <p className="mt-1 text-xs text-rose-600">{errors.address}</p>}
                  </div>

                  {/* Field 7: Reason for Consultation */}
                  <div>
                    <label htmlFor="onpage-reason" className="block text-xs font-bold text-slate-700 mb-1.5">
                      7. Reason for Consultation <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="onpage-reason"
                      value={consultationReason}
                      onChange={(e) => setConsultationReason(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
                    >
                      {COMMON_REASONS.map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Field 8 & 9: Preferred Date & Time */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="onpage-date" className="block text-xs font-bold text-slate-700 mb-1.5">
                        8. Preferred Date <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <input
                          type="date"
                          id="onpage-date"
                          min={todayStr}
                          value={preferredDate}
                          onChange={(e) => {
                            setPreferredDate(e.target.value);
                            if (errors.preferredDate) {
                              const { preferredDate: _, ...rest } = errors;
                              setErrors(rest);
                            }
                          }}
                          className={`w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border ${
                            errors.preferredDate ? 'border-rose-300 bg-rose-50/50' : 'border-slate-200 bg-slate-50'
                          } focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all`}
                        />
                      </div>
                      {errors.preferredDate && <p className="mt-1 text-xs text-rose-600">{errors.preferredDate}</p>}
                    </div>

                    <div>
                      <label htmlFor="onpage-time" className="block text-xs font-bold text-slate-700 mb-1.5">
                        9. Preferred Time <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Clock className="w-4 h-4" />
                        </div>
                        <select
                          id="onpage-time"
                          value={preferredTime}
                          onChange={(e) => setPreferredTime(e.target.value)}
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white transition-all"
                        >
                          {TIME_SLOTS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Privacy note required by prompt */}
                  <div className="pt-1 text-center space-y-1">
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
                      id="onpage-confirm-booking-btn"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-99 text-white font-bold text-sm sm:text-base shadow-md shadow-teal-600/25 transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer disabled:opacity-75"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>Saving to Supabase Database...</span>
                        </div>
                      ) : (
                        <>
                          <span>Confirm Consultation Booking</span>
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>

                </form>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
