/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Calendar, Lock } from 'lucide-react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { AboutDoctor } from './components/AboutDoctor';
import { Services } from './components/Services';
import { HighRiskPregnancy } from './components/HighRiskPregnancy';
import { WhyChooseUs } from './components/WhyChooseUs';
import { Reviews } from './components/Reviews';
import { LocationSection } from './components/LocationSection';
import { AppointmentSection } from './components/AppointmentSection';
import { EmergencyDisclaimer } from './components/EmergencyDisclaimer';
import { Footer } from './components/Footer';
import { MobileQuickBar } from './components/MobileQuickBar';
import { BookingModal } from './components/BookingModal';
import { AdminBookingsModal } from './components/AdminBookingsModal';
import { AdminPanel } from './components/AdminPanel';
import { ConsultationType } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<'website' | 'admin'>(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#admin') {
      return 'admin';
    }
    return 'website';
  });

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingModalReason, setBookingModalReason] = useState<string | undefined>(undefined);
  const [bookingConsultationType, setBookingConsultationType] = useState<ConsultationType | undefined>(undefined);
  const [isAdminPortalOpen, setIsAdminPortalOpen] = useState(false);

  // Sync with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setCurrentView('admin');
      } else if (window.location.hash === '' || window.location.hash === '#home') {
        setCurrentView('website');
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleOpenBookingModal = (reason?: string, type?: ConsultationType) => {
    setBookingModalReason(reason);
    setBookingConsultationType(type);
    setIsBookingModalOpen(true);
  };

  const handleOpenAdminPortal = () => {
    setCurrentView('admin');
    window.location.hash = '#admin';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToWebsite = () => {
    setCurrentView('website');
    if (window.location.hash === '#admin') {
      window.location.hash = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing the Separate Admin Panel, render dedicated view
  if (currentView === 'admin') {
    return <AdminPanel onBackToWebsite={handleBackToWebsite} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 antialiased selection:bg-teal-100 selection:text-teal-900">
      {/* Sticky Header with Navigation & Call CTA */}
      <Header
        onOpenBookingModal={handleOpenBookingModal}
        onOpenAdminPortal={handleOpenAdminPortal}
      />

      <main className="flex-grow pb-16 sm:pb-0">
        {/* Hero Section */}
        <Hero onOpenBookingModal={handleOpenBookingModal} />

        {/* Meet Dr. Amita Singh Section */}
        <AboutDoctor />

        {/* Clinical Services Section */}
        <Services onOpenBookingModal={handleOpenBookingModal} />

        {/* Dedicated High-Risk Pregnancy Care Section */}
        <HighRiskPregnancy onOpenBookingModal={handleOpenBookingModal} />

        {/* Why Choose Us Section */}
        <WhyChooseUs />

        {/* Patient Rating & Review Section */}
        <Reviews />

        {/* Location & Embedded Map Section */}
        <LocationSection />

        {/* Book a Consultation / Appointment Request Section */}
        <AppointmentSection onOpenBookingModal={handleOpenBookingModal} />

        {/* Emergency Notice & Medical Disclaimer */}
        <EmergencyDisclaimer />
      </main>

      {/* Footer */}
      <Footer
        onOpenBookingModal={() => handleOpenBookingModal()}
        onOpenAdminPortal={handleOpenAdminPortal}
      />

      {/* Mobile-first Quick Action Floating Bar */}
      <MobileQuickBar onOpenBookingModal={() => handleOpenBookingModal()} />

      {/* Desktop Floating Action for Instant Consultation Booking */}
      <div className="hidden sm:flex fixed bottom-6 right-6 z-30 flex-col items-end gap-2">
        <button
          type="button"
          id="floating-book-consultation-btn"
          onClick={() => handleOpenBookingModal()}
          className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm shadow-xl shadow-teal-900/20 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-teal-500/30"
          aria-label="Book Consultation with Dr. Amita Singh"
        >
          <Calendar className="w-4 h-4 text-teal-100" />
          <span>Book Consultation</span>
        </button>
      </div>

      {/* Professional Consultation Booking Popup Modal */}
      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        initialReason={bookingModalReason}
        initialConsultationType={bookingConsultationType}
      />

      {/* Doctor & Receptionist Admin Management Modal (also available as a modal if needed) */}
      <AdminBookingsModal
        isOpen={isAdminPortalOpen}
        onClose={() => setIsAdminPortalOpen(false)}
      />
    </div>
  );
}
