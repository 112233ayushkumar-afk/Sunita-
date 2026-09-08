import { createClient } from '@supabase/supabase-js';
import { ConsultationBooking, BookingStatus } from '../types';

export const SUPABASE_PROJECT_ID = 'phjakakpqwmhbfnywyyu';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || `https://${SUPABASE_PROJECT_ID}.supabase.co`;
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_pTbNQOCtZdvP-MgRYTLucA_7u41-nza';

export const TABLE_NAME = 'consultation_bookings';

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export const SUPABASE_SETUP_SQL = `-- Run this in your Supabase SQL Editor to set up the database table
-- Project ID: phjakakpqwmhbfnywyyu

CREATE TABLE IF NOT EXISTS consultation_bookings (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  email TEXT,
  address TEXT NOT NULL,
  consultation_reason TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  consultation_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Confirmed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE consultation_bookings ENABLE ROW LEVEL SECURITY;

-- Allow public and anonymous users to insert new consultation requests
CREATE POLICY "Allow public consultation booking submissions"
ON consultation_bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Allow viewing consultation bookings
CREATE POLICY "Allow reading consultation bookings"
ON consultation_bookings
FOR SELECT
TO anon, authenticated
USING (true);

-- Allow clinic staff to update consultation booking status
CREATE POLICY "Allow updating consultation bookings"
ON consultation_bookings
FOR UPDATE
TO anon, authenticated
USING (true);

-- Allow deleting consultation bookings
CREATE POLICY "Allow deleting consultation bookings"
ON consultation_bookings
FOR DELETE
TO anon, authenticated
USING (true);
`;

/**
 * Format local booking model to Supabase row (snake_case columns)
 */
export function toSupabaseRow(booking: ConsultationBooking) {
  return {
    id: booking.id,
    patient_name: booking.patientName,
    age: typeof booking.age === 'string' ? parseInt(booking.age, 10) || 0 : booking.age,
    gender: booking.gender,
    mobile_number: booking.mobileNumber,
    email: booking.email || null,
    address: booking.address,
    consultation_reason: booking.consultationReason,
    date: booking.date,
    time: booking.time,
    consultation_type: booking.consultationType,
    status: booking.status,
    created_at: booking.createdAt,
  };
}

/**
 * Format Supabase row to local booking model (supports snake_case and camelCase)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromSupabaseRow(row: any): ConsultationBooking {
  return {
    id: row.id || `DAS-UNKNOWN-${Math.floor(Math.random() * 1000)}`,
    patientName: row.patient_name || row.patientName || 'Unknown Patient',
    age: row.age || 0,
    gender: row.gender || 'Female',
    mobileNumber: row.mobile_number || row.mobileNumber || '',
    email: row.email || undefined,
    address: row.address || 'Patna, Bihar',
    consultationReason: row.consultation_reason || row.consultationReason || 'General Consultation',
    date: row.date || new Date().toISOString().split('T')[0],
    time: row.time || '10:00 AM',
    consultationType: row.consultation_type || row.consultationType || 'In-Clinic Consultation',
    status: (row.status as BookingStatus) || 'Confirmed',
    createdAt: row.created_at || row.createdAt || new Date().toISOString(),
    syncedToSupabase: true,
  };
}

/**
 * Test connectivity and check if table exists in Supabase
 */
export async function checkSupabaseConnection(): Promise<{
  connected: boolean;
  tableExists: boolean;
  message: string;
}> {
  try {
    const { error } = await supabase.from(TABLE_NAME).select('id').limit(1);

    if (!error) {
      return {
        connected: true,
        tableExists: true,
        message: 'Connected to Supabase. Table "consultation_bookings" is ready.',
      };
    }

    // Check specific error codes (e.g. table does not exist)
    if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return {
        connected: true,
        tableExists: false,
        message: 'Connected to Supabase project, but "consultation_bookings" table needs to be created.',
      };
    }

    return {
      connected: true,
      tableExists: false,
      message: `Supabase response: ${error.message || error.code || 'Check permissions'}`,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      connected: false,
      tableExists: false,
      message: `Could not reach Supabase (${msg})`,
    };
  }
}

/**
 * Insert new booking into Supabase
 */
export async function insertBookingToSupabase(
  booking: ConsultationBooking
): Promise<{ success: boolean; error?: string }> {
  try {
    const row = toSupabaseRow(booking);
    const { error } = await supabase.from(TABLE_NAME).insert([row]);

    if (error) {
      console.warn('Supabase insert warning:', error.message, error.code);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    console.warn('Supabase insert exception:', msg);
    return { success: false, error: msg };
  }
}

/**
 * Fetch all bookings from Supabase
 */
export async function fetchBookingsFromSupabase(): Promise<{
  data: ConsultationBooking[] | null;
  error?: string;
}> {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return { data: null, error: error.message };
    }

    if (!data) {
      return { data: [] };
    }

    const formatted = data.map(fromSupabaseRow);
    return { data: formatted };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { data: null, error: msg };
  }
}

/**
 * Update booking status in Supabase
 */
export async function updateBookingStatusInSupabase(
  id: string,
  status: BookingStatus
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .update({ status })
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}

/**
 * Delete booking from Supabase
 */
export async function deleteBookingFromSupabase(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from(TABLE_NAME)
      .delete()
      .eq('id', id);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Network error';
    return { success: false, error: msg };
  }
}
