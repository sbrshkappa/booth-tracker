"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import SessionCard from "@/components/SessionCard";
import SessionModal from "@/components/SessionModal";
import BoothCard from "@/components/BoothCard";
import { AdminStatus } from "@/utils/admin";
import { User, Booth, Session } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';
import { 
  getCurrentSession, 
  getCurrentDay, 
  isSessionPast, 
  isSessionCurrent,
  isDayCurrent,
  isDayPast
} from "@/utils/conference";

export default function SessionsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [loading, setLoading] = useState(true);
  const [boothsLoading, setBoothsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [boothsError, setBoothsError] = useState<string | null>(null);
  const [activeDay, setActiveDay] = useState(1);
  const [activeTab, setActiveTab] = useState<'sessions' | 'booths'>('sessions');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [hasManuallyNavigated, setHasManuallyNavigated] = useState(false);

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

  // Update current time every minute and auto-detect current day/session
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Auto-detect current day
      const detectedDay = getCurrentDay(now);
      
      // Only auto-switch if user hasn't manually navigated or if we're on the current day
      if (!hasManuallyNavigated && detectedDay !== activeDay) {
        setActiveDay(detectedDay);
        setActiveTab('sessions');
      }
      
      // Auto-detect current session
      const current = getCurrentSession(sessions, now);
      setCurrentSession(current || null);
    };

    // Update immediately
    updateTime();
    
    // Update every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [sessions, activeDay, hasManuallyNavigated]);

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

  const getChronologicalSessionsWithBreaks = (day: number) => {
    const daySessions = getSessionsForDay(day);
    
    // Sort sessions by start time
    const sortedSessions = daySessions.sort((a, b) => {
      return a.start_time.localeCompare(b.start_time);
    });

    // Only return sessions from the data, no automatic breaks
    return sortedSessions.map(session => ({
      type: 'session' as const,
      data: session
    }));
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const openSessionModal = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  // Auto-scroll to current session when it changes
  useEffect(() => {
    if (currentSession && activeTab === 'sessions' && activeDay === currentSession.day) {
      // Find the session element and scroll to it
      const sessionElement = document.querySelector(`[data-session-id="${currentSession.id}"]`);
      if (sessionElement) {
        sessionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    }
  }, [currentSession, activeTab, activeDay]);

  const handleDayClick = (day: number) => {
    setActiveDay(day);
    setActiveTab('sessions');
    
    // If user clicks on the current day, reset manual navigation flag
    const currentDay = getCurrentDay(currentTime);
    if (day === currentDay) {
      setHasManuallyNavigated(false);
    } else {
      setHasManuallyNavigated(true);
    }
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
    <div className="h-screen bg-white flex flex-col px-4 py-6 relative overflow-hidden">
      <BackgroundImage />
      {/* Header with title and menu */}
      <div className="mb-6">
        {/* Top row: Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <img 
            src="/assets/conference-companion.png" 
            alt="Conference Companion" 
            className="h-12 w-auto"
          />
          <MenuDropdown 
            options={menuOptions} 
            userName={`${user.firstName} ${user.lastName}`}
          />
        </div>
        
        {/* Bottom row: Title and subtitle */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-[#fba758] mb-2" style={{ letterSpacing: 0.5 }}>
            Schedule
          </h1>
          <p className="text-xs text-gray-500 mb-2">
            Discover inspiring sessions, workshops, and unforgettable moments
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl mx-auto flex-1 min-h-0">
        {/* Day Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 flex-shrink-0 relative">
          {/* Animated sliding indicator */}
          <div 
            className={`absolute top-1 bottom-1 bg-white rounded-md shadow-sm transition-all duration-300 ease-in-out ${
              activeTab === 'booths' 
                ? 'left-[75%] right-1' 
                : activeDay === 1 
                  ? 'left-1 w-[calc(25%-0.25rem)]' 
                  : activeDay === 2 
                    ? 'left-[calc(25%+0.25rem)] w-[calc(25%-0.25rem)]' 
                    : 'left-[calc(50%+0.5rem)] w-[calc(25%-0.25rem)]'
            }`}
          ></div>
          
          {[1, 2, 3].map((day) => {
            const isCurrentDay = isDayCurrent(day, currentTime);
            const isPastDay = isDayPast(day, currentTime);
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ease-in-out relative z-10 ${
                  activeDay === day && activeTab === 'sessions'
                    ? 'text-[#fba758] font-semibold'
                    : isCurrentDay
                      ? 'text-[#f97316] font-medium'
                      : isPastDay
                        ? 'text-gray-400'
                        : 'text-gray-600 hover:text-gray-800 hover:scale-105'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  Day {day}
                  {isCurrentDay && (
                    <span className="w-2 h-2 bg-[#f97316] rounded-full animate-pulse"></span>
                  )}
                </div>
              </button>
            );
          })}
          <button
            onClick={() => setActiveTab('booths')}
            className={`flex-1 py-3 px-4 rounded-md font-medium transition-all duration-300 ease-in-out relative z-10 ${
              activeTab === 'booths'
                ? 'text-[#fba758] font-semibold'
                : 'text-gray-600 hover:text-gray-800 hover:scale-105'
            }`}
          >
            Exhibition
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'sessions' ? (
            (() => {
              const timelineItems = getChronologicalSessionsWithBreaks(activeDay);
              
              return (
                <div className="h-full overflow-y-auto pr-2">
                  <div className="space-y-6">
                    {timelineItems.length > 0 ? (
                      timelineItems.map((item, index) => (
                        <div key={index}>
                          {(item.data as Session).type === 'lunch' || (item.data as Session).type === 'break' ? (
                            <div className="text-center py-6">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-700 mb-2">
                                  {(item.data as Session).type === 'lunch' ? '🍽️ Lunch Break' : '☕ Break'}
                                </h3>
                                <p className="text-gray-600">
                                  {formatTime((item.data as Session).start_time)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            <SessionCard 
                              session={item.data as Session} 
                              onClick={openSessionModal}
                              isCurrent={isSessionCurrent(item.data as Session, currentTime)}
                              isPast={isSessionPast(item.data as Session, currentTime)}
                            />
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-500">No sessions scheduled for this day.</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()
          ) : (
            /* Booths Tab Content */
            <div className="h-full overflow-y-auto">
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

      {/* Session Modal */}
      {selectedSession && (
        <SessionModal
          session={selectedSession}
          isOpen={isModalOpen}
          onClose={closeSessionModal}
        />
      )}
    </div>
  );
} 