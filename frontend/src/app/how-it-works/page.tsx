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

const HOW_IT_WORKS = [
  "Visit each booth to discover how SSSIO-USA uplifts communities through love and selfless service.",
  "Collect secret phrases along the way to unlock your journey.",
  "Complete all booths to experience the full impact—and qualify for a raffle!"
];

const HowItWorksPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProgress');
    router.push('/');
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
      action: () => console.log('Navigate to history page'),
    },
    {
      id: 'how-it-works',
      label: 'How it works',
      emoji: '❓',
      action: () => {}, // Already on this page
      isCurrent: true,
    },
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
      <MenuDropdown options={menuOptions} />

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-4" style={{ letterSpacing: 0.5 }}>
            How It Works? 🤔
          </h1>
          <p className="text-lg text-gray-600">
            Discover the journey of exploring SSSIO-USA booths
          </p>
        </div>

        {/* How it works content */}
        <div className="w-full bg-white/80 rounded-xl p-8 shadow-lg relative z-10">
          <div className="space-y-6 relative z-20">
            {HOW_IT_WORKS.map((item, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <p className="text-gray-800 text-lg leading-relaxed">{item}</p>
                </div>
              </div>
            ))}
          </div>
          
          {/* Decorative background - moved behind content */}
          <div 
            className="absolute left-0 bottom-0 w-full h-full pointer-events-none select-none z-0 opacity-30" 
            style={{ background: 'radial-gradient(circle at 70% 80%, #fbeee6 40%, transparent 80%)' }} 
          />
        </div>

        {/* Additional info section */}
        <div className="w-full mt-8 bg-blue-50 rounded-xl p-6">
          <h3 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <span>💡</span>
            Pro Tips
          </h3>
          <ul className="space-y-2 text-blue-700">
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Take notes at each booth to remember what you learned</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500 mt-1">•</span>
              <span>Visit booths in any order - there's no specific sequence</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksPage; 