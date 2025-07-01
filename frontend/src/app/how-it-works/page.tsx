"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import { AdminStatus, getAdminIcon } from "@/utils/admin";
import { User } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";

const HOW_IT_WORKS = [
  "Visit each booth to discover how SSSIO-USA uplifts communities through love and selfless service.",
  "Collect secret phrases along the way to unlock your journey.",
  "Complete all booths to experience the full impact—and qualify for a raffle!"
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
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown options={menuOptions} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-4" style={{ letterSpacing: 0.5 }}>
            How It Works ❓
          </h1>
          <p className="text-lg text-gray-600">
            Your guide to the SSSIO-USA booth tracking experience
          </p>
        </div>

        {/* How it works content */}
        <div className="bg-white/80 rounded-xl p-8 shadow-lg w-full">
          <div className="space-y-6">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                  {index + 1}
                </div>
                <p className="text-gray-700 leading-relaxed">
                  {step}
                </p>
              </div>
            ))}
          </div>
          
          {/* Call to action */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <p className="text-gray-600 mb-4">
              Ready to start your journey?
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="bg-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage; 