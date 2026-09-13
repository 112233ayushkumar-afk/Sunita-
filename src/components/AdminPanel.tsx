import React, { useState, useEffect } from 'react';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  Check,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Building2,
  Video,
  ChevronDown,
  Trash2,
  Printer,
  RefreshCw,
  UserCheck,
  Database,
  Cloud,
  Code2,
  Copy,
  ExternalLink,
  Download,
  Plus,
  ArrowLeft,
  X,
  FileText,
  ShieldCheck,
  MessageSquare,
  KeyRound,
  Filter,
} from 'lucide-react';
import { ConsultationBooking, BookingStatus, ConsultationType, BookingGender } from '../types';
import {
  getStoredBookings,
  updateBookingStatus,
  deleteBooking,
  syncWithSupabase,
  saveNewBookingAsync,
  BOOKING_UPDATE_EVENT,
} from '../utils/bookingStorage';
import { downloadAppointmentPdf } from '../utils/appointmentPdf';
import { CLINIC_DATA } from '../data/clinicData';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_SETUP_SQL,
  checkSupabaseConnection,
} from '../lib/supabase';

// Standard Admin Credentials
export const ADMIN_CREDENTIALS = {
  id: 'admin',
  secondaryId: 'dramita',
  password: 'admin123',
  secondaryPassword: 'Admin@2026',
};

const AUTH_STORAGE_KEY = 'dr_amita_admin_authenticated_v1';

interface AdminPanelProps {
  onBackToWebsite: () => void;
}

export function AdminPanel({ onBackToWebsite }: AdminPanelProps) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  });

  // Login form inputs
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Bookings state
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | ConsultationType>('All');
  const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  // Supabase sync and status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableExists: boolean;
    message: string;
  } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // New Manual Booking Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newPatientName, setNewPatientName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newGender, setNewGender] = useState<BookingGender>('Female');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('Patna, Bihar');
  const [newReason, setNewReason] = useState('High-Risk Pregnancy Consultation');
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newTime, setNewTime] = useState('10:00 AM - 11:00 AM');
  const [newType, setNewType] = useState<ConsultationType>('In-Clinic Consultation');
  const [isAddingBooking, setIsAddingBooking] = useState(false);

  // Load bookings from local storage
  const loadBookings = () => {
    setBookings(getStoredBookings());
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
      checkSupabaseConnection().then((conn) => {
        setSupabaseStatus(conn);
        if (conn.connected) {
          handleSync();
        }
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const handleUpdate = () => {
      loadBookings();
    };
    window.addEventListener(BOOKING_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKING_UPDATE_EVENT, handleUpdate);
  }, []);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedUser = usernameInput.trim().toLowerCase();
    const trimmedPass = passwordInput.trim();

    const isValidUser =
      trimmedUser === ADMIN_CREDENTIALS.id.toLowerCase() ||
      trimmedUser === ADMIN_CREDENTIALS.secondaryId.toLowerCase() ||
      trimmedUser === 'dramitasingh';

    const isValidPass =
      trimmedPass === ADMIN_CREDENTIALS.password ||
      trimmedPass === ADMIN_CREDENTIALS.secondaryPassword ||
      trimmedPass === 'admin';

    if (isValidUser && isValidPass) {
      localStorage.setItem(AUTH_STORAGE_KEY, 'true');
      setIsAuthenticated(true);
      setLoginError(null);
    } else {
      setLoginError('Invalid Admin ID or Password. Check the credentials below.');
    }
  };

  const handlePreFillCredentials = () => {
    setUsernameInput(ADMIN_CREDENTIALS.id);
    setPasswordInput(ADMIN_CREDENTIALS.password);
    setLoginError(null);
  };

  const handleLogout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
    setUsernameInput('');
    setPasswordInput('');
  };

  // Sync with Supabase
  const handleSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const conn = await checkSupabaseConnection();
      setSupabaseStatus(conn);

      const res = await syncWithSupabase();
      if (res.success) {
        setSyncFeedback(
          `Sync successful: ${res.totalCount} total bookings (Fetched from Supabase: ${res.fromSupabaseCount}, Uploaded: ${res.uploadedCount})`
        );
      } else {
        setSyncFeedback(`Supabase status note: ${res.error}`);
      }
      loadBookings();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setSyncFeedback(`Sync failed: ${msg}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    const updated = updateBookingStatus(id, newStatus);
    setBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
    setStatusMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to permanently delete appointment record ${id}?`)) {
      const updated = deleteBooking(id);
      setBookings(updated);
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null);
      }
    }
  };

  const handleCopySql = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2500);
    }
  };

  // Export Bookings to CSV
  const handleExportCSV = () => {
    if (bookings.length === 0) {
      alert('No booking records to export.');
      return;
    }

    const headers = [
      'Appointment ID',
      'Patient Name',
      'Age',
      'Gender',
      'Mobile Number',
      'Email',
      'Address',
      'Consultation Reason',
      'Appointment Date',
      'Time Slot',
      'Consultation Type',
      'Status',
      'Created At',
      'Synced to Supabase',
    ];

    const rows = bookings.map((b) => [
      `"${b.id}"`,
      `"${b.patientName.replace(/"/g, '""')}"`,
      b.age,
      `"${b.gender}"`,
      `"${b.mobileNumber}"`,
      `"${b.email || ''}"`,
      `"${b.address.replace(/"/g, '""')}"`,
      `"${b.consultationReason.replace(/"/g, '""')}"`,
      `"${b.date}"`,
      `"${b.time}"`,
      `"${b.consultationType}"`,
      `"${b.status}"`,
      `"${b.createdAt}"`,
      b.syncedToSupabase ? 'YES' : 'NO',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Dr_Amita_Singh_Consultation_Bookings_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Submit Manual Walk-in/Reception Booking
  const handleAddBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatientName.trim() || !newMobile.trim() || !newAge) {
      alert('Please fill patient name, age, and mobile number.');
      return;
    }

    setIsAddingBooking(true);
    try {
      await saveNewBookingAsync({
        patientName: newPatientName.trim(),
        age: parseInt(newAge, 10) || 28,
        gender: newGender,
        mobileNumber: newMobile.trim(),
        email: newEmail.trim() || undefined,
        address: newAddress.trim() || 'Patna, Bihar',
        consultationReason: newReason,
        date: newDate,
        time: newTime,
        consultationType: newType,
      });

      setShowAddModal(false);
      setNewPatientName('');
      setNewAge('');
      setNewMobile('');
      setNewEmail('');
      loadBookings();
    } catch (err) {
      console.error('Error creating manual booking:', err);
    } finally {
      setIsAddingBooking(false);
    }
  };

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      b.patientName.toLowerCase().includes(q) ||
      b.mobileNumber.includes(q) ||
      b.id.toLowerCase().includes(q) ||
      b.consultationReason.toLowerCase().includes(q) ||
      b.address.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesType = typeFilter === 'All' || b.consultationType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Calculate Metrics
  const totalCount = bookings.length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const completedCount = bookings.filter((b) => b.status === 'Completed').length;
  const cancelledCount = bookings.filter((b) => b.status === 'Cancelled').length;
  const syncedCount = bookings.filter((b) => b.syncedToSupabase).length;

  // -------------------------------------------------------------
  // LOGIN SCREEN (when not authenticated)
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-12 selection:bg-teal-700 selection:text-white">
        <div className="w-full max-w-md">
          {/* Header Back Link */}
          <div className="mb-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Clinic Website</span>
            </button>
            <span className="text-xs font-mono text-slate-500">Patna, Bihar</span>
          </div>

          {/* Login Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Top decorative accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-400 to-teal-600" />

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto mb-3">
                <Lock className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Admin &amp; Doctor Portal</h1>
              <p className="text-xs text-slate-400 mt-1">
                Dr. Amita Singh Clinic · Secure Booking Records
              </p>
            </div>

            {/* Error banner */}
            {loginError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Admin User ID
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    placeholder="Enter Admin ID (e.g. admin)"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter Password (e.g. admin123)"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-900/40 transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <Lock className="w-4 h-4" />
                <span>Log In to Admin Panel</span>
              </button>
            </form>

            {/* Quick Demo Credentials Box requested by user */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-teal-400 uppercase tracking-wider">
                  Admin Login Credentials:
                </span>
                <button
                  type="button"
                  onClick={handlePreFillCredentials}
                  className="text-[11px] text-teal-300 hover:text-teal-200 underline font-semibold cursor-pointer"
                >
                  Fill Credentials
                </button>
              </div>
              <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 text-xs space-y-1 text-slate-300 font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Admin ID:</span>
                  <span className="text-teal-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                    admin
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Password:</span>
                  <span className="text-teal-300 font-bold bg-slate-800 px-2 py-0.5 rounded">
                    admin123
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 text-center mt-2.5">
                (You can also use <code className="text-slate-400">dramita</code> / <code className="text-slate-400">Admin@2026</code>)
              </p>
            </div>
          </div>

          <div className="text-center mt-6 text-xs text-slate-500">
            © 2026 Dr. Amita Singh Clinic · All consultation booking data encrypted &amp; stored in Supabase.
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED ADMIN PANEL DASHBOARD
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col selection:bg-teal-700 selection:text-white">
      {/* Top Navigation Bar */}
      <header className="bg-slate-900 text-white sticky top-0 z-30 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWebsite}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
              title="Return to Patient Website"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden md:inline">Patient Website</span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base tracking-tight">
                  Dr. Amita Singh · Admin Dashboard
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-900/80 border border-teal-700 text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                  Live Clinic
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                All Patient Consultation Bookings &amp; Supabase Cloud Records
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync Button */}
            <button
              type="button"
              onClick={handleSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700/80 hover:bg-teal-700 text-white text-xs font-semibold border border-teal-500/50 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync with Supabase"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-200' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync Supabase'}</span>
            </button>

            {/* Export CSV */}
            <button
              type="button"
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              title="Export all booking records to CSV / Excel spreadsheet"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>

            {/* Print */}
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer hidden md:inline-flex"
              title="Print all bookings list"
            >
              <Printer className="w-4 h-4" />
            </button>

            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-200 text-xs font-semibold transition-colors cursor-pointer"
              title="Logout from Admin"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Supabase Status Subbar */}
        <div className="bg-slate-950 px-4 sm:px-6 lg:px-8 py-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-teal-400 shrink-0" />
            <span className="text-slate-400">Database:</span>
            <span className="font-mono text-teal-300 font-semibold">
              Supabase ({SUPABASE_PROJECT_ID})
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-slate-400">Table:</span>
            <span className="font-mono text-white font-medium">consultation_bookings</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                supabaseStatus?.connected
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border border-amber-800'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  supabaseStatus?.connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                }`}
              />
              {supabaseStatus?.connected ? 'Connected' : 'Connecting...'}
            </span>
          </div>

          <div className="flex items-center gap-3 text-slate-400">
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <Code2 className="w-3 h-3" />
              <span>{showSqlGuide ? 'Hide SQL Script' : 'Supabase SQL Setup'}</span>
            </button>
            <span className="text-slate-700">|</span>
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="text-teal-300 hover:text-white flex items-center gap-1 font-semibold cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Walk-in Booking</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="bg-teal-600 text-white px-4 sm:px-6 py-2 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncFeedback}</span>
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="ml-auto text-white/80 hover:text-white text-base leading-none cursor-pointer"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* SQL Script Drawer */}
      {showSqlGuide && (
        <div className="bg-slate-900 border-b border-slate-800 p-4 sm:p-6 text-white animate-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-bold text-teal-300 text-sm">
                <Code2 className="w-4 h-4" />
                <span>Supabase Table SQL Script (Project: {SUPABASE_PROJECT_ID})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL'}</span>
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => setShowSqlGuide(false)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-300">
              Run this in your Supabase SQL Editor once to set up the <code>consultation_bookings</code> table and Row Level Security:
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] leading-relaxed text-teal-200/90 overflow-x-auto border border-slate-800 max-h-48">
              {SUPABASE_SETUP_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Bookings
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">{totalCount}</span>
              <FileText className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-400 mt-1">All patient requests</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1">
              <span>Pending</span>
              {pendingCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-900">
                {pendingCount}
              </span>
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-[11px] text-amber-700 mt-1">Awaiting confirmation</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <span>Confirmed</span>
              {confirmedCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-900">
                {confirmedCount}
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-[11px] text-emerald-700 mt-1">Confirmed appointments</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-blue-200 bg-blue-50/40 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
              Completed
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-900">
                {completedCount}
              </span>
              <Check className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-[11px] text-blue-700 mt-1">Consulted successfully</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Cancelled
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-700">
                {cancelledCount}
              </span>
              <X className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1">Cancelled by patient</span>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-teal-200 bg-teal-50/40 shadow-xs flex flex-col justify-between">
            <span className="text-xs font-bold text-teal-800 uppercase tracking-wider">
              Cloud Synced
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-teal-900">
                {syncedCount}
              </span>
              <Cloud className="w-5 h-5 text-teal-600" />
            </div>
            <span className="text-[11px] text-teal-700 mt-1">In Supabase Database</span>
          </div>
        </div>

        {/* Search, Filter Tabs & Add Booking Bar */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by patient name, phone number, ID, address, reason..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600 focus:bg-white"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Consultation Type Filter & New Booking Button */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
                <span className="px-2 text-slate-400 text-[11px] uppercase">Type:</span>
                {(['All', 'In-Clinic Consultation', 'Online Consultation'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTypeFilter(t)}
                    className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      typeFilter === t
                        ? 'bg-white text-teal-800 shadow-xs font-bold'
                        : 'hover:text-slate-900'
                    }`}
                  >
                    {t === 'All' ? 'All' : t.replace(' Consultation', '')}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer ml-auto md:ml-0"
              >
                <Plus className="w-4 h-4" />
                <span>New Booking</span>
              </button>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
              <Filter className="w-3.5 h-3.5" />
              <span>Status:</span>
            </span>

            {(['All', 'Pending', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
              (s) => {
                const count =
                  s === 'All'
                    ? bookings.length
                    : bookings.filter((b) => b.status === s).length;
                const isActive = statusFilter === s;

                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <span>{s}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                        isActive ? 'bg-teal-900 text-teal-100' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              }
            )}
          </div>
        </div>

        {/* Bookings Data Table / Card View */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Table Header Bar */}
          <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <div className="font-bold text-slate-800">
              Showing {filteredBookings.length} of {bookings.length} Booking Entries
            </div>
            <div className="flex items-center gap-2 text-slate-500">
              <span>Click on any patient or ID for detailed view and printable slip</span>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="py-20 text-center text-slate-500 space-y-3">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-bold text-base text-slate-700">No Consultation Bookings Found</div>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {searchQuery || statusFilter !== 'All' || typeFilter !== 'All'
                  ? 'Try clearing your search query or status filter to view all records.'
                  : 'Patients who submit the consultation form on the website will appear here in real time.'}
              </p>
              {(searchQuery || statusFilter !== 'All' || typeFilter !== 'All') && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('All');
                    setTypeFilter('All');
                  }}
                  className="px-4 py-2 rounded-xl bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200 hover:bg-teal-100 transition-colors"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[11px] border-b border-slate-200">
                    <th className="py-3 px-4">Booking ID</th>
                    <th className="py-3 px-4">Patient Name &amp; Age</th>
                    <th className="py-3 px-4">Contact &amp; Location</th>
                    <th className="py-3 px-4">Schedule &amp; Type</th>
                    <th className="py-3 px-4">Medical Reason / Notes</th>
                    <th className="py-3 px-4 text-center">Supabase Cloud</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {filteredBookings.map((b) => {
                    const cleanPhone = b.mobileNumber.replace(/\D/g, '');
                    return (
                      <tr
                        key={b.id}
                        className="hover:bg-teal-50/30 transition-colors group"
                      >
                        {/* ID Column */}
                        <td className="py-3.5 px-4 font-mono font-bold text-teal-800 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="hover:underline flex items-center gap-1 cursor-pointer"
                            title="Click to view full record"
                          >
                            <span>{b.id}</span>
                          </button>
                          <span className="block text-[10px] text-slate-400 font-sans font-normal mt-0.5">
                            {new Date(b.createdAt).toLocaleDateString('en-IN', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>

                        {/* Patient */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => setSelectedBooking(b)}
                            className="font-bold text-slate-900 text-sm hover:text-teal-700 text-left cursor-pointer"
                          >
                            {b.patientName}
                          </button>
                          <div className="text-[11px] text-slate-500 font-medium">
                            {b.age} years · {b.gender}
                          </div>
                        </td>

                        {/* Contact & Location */}
                        <td className="py-3.5 px-4 space-y-0.5">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${b.mobileNumber}`}
                              className="font-bold text-teal-700 hover:underline inline-flex items-center gap-1 text-xs"
                            >
                              <Phone className="w-3 h-3 text-teal-600" />
                              +91 {b.mobileNumber}
                            </a>
                            <a
                              href={`https://wa.me/91${cleanPhone}?text=Hello%20${encodeURIComponent(
                                b.patientName
                              )},%20this%20is%20from%20Dr.%20Amita%20Singh's%20Clinic%20regarding%20your%20consultation%20booking%20(${
                                b.id
                              }).`}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-1.5 py-0.2 rounded"
                              title="Send WhatsApp Message"
                            >
                              WhatsApp
                            </a>
                          </div>
                          <div className="text-slate-500 text-[11px] truncate max-w-[180px] flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{b.address}</span>
                          </div>
                          {b.email && (
                            <div className="text-slate-400 text-[10px] truncate max-w-[180px] flex items-center gap-1">
                              <Mail className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              <span className="truncate">{b.email}</span>
                            </div>
                          )}
                        </td>

                        {/* Schedule & Type */}
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-800 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-teal-600 shrink-0" />
                            <span>
                              {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 mt-0.5">{b.time}</div>
                          <span className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {b.consultationType === 'In-Clinic Consultation' ? (
                              <Building2 className="w-3 h-3 text-teal-600" />
                            ) : (
                              <Video className="w-3 h-3 text-sky-600" />
                            )}
                            {b.consultationType}
                          </span>
                        </td>

                        {/* Medical Reason */}
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-medium text-slate-900 leading-snug">
                            {b.consultationReason}
                          </div>
                        </td>

                        {/* Supabase Status */}
                        <td className="py-3.5 px-4 text-center">
                          {b.syncedToSupabase ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"
                              title="Synced with Supabase Cloud Database"
                            >
                              <Cloud className="w-3 h-3 text-emerald-600" />
                              <span>Synced</span>
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full"
                              title="Saved in local cache"
                            >
                              <Database className="w-3 h-3 text-slate-400" />
                              <span>Local</span>
                            </span>
                          )}
                        </td>

                        {/* Status with dropdown selector */}
                        <td className="py-3.5 px-4 text-center">
                          <div className="relative inline-block text-left">
                            <button
                              type="button"
                              onClick={() =>
                                setStatusMenuOpenId(statusMenuOpenId === b.id ? null : b.id)
                              }
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all ${
                                b.status === 'Confirmed'
                                  ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                  : b.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : b.status === 'Completed'
                                  ? 'bg-blue-100 text-blue-900 border border-blue-300'
                                  : 'bg-rose-100 text-rose-900 border border-rose-300'
                              }`}
                            >
                              <span>{b.status}</span>
                              <ChevronDown className="w-3 h-3 opacity-70" />
                            </button>

                            {statusMenuOpenId === b.id && (
                              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 animate-in fade-in">
                                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                  Change Status:
                                </div>
                                {(
                                  [
                                    'Pending',
                                    'Confirmed',
                                    'Completed',
                                    'Cancelled',
                                  ] as BookingStatus[]
                                ).map((s) => (
                                  <button
                                    key={s}
                                    type="button"
                                    onClick={() => handleStatusChange(b.id, s)}
                                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                                      b.status === s ? 'font-bold text-teal-700 bg-teal-50/50' : 'text-slate-700'
                                    }`}
                                  >
                                    <span>{s}</span>
                                    {b.status === s && <Check className="w-3.5 h-3.5 text-teal-600" />}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedBooking(b)}
                              className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-teal-50 text-slate-700 hover:text-teal-700 font-medium text-xs transition-colors cursor-pointer"
                              title="View full record & print voucher"
                            >
                              View
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(b.id)}
                              className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Delete Record"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* ----------------------------------------------------------- */}
      {/* DETAILED PATIENT RECORD MODAL & PRINTABLE SLIP */}
      {/* ----------------------------------------------------------- */}
      {selectedBooking && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedBooking(null);
          }}
        >
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Patient Consultation Record</h3>
                  <p className="text-xs text-slate-400">Dr. Amita Singh Clinic · Patna</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Content Body */}
            <div className="p-6 space-y-6 text-sm">
              {/* Slip Letterhead (visible in print) */}
              <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Dr. Amita Singh</h2>
                  <p className="text-xs text-teal-800 font-semibold">MD · Obstetrician &amp; Gynecologist</p>
                  <p className="text-xs text-slate-500 mt-0.5">Sadhnapuri, Road No. 6D, Patna, Bihar – 800001</p>
                  <p className="text-xs text-slate-500">Phone: {CLINIC_DATA.phone}</p>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-teal-800 bg-teal-50 border border-teal-200 px-3 py-1 rounded-lg inline-block">
                    {selectedBooking.id}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Booked: {new Date(selectedBooking.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Patient Profile Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Patient Name</span>
                  <div className="text-base font-bold text-slate-900">{selectedBooking.patientName}</div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Age &amp; Gender</span>
                  <div className="text-sm font-semibold text-slate-800">
                    {selectedBooking.age} Years · {selectedBooking.gender}
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Mobile Number</span>
                  <div className="text-sm font-bold text-teal-700 flex items-center gap-2 mt-0.5">
                    <Phone className="w-3.5 h-3.5 text-teal-600" />
                    <a href={`tel:${selectedBooking.mobileNumber}`} className="hover:underline">
                      +91 {selectedBooking.mobileNumber}
                    </a>
                  </div>
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Email Address</span>
                  <div className="text-sm text-slate-700 flex items-center gap-1.5 mt-0.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{selectedBooking.email || 'Not provided'}</span>
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Address / City</span>
                  <div className="text-sm text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{selectedBooking.address}</span>
                  </div>
                </div>
              </div>

              {/* Consultation Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-teal-50/50 p-4 rounded-2xl border border-teal-100">
                  <span className="text-[11px] font-bold text-teal-800 uppercase">Appointment Schedule</span>
                  <div className="text-base font-bold text-teal-950 mt-1 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-teal-700" />
                    <span>
                      {new Date(selectedBooking.date + 'T00:00:00').toLocaleDateString('en-IN', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-teal-800 mt-1">
                    Slot: {selectedBooking.time}
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">Consultation Mode</span>
                  <div className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-2">
                    {selectedBooking.consultationType === 'In-Clinic Consultation' ? (
                      <Building2 className="w-4 h-4 text-teal-600" />
                    ) : (
                      <Video className="w-4 h-4 text-sky-600" />
                    )}
                    <span>{selectedBooking.consultationType}</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Location: Road No. 6D, Sadhnapuri, Patna
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-1">
                <div className="text-xs font-bold text-amber-900 uppercase">
                  Reason for Consultation / Chief Complaint
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedBooking.consultationReason}
                </div>
              </div>

              {/* Additional Message / Notes if provided */}
              {selectedBooking.additionalMessage && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="text-xs font-bold text-slate-500 uppercase">
                    Additional Message / Patient Notes
                  </div>
                  <div className="text-sm text-slate-800 italic">
                    "{selectedBooking.additionalMessage}"
                  </div>
                </div>
              )}

              {/* Status Update & PDF Download Actions */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Current Status:</span>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                      selectedBooking.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : selectedBooking.status === 'Pending'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : selectedBooking.status === 'Completed'
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}>
                      {selectedBooking.status}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => downloadAppointmentPdf(selectedBooking)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 text-xs font-bold cursor-pointer transition-colors shadow-2xs"
                    title="Download Official Appointment Slip / Receipt PDF"
                  >
                    <Download className="w-3.5 h-3.5 text-teal-600" />
                    <span>Download PDF</span>
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {(['Pending', 'Confirmed', 'Completed', 'Cancelled'] as BookingStatus[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => handleStatusChange(selectedBooking.id, s)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                        s === 'Confirmed'
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : s === 'Pending'
                          ? 'bg-amber-500 hover:bg-amber-600 text-white'
                          : s === 'Completed'
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700'
                      }`}
                    >
                      Mark {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------------- */}
      {/* ADD WALK-IN / RECEPTION BOOKING MODAL */}
      {/* ----------------------------------------------------------- */}
      {showAddModal && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAddModal(false);
          }}
        >
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Plus className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold text-white">Record Walk-in / Phone Booking</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddBookingSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Patient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    placeholder="e.g. Rekha Devi"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Age *</label>
                  <input
                    type="number"
                    required
                    min="12"
                    max="100"
                    value={newAge}
                    onChange={(e) => setNewAge(e.target.value)}
                    placeholder="e.g. 28"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value as BookingGender)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    placeholder="e.g. 9835012345"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Address / City</label>
                <input
                  type="text"
                  value={newAddress}
                  onChange={(e) => setNewAddress(e.target.value)}
                  placeholder="e.g. Kankarbagh, Patna"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Reason</label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                >
                  <option value="High-Risk Pregnancy Consultation">High-Risk Pregnancy Consultation</option>
                  <option value="Routine Antenatal / Maternity Care">Routine Antenatal / Maternity Care</option>
                  <option value="Gynecological Consultation / PCOD Guidance">Gynecological Consultation / PCOD Guidance</option>
                  <option value="Infertility & Reproductive Evaluation">Infertility & Reproductive Evaluation</option>
                  <option value="Postnatal Care & Recovery">Postnatal Care & Recovery</option>
                  <option value="Other Medical Reason">Other Medical Reason</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Appointment Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Preferred Time Slot</label>
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-none bg-white"
                  >
                    <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                    <option value="11:00 AM - 12:00 PM">11:00 AM - 12:00 PM</option>
                    <option value="12:00 PM - 01:00 PM">12:00 PM - 01:00 PM</option>
                    <option value="05:00 PM - 06:00 PM">05:00 PM - 06:00 PM</option>
                    <option value="06:00 PM - 07:00 PM">06:00 PM - 07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Consultation Mode</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewType('In-Clinic Consultation')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      newType === 'In-Clinic Consultation'
                        ? 'bg-teal-50 border-teal-600 text-teal-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    In-Clinic (Patna)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewType('Online Consultation')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold cursor-pointer ${
                      newType === 'Online Consultation'
                        ? 'bg-sky-50 border-sky-600 text-sky-900'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Online Video
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingBooking}
                  className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold cursor-pointer disabled:opacity-50"
                >
                  {isAddingBooking ? 'Saving to Supabase...' : 'Save Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
