import React, { useState, useEffect } from 'react';
import {
  X,
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
} from 'lucide-react';
import { ConsultationBooking, BookingStatus } from '../types';
import {
  getStoredBookings,
  updateBookingStatus,
  deleteBooking,
  syncWithSupabase,
  BOOKING_UPDATE_EVENT,
} from '../utils/bookingStorage';
import { downloadAppointmentPdf } from '../utils/appointmentPdf';
import { CLINIC_DATA } from '../data/clinicData';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_SETUP_SQL,
  checkSupabaseConnection,
} from '../lib/supabase';

interface AdminBookingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminBookingsModal({ isOpen, onClose }: AdminBookingsModalProps) {
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | BookingStatus>('All');
  const [selectedBooking, setSelectedBooking] = useState<ConsultationBooking | null>(null);
  const [statusMenuOpenId, setStatusMenuOpenId] = useState<string | null>(null);

  // Supabase Sync & Connection State
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    connected: boolean;
    tableExists: boolean;
    message: string;
  } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const loadData = () => {
    setBookings(getStoredBookings());
  };

  const handleSyncWithSupabase = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      const conn = await checkSupabaseConnection();
      setSupabaseStatus(conn);

      const result = await syncWithSupabase();
      if (result.success) {
        setSyncFeedback(
          `Synced with Supabase! Total appointments: ${result.totalCount} (Remote: ${result.fromSupabaseCount})`
        );
      } else {
        setSyncFeedback(`Supabase sync note: ${result.error}`);
      }
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Sync failed';
      setSyncFeedback(`Sync failed: ${msg}`);
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 6000);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
      checkSupabaseConnection().then((res) => {
        setSupabaseStatus(res);
        if (res.connected && res.tableExists) {
          handleSyncWithSupabase();
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    const handleUpdate = () => {
      loadData();
    };
    window.addEventListener(BOOKING_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKING_UPDATE_EVENT, handleUpdate);
  }, []);

  // Handle ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleStatusChange = (id: string, newStatus: BookingStatus) => {
    const updated = updateBookingStatus(id, newStatus);
    setBookings(updated);
    if (selectedBooking && selectedBooking.id === id) {
      setSelectedBooking({ ...selectedBooking, status: newStatus });
    }
    setStatusMenuOpenId(null);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(`Are you sure you want to remove appointment ${id}?`)) {
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

  // Filter Bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobileNumber.includes(searchQuery) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.consultationReason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Confirmed
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-900 border border-blue-200">
            <Check className="w-3 h-3 text-blue-700" />
            Completed
          </span>
        );
      case 'Cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 border border-rose-200">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Confirmed
          </span>
        );
    }
  };

  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;

  return (
    <div
      id="admin-bookings-modal-backdrop"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-portal-title"
    >
      <div className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600/30 border border-teal-500/40 flex items-center justify-center text-teal-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="admin-portal-title" className="text-lg font-bold text-white">
                  Doctor &amp; Reception Portal
                </h2>
                {confirmedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-teal-500 text-white text-xs font-bold">
                    {confirmedCount} Confirmed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                Dr. Amita Singh Clinic · Sadhnapuri, Patna
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSyncWithSupabase}
              disabled={isSyncing}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-700/60 hover:bg-teal-700 border border-teal-500/50 text-xs font-semibold text-teal-100 transition-colors cursor-pointer disabled:opacity-50"
              title="Sync Appointments with Supabase Database"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-300' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Database'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowSqlGuide(!showSqlGuide)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-300 transition-colors cursor-pointer"
              title="View Supabase Table Schema & SQL"
            >
              <Code2 className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden sm:inline">Supabase SQL</span>
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors hidden sm:inline-flex"
              title="Print Appointment List"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Close portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Supabase Connection Status Bar */}
        <div className="px-6 py-2.5 bg-slate-800/90 border-b border-slate-700 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 shrink-0">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-teal-400 shrink-0" />
            <span className="font-semibold text-white">Database:</span>
            <span className="font-mono text-teal-300 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-700">
              Supabase ({SUPABASE_PROJECT_ID})
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
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
              {supabaseStatus?.connected
                ? supabaseStatus.tableExists
                  ? 'Connected & Active'
                  : 'Connected (Setup Table)'
                : 'Connecting to Cloud...'}
            </span>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-2">
            <span>Table: <strong className="text-slate-200">consultation_bookings</strong></span>
            <span>·</span>
            <span>API Key: <strong className="text-teal-300 font-mono">sb_publishable_...</strong></span>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="px-6 py-2 bg-teal-50 border-b border-teal-200 text-teal-900 text-xs font-medium flex items-center justify-between animate-in fade-in">
            <span>{syncFeedback}</span>
            <button
              type="button"
              onClick={() => setSyncFeedback(null)}
              className="text-teal-700 hover:text-teal-900 font-bold ml-2"
            >
              ×
            </button>
          </div>
        )}

        {/* SQL Guide Slide-down Box */}
        {showSqlGuide && (
          <div className="p-4 sm:p-5 bg-slate-900 border-b border-slate-800 text-white animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm font-bold text-teal-300">
                <Code2 className="w-4 h-4" />
                <span>Supabase SQL Setup for Project ({SUPABASE_PROJECT_ID})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-700 hover:bg-teal-600 text-xs font-semibold text-white transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy SQL Script</span>
                    </>
                  )}
                </button>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition-colors"
                >
                  <span>Open Supabase SQL Editor</span>
                  <ExternalLink className="w-3 h-3" />
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
            <p className="text-xs text-slate-300 mb-3">
              Copy this SQL query and paste it in your Supabase SQL Editor to create the table and enable anonymous patient bookings:
            </p>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-[11px] leading-relaxed text-teal-200/90 overflow-x-auto border border-slate-800 max-h-48">
              {SUPABASE_SETUP_SQL}
            </pre>
          </div>
        )}

        {/* Toolbar: Search and Filter Tabs */}
        <div className="p-4 sm:px-6 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by patient name, mobile, booking ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {(['All', 'Confirmed', 'Completed', 'Cancelled'] as const).map(
              (filter) => {
                const count =
                  filter === 'All'
                    ? bookings.length
                    : bookings.filter((b) => b.status === filter).length;

                const isActive = statusFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-teal-700 text-white shadow-xs'
                        : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    <span>{filter}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-teal-800 text-teal-100' : 'bg-slate-100 text-slate-500'
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

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-slate-500 space-y-2">
              <Clock className="w-12 h-12 text-slate-300 mx-auto" />
              <div className="font-semibold text-base text-slate-700">No Appointments Found</div>
              <p className="text-xs text-slate-500">
                {searchQuery || statusFilter !== 'All'
                  ? 'Try clearing your search filters.'
                  : 'New patient consultation bookings will appear here instantly.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredBookings.map((booking) => (
                <div
                  key={booking.id}
                  id={`booking-card-${booking.id}`}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-teal-300 transition-all space-y-3.5"
                >
                  {/* Top Bar: ID, Date/Time, Supabase Sync Flag, Status Changer */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-bold text-sm text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-0.5 rounded-md">
                        {booking.id}
                      </span>
                      <span className="text-xs text-slate-500">
                        Requested{' '}
                        {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {booking.syncedToSupabase ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <Cloud className="w-3 h-3 text-emerald-600" />
                          <span>Supabase Cloud</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                          <Database className="w-3 h-3 text-slate-400" />
                          <span>Local Cache</span>
                        </span>
                      )}
                    </div>

                    {/* Status Changer Menu */}
                    <div className="relative">
                      <div className="flex items-center gap-2">
                        {getStatusBadge(booking.status)}
                        <button
                          type="button"
                          onClick={() =>
                            setStatusMenuOpenId(statusMenuOpenId === booking.id ? null : booking.id)
                          }
                          className="px-2 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                        >
                          <span>Change</span>
                          <ChevronDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {statusMenuOpenId === booking.id && (
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-20 animate-in fade-in zoom-in-95">
                          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Update Status To:
                          </div>
                          {(
                            [
                              'Confirmed',
                              'Completed',
                              'Cancelled',
                            ] as BookingStatus[]
                          ).map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => handleStatusChange(booking.id, s)}
                              className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 ${
                                booking.status === s
                                  ? 'font-bold text-teal-700'
                                  : 'text-slate-700'
                              }`}
                            >
                              <span>{s}</span>
                              {booking.status === s && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Patient Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Patient</span>
                      <strong className="text-slate-900 font-bold">
                        {booking.patientName}
                      </strong>{' '}
                      <span className="text-slate-500 font-normal">
                        ({booking.age} yrs · {booking.gender})
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Phone &amp; Location</span>
                      <a
                        href={`tel:${booking.mobileNumber}`}
                        className="font-bold text-teal-700 hover:underline inline-flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3 text-teal-600" />
                        +91 {booking.mobileNumber}
                      </a>
                      <div className="text-slate-500 text-xs truncate flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{booking.address}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Schedule</span>
                      <div className="font-semibold text-slate-800 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-teal-600" />
                        {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-IN', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                      <div className="text-slate-600 text-xs mt-0.5">{booking.time}</div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px] font-medium">Consultation Type</span>
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 text-xs">
                        {booking.consultationType === 'In-Clinic Consultation' ? (
                          <Building2 className="w-3.5 h-3.5 text-teal-600" />
                        ) : (
                          <Video className="w-3.5 h-3.5 text-sky-600" />
                        )}
                        {booking.consultationType}
                      </span>
                      {booking.email && (
                        <div className="text-slate-500 text-xs truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{booking.email}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Consultation Reason Box */}
                  <div className="bg-slate-50 rounded-xl p-3 text-xs border border-slate-100 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                      <span className="text-slate-500 font-normal">Reason:</span>
                      <span>{booking.consultationReason}</span>
                    </div>
                  </div>

                  {/* Card Quick Actions */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${booking.mobileNumber}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-600 text-white font-medium text-xs hover:bg-teal-700 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        <span>Call Patient</span>
                      </a>
                      {booking.email && (
                        <a
                          href={`mailto:${booking.email}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 font-medium text-xs hover:bg-slate-200 transition-colors"
                        >
                          <Mail className="w-3 h-3 text-slate-500" />
                          <span>Email</span>
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => downloadAppointmentPdf(booking)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-medium text-xs transition-colors cursor-pointer"
                        title="Download Appointment PDF"
                      >
                        <Download className="w-3 h-3 text-teal-600" />
                        <span>PDF</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDelete(booking.id)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span>
              Showing <strong>{filteredBookings.length}</strong> of {bookings.length} appointments
            </span>
            <span>·</span>
            <span className="text-teal-700 font-medium">Supabase: phjakakpqwmhbfnywyyu</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors"
          >
            Close Portal
          </button>
        </div>
      </div>
    </div>
  );
}
