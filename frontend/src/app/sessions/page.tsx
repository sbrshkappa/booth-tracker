"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import { AdminStatus } from "@/utils/admin";
import { User } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";

interface Session {
  id: string;
  day: number;
  time: string;
  title: string;
  speaker: string;
  description?: string;
  type: 'main' | 'children';
  location?: string;
}

// Sample session data - we'll replace this with real data later
const SAMPLE_SESSIONS: Session[] = [
  // Day 1
  {
    id: '1-morning-main',
    day: 1,
    time: '9:00 AM - 11:00 AM',
    title: 'Opening Ceremony & Keynote',
    speaker: 'Dr. Jane Smith',
    description: 'Welcome to the conference and opening keynote address.',
    type: 'main',
    location: 'Main Hall'
  },
  {
    id: '1-morning-children',
    day: 1,
    time: '9:00 AM - 11:00 AM',
    title: 'Children\'s Festival Opening',
    speaker: 'Children\'s Team',
    description: 'Fun activities and games for children.',
    type: 'children',
    location: 'Children\'s Area'
  },
  {
    id: '1-afternoon',
    day: 1,
    time: '2:00 PM - 4:00 PM',
    title: 'Afternoon Workshop',
    speaker: 'Prof. John Doe',
    description: 'Interactive workshop on community building.',
    type: 'main',
    location: 'Workshop Room A'
  },
  // Day 2
  {
    id: '2-morning-main',
    day: 2,
    time: '9:00 AM - 11:00 AM',
    title: 'Morning Session',
    speaker: 'Dr. Sarah Johnson',
    description: 'Morning presentation and discussion.',
    type: 'main',
    location: 'Main Hall'
  },
  {
    id: '2-morning-children',
    day: 2,
    time: '9:00 AM - 11:00 AM',
    title: 'Children\'s Festival Day 2',
    speaker: 'Children\'s Team',
    description: 'More fun activities for children.',
    type: 'children',
    location: 'Children\'s Area'
  },
  {
    id: '2-afternoon',
    day: 2,
    time: '2:00 PM - 4:00 PM',
    title: 'Afternoon Session',
    speaker: 'Dr. Michael Brown',
    description: 'Afternoon presentation and Q&A.',
    type: 'main',
    location: 'Main Hall'
  },
  // Day 3
  {
    id: '3-morning-main',
    day: 3,
    time: '9:00 AM - 11:00 AM',
    title: 'Closing Session',
    speaker: 'Dr. Emily Wilson',
    description: 'Final session and closing remarks.',
    type: 'main',
    location: 'Main Hall'
  },
  {
    id: '3-morning-children',
    day: 3,
    time: '9:00 AM - 11:00 AM',
    title: 'Children\'s Festival Finale',
    speaker: 'Children\'s Team',
    description: 'Final day of children\'s activities.',
    type: 'children',
    location: 'Children\'s Area'
  }
];

export default function SessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeDay, setActiveDay] = useState(1);

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
    currentPage: 'sessions',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  const getSessionsForDay = (day: number) => {
    return SAMPLE_SESSIONS.filter(session => session.day === day);
  };

  const getSessionsByTimeSlot = (day: number) => {
    const sessions = getSessionsForDay(day);
    const morningSessions = sessions.filter(s => s.time.includes('9:00 AM'));
    const afternoonSessions = sessions.filter(s => s.time.includes('2:00 PM'));
    
    return { morningSessions, afternoonSessions };
  };

  const SessionCard = ({ session }: { session: Session }) => (
    <div className={`p-4 rounded-lg border-l-4 mb-3 ${
      session.type === 'main' 
        ? 'bg-white border-[#fba758] shadow-sm' 
        : 'bg-[#fe84a0]/10 border-[#fe84a0]'
    }`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{session.title}</h3>
          <p className="text-sm text-gray-600 mb-1">{session.speaker}</p>
          {session.location && (
            <p className="text-xs text-gray-500">📍 {session.location}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          session.type === 'main' 
            ? 'bg-[#fba758]/20 text-[#fba758]' 
            : 'bg-[#fe84a0]/20 text-[#fe84a0]'
        }`}>
          {session.type === 'main' ? 'Main' : 'Children'}
        </span>
      </div>
      <p className="text-sm text-gray-700">{session.description}</p>
    </div>
  );

  if (!user) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown 
        options={menuOptions} 
        userName={`${user.firstName} ${user.lastName}`}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-[#fba758] mb-4" style={{ letterSpacing: 0.5 }}>
            Conference Sessions 📅
          </h1>
          <p className="text-lg text-gray-600">
            Your complete conference schedule
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeDay === day
                  ? 'bg-white text-[#fba758] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Day {day}
            </button>
          ))}
        </div>

        {/* Day Content */}
        <div className="flex-1">
          {(() => {
            const { morningSessions, afternoonSessions } = getSessionsByTimeSlot(activeDay);
            
            return (
              <div className="space-y-6">
                {/* Morning Session */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                    <span className="mr-2">🌅</span>
                    Morning Session
                  </h2>
                  <div className="space-y-3">
                    {morningSessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </div>

                {/* Lunch Break */}
                <div className="text-center py-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-gray-700 mb-2">🍽️ Lunch Break</h3>
                    <p className="text-gray-600">11:00 AM - 2:00 PM</p>
                  </div>
                </div>

                {/* Afternoon Session (Days 1 & 2 only) */}
                {activeDay < 3 && afternoonSessions.length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🌆</span>
                      Afternoon Session
                    </h2>
                    <div className="space-y-3">
                      {afternoonSessions.map((session) => (
                        <SessionCard key={session.id} session={session} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
} 