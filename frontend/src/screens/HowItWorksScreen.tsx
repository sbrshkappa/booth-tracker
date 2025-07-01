"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
}

interface AdminStatus {
  isAdmin: boolean;
  adminLevel: string | null;
  userId: number;
}

const HowItWorksScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    // Check admin status
    checkAdminStatus(userObj.email);
  }, [router]);

  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch('/api/checkAdminStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAdminStatus(data);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProgress');
    router.push('/');
  };

  const getAdminIcon = (level: string) => {
    switch (level) {
      case 'super_admin': return '👑';
      case 'conference_admin': return '🛡️';
      case 'booth_admin': return '⭐';
      default: return '👤';
    }
  };

  const menuOptions = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      emoji: '🏠',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'history',
      label: 'History',
      emoji: '📚',
      action: () => router.push('/history'),
    },
    {
      id: 'how-it-works',
      label: 'How it works',
      emoji: '❓',
      action: () => {}, // Already on this page
      isCurrent: true,
    },
    ...(adminStatus?.isAdmin ? [{
      id: 'admin',
      label: 'Admin Panel',
      emoji: getAdminIcon(adminStatus.adminLevel || ''),
      action: () => router.push('/admin'),
      isAdmin: true,
    }] : []),
    {
      id: 'logout',
      label: 'Logout',
      emoji: '🚪',
      action: handleLogout,
      isDanger: true,
    },
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown 
        options={menuOptions} 
        userName={`${user.firstName} ${user.lastName}`}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-4" style={{ letterSpacing: 0.5 }}>
            How It Works ❓
          </h1>
          <p className="text-lg text-gray-600">
            Your guide to the SSSIO-USA booth tracking system
          </p>
        </div>

        {/* How It Works Content */}
        <div className="flex-1 bg-white/80 rounded-xl p-6 shadow-lg">
          <div className="space-y-8">
            {/* Step 1 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                1
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Visit Booths 🏃‍♂️
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Go to each booth at the SSSIO-USA conference. When you arrive, ask the booth representative for their unique phrase.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                2
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Enter the Phrase 📝
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Type the phrase exactly as given to you in the input field on your dashboard. Make sure to spell it correctly!
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                3
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Add Notes & Rate ⭐
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Optionally add personal notes about your experience and rate the booth from 1 to 5 stars. This helps you remember your visit!
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                4
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Track Your Progress 📊
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Watch your progress bar fill up as you visit more booths. View your complete visit history and manage your notes anytime.
                </p>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0 w-12 h-12 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-lg">
                5
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Complete & Celebrate! 🎉
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Once you've visited all booths, you'll see a special completion message. Your data will be automatically recorded for the conference organizers.
                </p>
              </div>
            </div>

            {/* Tips Section */}
            <div className="mt-12 p-6 bg-blue-50 rounded-xl border border-blue-200">
              <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center">
                💡 Pro Tips
              </h3>
              <ul className="space-y-3 text-blue-700">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Take notes while you're at each booth to remember key details later</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Rate booths based on your overall experience and the information provided</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>You can edit your notes and ratings anytime from the History section</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Make sure you have a stable internet connection when submitting booth visits</span>
                </li>
              </ul>
            </div>

            {/* Navigation */}
            <div className="mt-8 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="px-8 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksScreen; 