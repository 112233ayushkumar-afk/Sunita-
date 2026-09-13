export interface ClinicInfo {
  name: string;
  doctorName: string;
  qualification: string;
  specialty: string;
  category: string;
  rating: number;
  reviewCount: number;
  address: {
    line1: string;
    line2: string;
    line3: string;
    city: string;
    state: string;
    pincode: string;
    fullString: string;
  };
  phone: string;
  phoneRaw: string;
  openingTime: string;
  mapsUrl: string;
  photoUrl?: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  shortDescription: string;
  details: string;
  suitableFor: string;
  iconName: string;
}

export interface ReviewItem {
  id: string;
  rating: number;
  text: string;
  verifiedSource: string;
  note?: string;
}

export interface AppointmentFormData {
  patientName: string;
  phoneNumber: string;
  preferredDate: string;
  preferredTime: string;
  reasonForVisit: string;
}

export type BookingGender = 'Female' | 'Male' | 'Other';
export type ConsultationType = 'In-Clinic Consultation' | 'Online Consultation';
export type BookingStatus = 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';

export interface ConsultationBooking {
  id: string; // e.g. "DAS-2026-8492"
  patientName: string;
  age: number | string;
  gender: BookingGender;
  mobileNumber: string;
  email?: string;
  address: string; // City / Address
  consultationReason: string;
  date: string;
  time: string;
  consultationType: ConsultationType;
  additionalMessage?: string;
  status: BookingStatus;
  confirmation?: string;
  createdAt: string;
  syncedToSupabase?: boolean;
}
