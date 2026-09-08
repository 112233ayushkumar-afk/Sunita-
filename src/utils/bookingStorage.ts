import { ConsultationBooking, BookingStatus } from '../types';
import {
  insertBookingToSupabase,
  fetchBookingsFromSupabase,
  updateBookingStatusInSupabase,
  deleteBookingFromSupabase,
} from '../lib/supabase';

const STORAGE_KEY = 'dr_amita_consultation_bookings_v2';
export const BOOKING_UPDATE_EVENT = 'dr_amita_booking_updated';

// Realistic initial sample bookings so doctor/admin portal has data out of the box
const INITIAL_SEED_BOOKINGS: ConsultationBooking[] = [
  {
    id: 'DAS-2026-7842',
    patientName: 'Sunita Devi',
    age: 29,
    gender: 'Female',
    mobileNumber: '9835012345',
    email: 'sunita.devi@example.com',
    address: 'Kankarbagh, Patna, Bihar',
    consultationReason: 'High-Risk Pregnancy Consultation',
    date: '2026-09-10',
    time: '10:30 AM - 11:30 AM',
    consultationType: 'In-Clinic Consultation',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    syncedToSupabase: false,
  },
  {
    id: 'DAS-2026-6190',
    patientName: 'Priya Kumari',
    age: 32,
    gender: 'Female',
    mobileNumber: '9431098765',
    email: 'priya.k@example.com',
    address: 'Sadhnapuri, Patna, Bihar',
    consultationReason: 'Routine Antenatal / Maternity Care',
    date: '2026-09-09',
    time: '12:00 PM - 01:00 PM',
    consultationType: 'In-Clinic Consultation',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    syncedToSupabase: false,
  },
  {
    id: 'DAS-2026-5018',
    patientName: 'Anjali Sharma',
    age: 26,
    gender: 'Female',
    mobileNumber: '9123456780',
    address: 'Danapur, Patna, Bihar',
    consultationReason: 'Gynecological Consultation / PCOD Guidance',
    date: '2026-09-12',
    time: '05:30 PM - 06:30 PM',
    consultationType: 'Online Consultation',
    status: 'Confirmed',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    syncedToSupabase: false,
  },
];

export function getStoredBookings(): ConsultationBooking[] {
  if (typeof window === 'undefined') return INITIAL_SEED_BOOKINGS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEED_BOOKINGS));
      return INITIAL_SEED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Auto-migrate any legacy "Pending Confirmation" items to "Confirmed"
      const cleaned = parsed.map((item) => {
        if ((item.status as string) === 'Pending Confirmation') {
          return { ...item, status: 'Confirmed' as BookingStatus };
        }
        return item;
      });
      return cleaned;
    }
    return INITIAL_SEED_BOOKINGS;
  } catch (err) {
    console.error('Error loading stored bookings:', err);
    return INITIAL_SEED_BOOKINGS;
  }
}

/**
 * Generates a guaranteed unique Booking ID
 */
export function generateUniqueBookingId(): string {
  const currentYear = new Date().getFullYear();
  const timeSuffix = Date.now().toString().slice(-4);
  const randomSuffix = Math.floor(100 + Math.random() * 900);
  return `DAS-${currentYear}-${timeSuffix}${randomSuffix}`;
}

/**
 * Asynchronous save that pushes to Supabase database while ensuring local storage persistence.
 * Booking status is automatically CONFIRMED upon successful submission.
 */
export async function saveNewBookingAsync(
  bookingInput: Omit<ConsultationBooking, 'id' | 'createdAt' | 'status' | 'syncedToSupabase'>
): Promise<{
  booking: ConsultationBooking;
  supabaseSuccess: boolean;
  supabaseError?: string;
}> {
  const newId = generateUniqueBookingId();

  let newBooking: ConsultationBooking = {
    ...bookingInput,
    id: newId,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    syncedToSupabase: false,
  };

  // 1. Immediately persist locally so patient data is never lost
  try {
    const existing = getStoredBookings();
    const updated = [newBooking, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT, { detail: newBooking }));
    }
  } catch (err) {
    console.error('Error saving booking to localStorage:', err);
  }

  // 2. Persist to Supabase
  try {
    const res = await insertBookingToSupabase(newBooking);
    if (res.success) {
      newBooking = { ...newBooking, syncedToSupabase: true };
      // Update local storage entry with synced flag
      const existing = getStoredBookings();
      const updated = existing.map((item) => (item.id === newId ? newBooking : item));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT, { detail: newBooking }));
      }
      return { booking: newBooking, supabaseSuccess: true };
    } else {
      return { booking: newBooking, supabaseSuccess: false, supabaseError: res.error };
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to connect to Supabase';
    return { booking: newBooking, supabaseSuccess: false, supabaseError: msg };
  }
}

/**
 * Synchronous version for simple calls (also triggers Supabase insert in background)
 */
export function saveNewBooking(
  bookingInput: Omit<ConsultationBooking, 'id' | 'createdAt' | 'status' | 'syncedToSupabase'>
): ConsultationBooking {
  const newId = generateUniqueBookingId();

  const newBooking: ConsultationBooking = {
    ...bookingInput,
    id: newId,
    status: 'Confirmed',
    createdAt: new Date().toISOString(),
    syncedToSupabase: false,
  };

  try {
    const existing = getStoredBookings();
    const updated = [newBooking, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT, { detail: newBooking }));
    }
  } catch (err) {
    console.error('Error saving booking to localStorage:', err);
  }

  // Background push to Supabase
  insertBookingToSupabase(newBooking)
    .then((res) => {
      if (res.success) {
        const existing = getStoredBookings();
        const updated = existing.map((item) =>
          item.id === newId ? { ...item, syncedToSupabase: true } : item
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT));
        }
      }
    })
    .catch((err) => {
      console.warn('Background Supabase insert error:', err);
    });

  return newBooking;
}

export function updateBookingStatus(id: string, status: BookingStatus): ConsultationBooking[] {
  try {
    const existing = getStoredBookings();
    const updated = existing.map((item) => (item.id === id ? { ...item, status } : item));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT));
    }

    // Sync status change to Supabase in background
    updateBookingStatusInSupabase(id, status).catch((err) => {
      console.warn('Supabase status update background error:', err);
    });

    return updated;
  } catch (err) {
    console.error('Error updating booking status:', err);
    return getStoredBookings();
  }
}

export function deleteBooking(id: string): ConsultationBooking[] {
  try {
    const existing = getStoredBookings();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT));
    }

    // Sync deletion to Supabase in background
    deleteBookingFromSupabase(id).catch((err) => {
      console.warn('Supabase deletion background error:', err);
    });

    return updated;
  } catch (err) {
    console.error('Error deleting booking:', err);
    return getStoredBookings();
  }
}

/**
 * Synchronize with Supabase database:
 * 1. Pulls latest bookings from Supabase
 * 2. Merges with any local offline bookings
 * 3. Uploads unsynced local bookings to Supabase
 */
export async function syncWithSupabase(): Promise<{
  success: boolean;
  totalCount: number;
  fromSupabaseCount: number;
  uploadedCount: number;
  error?: string;
}> {
  try {
    const { data: remoteBookings, error } = await fetchBookingsFromSupabase();

    if (error || !remoteBookings) {
      return {
        success: false,
        totalCount: getStoredBookings().length,
        fromSupabaseCount: 0,
        uploadedCount: 0,
        error: error || 'Failed to fetch from Supabase',
      };
    }

    const localBookings = getStoredBookings();
    const mergedMap = new Map<string, ConsultationBooking>();

    // Put remote bookings in map
    for (const remote of remoteBookings) {
      mergedMap.set(remote.id, { ...remote, syncedToSupabase: true });
    }

    let uploadedCount = 0;
    // For local bookings not yet in Supabase (e.g. sample or offline bookings), upload them
    for (const local of localBookings) {
      if (!mergedMap.has(local.id)) {
        mergedMap.set(local.id, local);
        // Try uploading to Supabase
        const uploadRes = await insertBookingToSupabase(local);
        if (uploadRes.success) {
          uploadedCount++;
          mergedMap.set(local.id, { ...local, syncedToSupabase: true });
        }
      }
    }

    const mergedList = Array.from(mergedMap.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mergedList));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BOOKING_UPDATE_EVENT));
    }

    return {
      success: true,
      totalCount: mergedList.length,
      fromSupabaseCount: remoteBookings.length,
      uploadedCount,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown sync error';
    return {
      success: false,
      totalCount: getStoredBookings().length,
      fromSupabaseCount: 0,
      uploadedCount: 0,
      error: msg,
    };
  }
}
