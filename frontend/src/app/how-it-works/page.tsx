"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MenuDropdown from "@/components/MenuDropdown";
import { AdminStatus } from "@/utils/admin";
import { User } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';

const BOOTH_TRACKING_STEPS = [
  "Visit each booth at the conference to discover amazing activities and services.",
  "Collect secret phrases from each booth to unlock your journey progress.",
  "Add personal notes and ratings to remember your experience at each booth.",
  "Complete all booths to experience the full conference impact—and qualify for prizes!"
];

const SESSIONS_INFO = [
  "View the complete 3-day conference schedule with session times and details.",
  "Find sessions by day, type, or location to plan your conference experience.",
  "Discover children's festival activities running parallel to main sessions.",
  "Check session capacity and registration requirements before attending."
];

const HowItWorksPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);

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
    <div className="h-screen bg-white flex flex-col px-4 py-6 relative overflow-hidden">
      <BackgroundImage />
      {/* Header with title and menu */}
      <div className="mb-6">
        {/* Top row: Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <Image 
            src="/assets/conference-companion.png" 
            alt="Conference Companion" 
            width={48}
            height={48}
            className="h-12 w-auto"
          />
          <MenuDropdown options={menuOptions} />
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

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        {/* Help content */}
        <div className="space-y-8 w-full">
          {/* Booth Tracking Section */}
          <div className="bg-white/80 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#fba758] mb-6">
              How to Track Your Booth Visits
            </h2>
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

          {/* Sessions Section */}
          <div className="bg-white/80 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#fe84a0] mb-6">
              About Conference Sessions
            </h2>
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

          {/* Additional Tips */}
          <div className="bg-white/80 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-[#fdbc3f] mb-6">
              Pro Tips
            </h2>
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
    </div>
  );
};

export default HowItWorksPage; 