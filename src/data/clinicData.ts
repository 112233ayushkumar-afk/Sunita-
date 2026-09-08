import { ClinicInfo, ServiceItem, ReviewItem } from '../types';

export const CLINIC_DATA: ClinicInfo = {
  name: "Dr. Amita Singh | Best Gynecologist Near Me in Patna",
  doctorName: "Dr. Amita Singh",
  qualification: "MD",
  specialty: "Obstetrician & Gynecologist",
  category: "Women's Health Clinic",
  rating: 5.0,
  reviewCount: 11,
  address: {
    line1: "1st Floor, Raj Market, Road No. 6D",
    line2: "Near Bharat Gas Godown, Behind Sai Mandir",
    line3: "Sadhnapuri",
    city: "Patna",
    state: "Bihar",
    pincode: "800001",
    fullString: "1st Floor, Raj Market, Road No. 6D, near Bharat Gas Godown, behind Sai Mandir, Sadhnapuri, Patna, Bihar 800001",
  },
  phone: "06124016518",
  phoneRaw: "06124016518",
  openingTime: "9:30 AM onwards",
  mapsUrl: "https://maps.app.goo.gl/LtKme2EMA1PErneE7",
  photoUrl: "/images/dr-amita-singh-clinic.jpg",
};

export const SERVICES_LIST: ServiceItem[] = [
  {
    id: "gynecological-consultation",
    title: "Gynecological Consultation",
    shortDescription: "Personalized medical consultations for general gynecological wellness and routine evaluations.",
    details: "Thorough assessment and professional medical consultation for women's general health, addressing individual concerns with confidentiality and clinical precision.",
    suitableFor: "Routine health checkups, symptom evaluation, and preventative women's wellness.",
    iconName: "Stethoscope",
  },
  {
    id: "obstetric-care",
    title: "Obstetric Care",
    shortDescription: "Comprehensive medical support and attentive clinical monitoring for expectant mothers throughout pregnancy.",
    details: "Compassionate obstetric care designed to monitor maternal and fetal well-being, provide timely clinical guidance, and support mothers through each phase of pregnancy.",
    suitableFor: "Expectant mothers seeking dedicated obstetric guidance and prenatal health reviews.",
    iconName: "Baby",
  },
  {
    id: "high-risk-pregnancy-care",
    title: "High-Risk Pregnancy Care",
    shortDescription: "Specialized clinical attention and vigilant medical monitoring for pregnancies requiring closer oversight.",
    details: "Individualized care plans and attentive clinical monitoring for pregnancies with complex medical considerations, emphasizing continuous observation and prudent medical direction.",
    suitableFor: "Mothers requiring closer clinical observation, specialized attention, or individualized care plans.",
    iconName: "ShieldAlert",
  },
  {
    id: "womens-health-consultation",
    title: "Women's Health Consultation",
    shortDescription: "Holistic, patient-centered consultations addressing vital aspects of women's physical and reproductive wellness.",
    details: "Dedicated consultation sessions to discuss health queries, maintain long-term physical wellness, and receive trusted advice tailored to women's specific life stages.",
    suitableFor: "Women seeking medically sound answers, health guidance, and compassionate advice.",
    iconName: "HeartPulse",
  },
];

export const WHY_CHOOSE_US = [
  {
    title: "Experienced Medical Consultation",
    description: "Doctor-led clinical consultations adhering to sound medical principles and professional healthcare standards.",
    iconName: "GraduationCap",
  },
  {
    title: "Patient-Centered Care",
    description: "A welcoming, patient-first approach prioritizing open communication, dignity, and respectful listening for every woman.",
    iconName: "HeartHandshake",
  },
  {
    title: "Women's Health Focus",
    description: "A dedicated women's health clinic providing specialized obstetric and gynecological care tailored to your needs.",
    iconName: "Sparkles",
  },
  {
    title: "Convenient Patna Location",
    description: "Centrally situated at Sadhnapuri (Road No. 6D, Raj Market), easily accessible from major areas across Patna.",
    iconName: "MapPin",
  },
];

export const PATIENT_REVIEWS: ReviewItem[] = [
  {
    id: "review-1",
    rating: 5,
    text: "Very good prescription and very effective medication here.",
    verifiedSource: "Patient Review",
    note: "Verified rating on public clinic listing",
  },
];

/**
 * Calculates current open/closed status based on Indian Standard Time (UTC+5:30)
 * Opening time: 9:30 AM onwards.
 */
export function getClinicCurrentStatus(): {
  isOpen: boolean;
  statusText: string;
  subText: string;
  badgeClass: string;
} {
  try {
    // Determine current time in IST (Asia/Kolkata)
    const now = new Date();
    const istString = now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
    const istDate = new Date(istString);
    const day = istDate.getDay(); // 0 = Sunday, 1-6 = Mon-Sat
    const hours = istDate.getHours();
    const minutes = istDate.getMinutes();
    const currentMinutes = hours * 60 + minutes;

    // Opening time 9:30 AM = 570 mins
    const openMinutes = 9 * 60 + 30;
    // Typical evening closing around 8:00 PM (20:00 = 1200 mins)
    const closeMinutes = 20 * 60;

    // If Sunday or before 9:30 AM or after evening hours
    const isWorkingHours = day !== 0 && currentMinutes >= openMinutes && currentMinutes < closeMinutes;

    if (isWorkingHours) {
      return {
        isOpen: true,
        statusText: "Open Now",
        subText: "Today: 9:30 AM onwards",
        badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      };
    } else {
      const nextOpenText = day === 0 ? "Opens Monday at 9:30 AM" : currentMinutes < openMinutes ? "Opens today at 9:30 AM" : "Opens tomorrow at 9:30 AM";
      return {
        isOpen: false,
        statusText: "Closed",
        subText: nextOpenText,
        badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
      };
    }
  } catch {
    return {
      isOpen: true,
      statusText: "Open 9:30 AM onwards",
      subText: "Please call to confirm",
      badgeClass: "bg-teal-50 text-teal-700 border-teal-200",
    };
  }
}
