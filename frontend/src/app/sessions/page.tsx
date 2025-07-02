"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import { AdminStatus } from "@/utils/admin";
import { User, Booth } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";

interface Session {
  id: number;
  day: number;
  start_time: string;
  topic: string;
  speaker: string | null;
  description: string | null;
  type: string;
  location: string | null;
  room: string | null;
  capacity: number | null;
  is_children_friendly: boolean;
  requires_registration: boolean;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
}

export default function SessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<'sessions' | 'booths'>('sessions');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [boothsLoading, setBoothsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boothsError, setBoothsError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/getSessions');
        if (!response.ok) {
          throw new Error('Failed to fetch sessions');
        }
        const data = await response.json();
        setSessions(data.sessions || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch sessions');
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const fetchBooths = async () => {
    try {
      setBoothsLoading(true);
      setBoothsError(null);
      const response = await fetch('/api/getBooths');
      if (!response.ok) {
        throw new Error('Failed to fetch booths');
      }
      const data = await response.json();
      setBooths(data.booths || []);
    } catch (err) {
      setBoothsError(err instanceof Error ? err.message : 'Failed to fetch booths');
    } finally {
      setBoothsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'booths') {
      fetchBooths();
    }
  }, [activeTab]);

  const handleLogoutClick = () => handleLogout(router);

  const menuOptions = createMenuOptions({
    currentPage: 'sessions',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  const getSessionsForDay = (day: number) => {
    return sessions.filter(session => session.day === day);
  };

  const getSessionsByTimeSlot = (day: number) => {
    const sessions = getSessionsForDay(day);
    const morningSessions = sessions.filter(s => {
      const startHour = parseInt(s.start_time.split(':')[0]);
      return startHour < 12;
    });
    const afternoonSessions = sessions.filter(s => {
      const startHour = parseInt(s.start_time.split(':')[0]);
      return startHour >= 12;
    });
    
    return { morningSessions, afternoonSessions };
  };

  const SessionCard = ({ session }: { session: Session }) => {
    const formatTime = (timeStr: string) => {
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };

    const getTypeColor = (type: string) => {
      switch (type) {
        case 'keynote':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'workshop':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'panel':
          return 'bg-green-100 text-green-800 border-green-200';
        case 'break':
        case 'lunch':
          return 'bg-gray-100 text-gray-800 border-gray-200';
        case 'performance':
          return 'bg-pink-100 text-pink-800 border-pink-200';
        default:
          return 'bg-[#fba758]/20 text-[#fba758] border-[#fba758]/30';
      }
    };

    return (
      <div className={`p-4 rounded-lg border-l-4 mb-3 ${
        session.is_children_friendly 
          ? 'bg-[#fe84a0]/10 border-[#fe84a0]' 
          : 'bg-white border-[#fba758] shadow-sm'
      }`}>
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{session.topic}</h3>
            {session.speaker && (
              <p className="text-sm text-gray-600 mb-1">{session.speaker}</p>
            )}
            <p className="text-xs text-gray-500 mb-1">
              {formatTime(session.start_time)}
            </p>
            {session.room && (
              <p className="text-xs text-gray-500">📍 {session.room}</p>
            )}
          </div>
          <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(session.type)}`}>
            {session.type.replace('_', ' ')}
          </span>
        </div>
        {session.description && (
          <p className="text-sm text-gray-700">{session.description}</p>
        )}
        {session.requires_registration && (
          <p className="text-xs text-blue-600 mt-2">⚠️ Registration required</p>
        )}
      </div>
    );
  };

  const BoothCard = ({ booth }: { booth: Booth }) => {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{booth.name}</h3>
            {booth.location && (
              <p className="text-sm text-gray-600 mb-1">📍 {booth.location}</p>
            )}
            <p className="text-xs text-gray-500">
              {booth.total_visits} visits
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-[#fba758]/20 text-[#fba758] border border-[#fba758]/30">
            Booth
          </span>
        </div>
        {booth.description && (
          <p className="text-sm text-gray-700 mb-3">{booth.description}</p>
        )}
        {booth.phrase && (
          <div className="bg-gray-50 rounded p-2">
            <p className="text-xs text-gray-600 font-medium">Secret Phrase:</p>
            <p className="text-sm font-mono text-gray-800">{booth.phrase}</p>
          </div>
        )}
      </div>
    );
  };

  if (!user) {
    return <LoadingScreen />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
        <MenuDropdown 
          options={menuOptions} 
          userName={`${user.firstName} ${user.lastName}`}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fba758] mx-auto mb-4"></div>
            <p className="text-gray-600">Loading sessions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
        <MenuDropdown 
          options={menuOptions} 
          userName={`${user.firstName} ${user.lastName}`}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#fba758] text-white rounded-lg hover:bg-[#fba758]/90"
            >
              Try Again
            </button>
          </div>
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
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-4">
          <h1 className="text-4xl font-bold text-[#fba758] mb-3" style={{ letterSpacing: 0.5 }}>
            Conference Schedule
          </h1>
          <p className="text-lg text-gray-600">
            Discover inspiring sessions, workshops, and unforgettable moments
          </p>
        </div>

        {/* Day Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
          {[1, 2, 3].map((day) => (
            <button
              key={day}
              onClick={() => {
                setActiveDay(day);
                setActiveTab('sessions');
              }}
              className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
                activeDay === day && activeTab === 'sessions'
                  ? 'bg-white text-[#fba758] shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Day {day}
            </button>
          ))}
          <button
            onClick={() => setActiveTab('booths')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors ${
              activeTab === 'booths'
                ? 'bg-white text-[#fba758] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Booths
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1">
          {activeTab === 'sessions' ? (
            (() => {
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
                      {morningSessions.length > 0 ? (
                        morningSessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No morning sessions scheduled</p>
                      )}
                    </div>
                  </div>

                  {/* Lunch Break */}
                  <div className="text-center py-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="text-lg font-medium text-gray-700 mb-2">🍽️ Lunch Break</h3>
                      <p className="text-gray-600">12:00 PM - 1:30 PM</p>
                    </div>
                  </div>

                  {/* Afternoon Session */}
                  <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <span className="mr-2">🌆</span>
                      Afternoon Session
                    </h2>
                    <div className="space-y-3">
                      {afternoonSessions.length > 0 ? (
                        afternoonSessions.map((session) => (
                          <SessionCard key={session.id} session={session} />
                        ))
                      ) : (
                        <p className="text-gray-500 text-center py-4">No afternoon sessions scheduled</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })()
          ) : (
            /* Booths Tab Content */
            <div>
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-[#fba758] mb-2">🎪 Conference Booths</h2>
                <p className="text-gray-600">
                  Explore interactive booths and track your progress through the conference experience.
                </p>
              </div>

              {boothsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fba758] mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading booths...</p>
                </div>
              ) : boothsError ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">Error: {boothsError}</p>
                  <button 
                    onClick={fetchBooths} 
                    className="px-4 py-2 bg-[#fba758] text-white rounded-lg hover:bg-[#fba758]/90"
                  >
                    Try Again
                  </button>
                </div>
              ) : booths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {booths.map((booth) => (
                    <BoothCard key={booth.id} booth={booth} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No booths available at the moment.</p>
                </div>
              )}

              <div className="text-center mt-8">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="bg-[#fba758] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#fba758]/90 transition-colors shadow-sm"
                >
                  Go to Booth Tracker
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 