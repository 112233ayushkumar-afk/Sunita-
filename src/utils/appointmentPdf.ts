import { jsPDF } from 'jspdf';
import { ConsultationBooking } from '../types';
import { CLINIC_DATA } from '../data/clinicData';

/**
 * Generates a professional, print-ready Appointment Confirmation PDF
 * containing all required patient, schedule, and clinic details.
 */
export function createAppointmentPdf(booking: ConsultationBooking): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryTeal = [13, 94, 98]; // #0d5e62
  const darkSlate = [15, 23, 42]; // #0f172a
  const textMuted = [100, 116, 139]; // #64748b
  const borderGray = [226, 232, 240]; // #e2e8f0
  const bgLight = [248, 250, 252]; // #f8fafc
  const confirmedGreen = [16, 149, 108]; // #10956c
  const confirmedGreenBg = [236, 253, 245]; // #ecfdf5

  // 1. Top Decorative Header Bar
  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.rect(0, 0, pageWidth, 6, 'F');

  let currentY = 16;

  // 2. Clinic & Doctor Letterhead
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('Dr. Amita Singh', margin, currentY);

  currentY += 6;
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('MD · Obstetrician & Gynecologist', margin, currentY);

  currentY += 5;
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text("Specialist in High-Risk Pregnancy Care & Women's Health", margin, currentY);

  // Clinic address & contact on right side of letterhead
  const rightX = pageWidth - margin;
  let clinicY = 16;
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Clinic Location:', rightX, clinicY, { align: 'right' });
  clinicY += 4.2;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('Sadhnapuri, Road No. 6D', rightX, clinicY, { align: 'right' });
  clinicY += 4;
  doc.setFont('helvetica', 'normal');
  doc.text('Patna, Bihar – 800001', rightX, clinicY, { align: 'right' });
  clinicY += 4;
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Tel: ${CLINIC_DATA.phone}`, rightX, clinicY, { align: 'right' });

  // Divider line
  currentY += 8;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, rightX, currentY);

  // 3. Document Title & Status Banner
  currentY += 7;
  const titleBoxHeight = 16;
  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, currentY, contentWidth, titleBoxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, titleBoxHeight, 2, 2, 'S');

  // Title Text
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('APPOINTMENT CONFIRMATION', margin + 6, currentY + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Official Consultation Booking Slip & Digital Receipt', margin + 6, currentY + 12);

  // Status: CONFIRMED pill on the right of title banner
  const pillWidth = 42;
  const pillHeight = 9;
  const pillX = rightX - pillWidth - 4;
  const pillY = currentY + 3.5;

  doc.setFillColor(confirmedGreenBg[0], confirmedGreenBg[1], confirmedGreenBg[2]);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 2, 2, 'F');
  doc.setDrawColor(confirmedGreen[0], confirmedGreen[1], confirmedGreen[2]);
  doc.setLineWidth(0.4);
  doc.roundedRect(pillX, pillY, pillWidth, pillHeight, 2, 2, 'S');

  doc.setTextColor(confirmedGreen[0], confirmedGreen[1], confirmedGreen[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('STATUS: CONFIRMED', pillX + pillWidth / 2, pillY + 5.8, { align: 'center' });

  // 4. Booking ID & Issue Date Banner
  currentY += titleBoxHeight + 6;

  doc.setFillColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.roundedRect(margin, currentY, contentWidth, 13, 2, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('BOOKING ID:', margin + 6, currentY + 8);

  doc.setFontSize(11);
  doc.text(booking.id, margin + 34, currentY + 8.2);

  const formattedBookingDate = new Date(booking.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text(`Issued On: ${formattedBookingDate}`, rightX - 6, currentY + 8, { align: 'right' });

  // 5. Section: Patient Details Box
  currentY += 19;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('1. PATIENT INFORMATION', margin, currentY);

  currentY += 3;
  const patientBoxY = currentY;
  const patientBoxHeight = 36;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, patientBoxY, contentWidth, patientBoxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, patientBoxY, contentWidth, patientBoxHeight, 2, 2, 'S');

  // Row 1: Patient Name & Age / Gender
  let rowY = patientBoxY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('PATIENT NAME', margin + 6, rowY);
  doc.text('AGE & GENDER', margin + 95, rowY);

  rowY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(booking.patientName, margin + 6, rowY);
  doc.text(`${booking.age} Years  ·  ${booking.gender}`, margin + 95, rowY);

  // Row 2: Mobile Number & City/Address
  rowY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('REGISTERED MOBILE', margin + 6, rowY);
  doc.text('ADDRESS / CITY', margin + 95, rowY);

  rowY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text(`+91 ${booking.mobileNumber}`, margin + 6, rowY);

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(booking.address || 'Patna, Bihar', margin + 95, rowY);

  // 6. Section: Consultation Schedule Box
  currentY = patientBoxY + patientBoxHeight + 8;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('2. CONSULTATION SCHEDULE & DETAILS', margin, currentY);

  currentY += 3;
  const scheduleBoxY = currentY;
  const scheduleBoxHeight = 44;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, scheduleBoxY, contentWidth, scheduleBoxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, scheduleBoxY, contentWidth, scheduleBoxHeight, 2, 2, 'S');

  // Format Appointment Date nicely
  let appointmentDateFormatted = booking.date;
  try {
    const d = new Date(booking.date + 'T00:00:00');
    appointmentDateFormatted = d.toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    // keep original string
  }

  // Row 1: Date & Time Slot
  let schedRowY = scheduleBoxY + 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CONSULTATION DATE', margin + 6, schedRowY);
  doc.text('PREFERRED TIME SLOT', margin + 95, schedRowY);

  schedRowY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text(appointmentDateFormatted, margin + 6, schedRowY);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(booking.time, margin + 95, schedRowY);

  // Row 2: Consultation Type & Booking Status
  schedRowY += 9;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CONSULTATION TYPE', margin + 6, schedRowY);
  doc.text('BOOKING STATUS', margin + 95, schedRowY);

  schedRowY += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(booking.consultationType, margin + 6, schedRowY);

  doc.setTextColor(confirmedGreen[0], confirmedGreen[1], confirmedGreen[2]);
  doc.text('CONFIRMED', margin + 95, schedRowY);

  // Row 3: Consultation Reason / Specialty
  schedRowY += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('CONSULTATION REASON:', margin + 6, schedRowY);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text(booking.consultationReason, margin + 48, schedRowY);

  // 7. Section: Important Instructions for Patient
  currentY = scheduleBoxY + scheduleBoxHeight + 8;
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.text('3. INSTRUCTIONS FOR PATIENT VISIT', margin, currentY);

  currentY += 3;
  const instructBoxY = currentY;
  const instructBoxHeight = 38;

  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin, instructBoxY, contentWidth, instructBoxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, instructBoxY, contentWidth, instructBoxHeight, 2, 2, 'S');

  const instructions = [
    '• Please report to the clinic reception 10 to 15 minutes prior to your allocated time slot.',
    '• Carry all previous medical records, prenatal ultrasound scans, and ongoing prescription slips.',
    '• For online video consultations, clinic coordinator will contact you via WhatsApp / phone with the video link.',
    '• For appointment rescheduling or directions to the clinic, contact reception desk at +91 06124016518.',
  ];

  let instY = instructBoxY + 7;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);

  instructions.forEach((inst) => {
    doc.text(inst, margin + 5, instY);
    instY += 6.5;
  });

  // 8. Clinic Seal / Authorization Box
  currentY = instructBoxY + instructBoxHeight + 8;
  const authBoxHeight = 22;

  doc.setFillColor(bgLight[0], bgLight[1], bgLight[2]);
  doc.roundedRect(margin, currentY, contentWidth, authBoxHeight, 2, 2, 'F');
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(margin, currentY, contentWidth, authBoxHeight, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
  doc.text('CLINIC VERIFICATION & AUTHORIZATION', margin + 6, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.8);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'This document serves as your verified appointment confirmation slip from Dr. Amita Singh Clinic.',
    margin + 6,
    currentY + 11
  );
  doc.text(
    'Please present this digital confirmation or a printed copy at the clinic reception counter.',
    margin + 6,
    currentY + 15
  );

  // Digital Signature seal representation on the right
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('Dr. Amita Singh, MD', rightX - 6, currentY + 11, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text('Authorized Clinic Signatory', rightX - 6, currentY + 16, { align: 'right' });

  // 9. Footer
  const footerY = 286;
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.line(margin, footerY - 3, rightX, footerY - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(textMuted[0], textMuted[1], textMuted[2]);
  doc.text(
    'Dr. Amita Singh Clinic · Sadhnapuri, Road No. 6D, Patna, Bihar – 800001 · Emergency: Call 06124016518',
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  return doc;
}

/**
 * Triggers an immediate client-side download of the appointment confirmation PDF
 */
export function downloadAppointmentPdf(booking: ConsultationBooking): void {
  try {
    const doc = createAppointmentPdf(booking);
    const sanitizedName = booking.patientName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `Appointment_Confirmation_${booking.id}_${sanitizedName}.pdf`;
    doc.save(filename);
  } catch (err) {
    console.error('Error downloading appointment PDF:', err);
    // Fallback printable window if blob save fails
    window.print();
  }
}
