"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import AppTour from "@/components/AppTour";
import { AdminStatus } from "@/utils/admin";
import { User } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';
import Logo from '@/components/Logo';
import { markTourCompleted, markFirstTimeTourSeen } from '@/utils/tour';

const SESSIONS_INFO = [
  "View the complete 3-day conference schedule with session times and details.",
  "Find sessions by day, type, or location to plan your conference experience.",
  "Discover children's festival activities running parallel to main sessions.",
  "Check session capacity and registration requirements before attending."
];

const BOOTH_TRACKING_STEPS = [
  "Visit each booth at the conference to discover amazing activities and services.",
  "Collect secret phrases from each booth to unlock your journey progress.",
  "Add personal notes and ratings to remember your experience at each booth.",
  "Complete all booths to experience the full conference impact—and qualify for prizes!"
];

const PARKING_INFO = [
  "ALL guests, including those with a TOLLTAG: Enter DFW Airport Toll Plaza through lanes marked \"TICKET ONLY\".",
  "Pull a ticket and provide to the hotel attendant for validation.",
  "DO NOT ENTER through lanes marked TollTag. Otherwise, your TollTag will be charged and you will be responsible for the daily parking rate."
];

const HowItWorksPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  
  // Tour state
  const [isTourOpen, setIsTourOpen] = useState(false);

  // Collapsible sections state
  const [expandedSections, setExpandedSections] = useState({
    sessions: true,
    boothTracker: true,
    parking: true,
    proTips: true
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Check if user is logged in
    const userObj = getUserFromStorage();
    if (!userObj) {
      router.push('/');
      return;
    }
    setUser(userObj);
    
    // Check admin status
    checkAdminStatus(userObj.email).then(setAdminStatus);
  }, [router]);

  const handleLogoutClick = () => handleLogout(router);

  const handleStartTour = () => {
    setIsTourOpen(true);
  };

  const handleTourComplete = () => {
    markTourCompleted();
    setIsTourOpen(false);
  };

  const handleTourClose = () => {
    markFirstTimeTourSeen();
    setIsTourOpen(false);
  };

  const menuOptions = createMenuOptions({
    currentPage: 'how-it-works',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-auto">
      <BackgroundImage />
      {/* Header with title and menu - Fixed at top */}
      <div className="mb-6 flex-shrink-0">
        {/* Top row: Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <Logo />
          <MenuDropdown options={menuOptions} userName={`${user.firstName} ${user.lastName}`} />
        </div>
        
        {/* Bottom row: Title and subtitle */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-orange-500 mb-2" style={{ letterSpacing: 0.5 }}>
            Help & Guide
          </h1>
          <p className="text-lg text-gray-600">
            Everything you need to know about Conference Companion
          </p>
        </div>
      </div>

      {/* Main content - Scrollable */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {/* Tour button */}
        <div className="w-full mb-6">
          <button
            onClick={handleStartTour}
            className="w-full bg-[#fba758] text-white px-6 py-4 rounded-xl font-semibold hover:bg-[#fba758]/90 transition-colors shadow-lg flex items-center justify-center gap-3"
          >
            <span className="text-xl">🎯</span>
            <span>Take Interactive Tour</span>
          </button>
          <p className="text-sm text-gray-600 text-center mt-2">
            Start from the home page and explore all features step-by-step
          </p>
        </div>

        {/* Help content */}
        <div className="space-y-4 w-full">
          {/* Sessions Section */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection('sessions')}
              className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-[#fe84a0]">
                How to Use Sessions Page
              </h2>
              <span className={`text-xl text-[#fe84a0] transition-transform duration-200 ${expandedSections.sessions ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.sessions && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {SESSIONS_INFO.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#fe84a0] text-white rounded-full flex items-center justify-center font-bold text-xs">
                        •
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {info}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Booth Tracking Section */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection('boothTracker')}
              className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-[#fba758]">
                How to Use Booth Tracker
              </h2>
              <span className={`text-xl text-[#fba758] transition-transform duration-200 ${expandedSections.boothTracker ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.boothTracker && (
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  {BOOTH_TRACKING_STEPS.map((step, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-[#fba758] text-white rounded-full flex items-center justify-center font-bold text-sm">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Parking Information */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection('parking')}
              className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-[#fdbc3f]">
                Parking Information
              </h2>
              <span className={`text-xl text-[#fdbc3f] transition-transform duration-200 ${expandedSections.parking ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.parking && (
              <div className="px-6 pb-6">
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                  <h3 className="font-semibold text-blue-800 mb-2">Complimentary Self Parking:</h3>
                </div>
                <div className="space-y-4">
                  {PARKING_INFO.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-6 h-6 bg-[#fdbc3f] text-white rounded-full flex items-center justify-center font-bold text-xs">
                        •
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {info}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Additional Tips */}
          <div className="bg-white/80 rounded-xl shadow-lg overflow-hidden">
            <button
              onClick={() => toggleSection('proTips')}
              className="w-full p-6 text-left flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <h2 className="text-2xl font-bold text-[#fdbc3f]">
                Pro Tips
              </h2>
              <span className={`text-xl text-[#fdbc3f] transition-transform duration-200 ${expandedSections.proTips ? 'rotate-180' : ''}`}>
                ▼
              </span>
            </button>
            {expandedSections.proTips && (
              <div className="px-6 pb-6">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <p className="text-gray-700">Use the hamburger menu to navigate between different sections of the app.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <p className="text-gray-700">Email your visit summary from the History page to keep a record of your experience.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <p className="text-gray-700">Rate booths and add notes to help you remember your favorite experiences.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Call to action */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center w-full">
          <p className="text-gray-600 mb-4">
            Ready to start your conference journey?
          </p>
          <button
            onClick={() => router.push('/sessions')}
            className="bg-[#fe84a0] text-white px-8 py-3 rounded-lg font-semibold hover:bg-[#fba758] transition-colors"
          >
            Go to Sessions
          </button>
        </div>
      </div>

      {/* Tour Component */}
      <AppTour
        isOpen={isTourOpen}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
        isFirstTime={false}
      />
    </div>
  );
};

export default HowItWorksPage; 