"use client";
import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import SessionCard from "@/components/SessionCard";
import SessionModal from "@/components/SessionModal";
import BoothCard from "@/components/BoothCard";
import { AdminStatus } from "@/utils/admin";
import { User, Booth, Session, TimelineItem } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';
import Logo from '@/components/Logo';
import { 
  getCurrentSession, 
  getCurrentDay, 
  isSessionPast, 
  isSessionCurrent,
  isDayCurrent,
  isDayPast,
  getTestTime,
  updateTestTime,
} from "@/utils/conference";
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

function SessionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set());
  const sessionsContainerRef = useRef<HTMLDivElement>(null);

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
      const now = getTestTime() || new Date();
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

  // Helper to group sessions by parent/child for a given list
  const groupParentChild = (sessions: Session[]) => {
    const parents = sessions.filter(s => !s.parent_session_id);
    const children = sessions.filter(s => s.parent_session_id);
    const childrenByParent: Record<number, Session[]> = {};
    children.forEach(child => {
      if (!childrenByParent[child.parent_session_id!]) {
        childrenByParent[child.parent_session_id!] = [];
      }
      childrenByParent[child.parent_session_id!].push(child);
    });
    return { parents, childrenByParent };
  };

  // Updated getSessionGroups to support pre-9am group and break/lunch/dinner separation
  const getSessionGroups = (day: number): TimelineItem[] => {
    const daySessions = getSessionsForDay(day);
    // Sort sessions by start time
    const sortedSessions = daySessions.sort((a, b) => a.start_time.localeCompare(b.start_time));
    const result: TimelineItem[] = [];
    let currentGroupSessions: Session[] = [];
    let groupStartTime = '';
    let inPre9am = true;

    for (let i = 0; i < sortedSessions.length; i++) {
      const session = sortedSessions[i];
      const hour = parseInt(session.start_time.split(':')[0]);
      // Pre-9am group
      if (inPre9am && hour < 9) {
        currentGroupSessions.push(session);
        continue;
      } else if (inPre9am && hour >= 9) {
        // End pre-9am group
        if (currentGroupSessions.length > 0) {
          result.push({
            id: `day-${day}-pre9am`,
            title: '',
            sessions: currentGroupSessions,
            startTime: currentGroupSessions[0].start_time,
            endTime: session.start_time,
            isCollapsed: collapsedGroups.has(`day-${day}-pre9am`)
          });
        }
        currentGroupSessions = [];
        groupStartTime = session.start_time;
        inPre9am = false;
      }
      // If this is a break, lunch, or dinner, finalize the current group and add the break
      if (session.type === 'break' || session.type === 'lunch' || session.type === 'dinner') {
        if (currentGroupSessions.length > 0) {
          const groupId = `day-${day}-group-${result.length}`;
          const groupTitle = getGroupTitle(groupStartTime);
          result.push({
            id: groupId,
            title: groupTitle,
            sessions: currentGroupSessions,
            startTime: groupStartTime,
            endTime: session.start_time,
            isCollapsed: collapsedGroups.has(groupId)
          });
        }
        result.push({ type: session.type, data: session });
        currentGroupSessions = [];
        groupStartTime = '';
      } else {
        if (currentGroupSessions.length === 0) {
          groupStartTime = session.start_time;
        }
        currentGroupSessions.push(session);
      }
    }
    // Add any remaining sessions as the final group
    if (currentGroupSessions.length > 0) {
      const groupId = `day-${day}-group-${result.length}`;
      const groupTitle = getGroupTitle(groupStartTime);
      result.push({
        id: groupId,
        title: groupTitle,
        sessions: currentGroupSessions,
        startTime: groupStartTime,
        endTime: 'end-of-day',
        isCollapsed: collapsedGroups.has(groupId)
      });
    }
    return result;
  };

  const getGroupTitle = (startTime: string): string => {
    const startHour = parseInt(startTime.split(':')[0]);
    
    if (startHour < 12) {
      return 'Morning Sessions';
    } else if (startHour < 17) {
      return 'Afternoon Sessions';
    } else {
      return 'Evening Sessions';
    }
  };

  const toggleGroupCollapse = (groupId: string) => {
    setCollapsedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = formatTime(startTime);
    const end = endTime === 'end-of-day' ? 'End of Day' : formatTime(endTime);
    return `${start} - ${end}`;
  };

  const openSessionModal = (session: Session) => {
    setSelectedSession(session);
    setIsModalOpen(true);
  };

  const closeSessionModal = () => {
    setIsModalOpen(false);
    setSelectedSession(null);
  };

  const handleDayClick = (day: number) => {
    setActiveDay(day);
    setActiveTab('sessions');
    setHasManuallyNavigated(true);
  };

  // Function to scroll to current session
  const scrollToCurrentSession = () => {
    if (!sessionsContainerRef.current || !currentSession) return;
    
    // Find the session card element
    const sessionElement = sessionsContainerRef.current.querySelector(`[data-session-id="${currentSession.id}"]`);
    if (sessionElement) {
      // Ensure the session group is expanded
      const sessionGroup = sessionElement.closest('.bg-white.rounded-lg');
      if (sessionGroup) {
        const collapseButton = sessionGroup.querySelector('[onclick*="toggleGroupCollapse"]') as HTMLElement;
        if (collapseButton && sessionGroup.querySelector('.space-y-3')?.classList.contains('hidden')) {
          collapseButton.click();
        }
      }
      
      // Scroll to the session with smooth animation and offset
      setTimeout(() => {
        sessionElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }, 100);
    }
  };

  // Function to scroll to a specific session by ID
  const scrollToSession = (sessionId: string) => {
    if (!sessionsContainerRef.current) return;
    
    // Find the session card element
    const sessionElement = sessionsContainerRef.current.querySelector(`[data-session-id="${sessionId}"]`);
    if (sessionElement) {
      // Switch to the correct day and tab
      const session = sessions.find(s => s.id === parseInt(sessionId));
      if (session) {
        setActiveDay(session.day);
        setActiveTab('sessions');
        setHasManuallyNavigated(true);
        
        // Ensure the session group is expanded
        const sessionGroup = sessionElement.closest('.bg-white.rounded-lg');
        if (sessionGroup) {
          const collapseButton = sessionGroup.querySelector('[onclick*="toggleGroupCollapse"]') as HTMLElement;
          if (collapseButton && sessionGroup.querySelector('.space-y-3')?.classList.contains('hidden')) {
            collapseButton.click();
          }
        }
        
        // Scroll to the session with smooth animation
        setTimeout(() => {
          sessionElement.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
          });
        }, 200);
      }
    }
  };

  // Handle scrollTo URL parameter
  useEffect(() => {
    const scrollToId = searchParams.get('scrollTo');
    if (scrollToId && !loading && sessions.length > 0) {
      scrollToSession(scrollToId);
    }
  }, [searchParams, loading, sessions]);

  // Scroll to current session when it changes
  useEffect(() => {
    if (currentSession && activeTab === 'sessions' && activeDay === currentSession.day) {
      scrollToCurrentSession();
    }
  }, [currentSession, activeTab, activeDay]);

  // Auto-scroll to current session when page loads (if on current day)
  useEffect(() => {
    if (!loading && sessions.length > 0 && activeTab === 'sessions') {
      const currentDay = getCurrentDay(currentTime);
      if (activeDay === currentDay && currentSession) {
        setTimeout(scrollToCurrentSession, 500); // Small delay to ensure DOM is ready
      }
    }
  }, [loading, sessions, activeTab, activeDay, currentTime, currentSession]);

  // Auto-expand groups containing current session
  useEffect(() => {
    if (currentSession && activeTab === 'sessions') {
      const timelineItems = getSessionGroups(activeDay);
      const groupsToExpand = new Set<string>();
      
      timelineItems.forEach(item => {
        if (!('type' in item) && item.sessions.some(session => isSessionCurrent(session, currentTime, sessions))) {
          if (item.isCollapsed) {
            groupsToExpand.add(item.id);
          }
        }
      });
      
      if (groupsToExpand.size > 0) {
        setCollapsedGroups(prev => {
          const newSet = new Set(prev);
          groupsToExpand.forEach(groupId => newSet.delete(groupId));
          return newSet;
        });
      }
    }
  }, [currentSession, activeTab, activeDay, currentTime, sessions]);

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
          <Logo />
          <MenuDropdown 
            options={menuOptions} 
            userName={`${user.firstName} ${user.lastName}`}
          />
        </div>
        
        {/* Bottom row: Title and subtitle */}
        <div className="max-w-2xl">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-[#fba758]" style={{ letterSpacing: 0.5 }}>
              Schedule
            </h1>
            <div className="flex items-center gap-2">
              {/* Test Controls - Only show when test mode is enabled */}
              {getTestTime() && (
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-gray-500">Test:</span>
                  <span className="text-blue-600 font-mono">
                    {getTestTime()?.toLocaleString() || 'Real time'}
                  </span>
                  <button
                    onClick={() => {
                      // Simulate different times for testing
                      const testTimes = [
                        new Date('2025-07-11T09:00:00'), // Before conference
                        new Date('2025-07-11T10:00:00'), // During Day 1
                        new Date('2025-07-11T14:00:00'), // Later Day 1
                        new Date('2025-07-12T10:00:00'), // Day 2
                        new Date('2025-07-13T10:00:00'), // Day 3
                      ];
                      const randomTime = testTimes[Math.floor(Math.random() * testTimes.length)];
                      updateTestTime(randomTime);
                      setCurrentTime(randomTime);
                      
                      // Auto-switch to the correct day tab
                      const detectedDay = getCurrentDay(randomTime);
                      if (detectedDay !== activeDay) {
                        setActiveDay(detectedDay);
                        setActiveTab('sessions');
                        setHasManuallyNavigated(false); // Allow auto-navigation
                      }
                      
                      // Force re-evaluation of current session
                      setTimeout(() => {
                        const newCurrentSession = getCurrentSession(sessions, randomTime);
                        setCurrentSession(newCurrentSession);
                      }, 100);
                    }}
                    className="px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Random Time
                  </button>
                </div>
              )}
            </div>
          </div>
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
                className={`w-1/4 py-3 px-2 rounded-md font-medium transition-all duration-300 ease-in-out relative z-10 text-center ${
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
            className={`w-1/4 py-3 px-2 rounded-md font-medium transition-all duration-300 ease-in-out relative z-10 text-center ${
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
              const timelineItems = getSessionGroups(activeDay);
              return (
                <div ref={sessionsContainerRef} className="h-full overflow-y-auto pr-2">
                  <div className="space-y-6">
                    {timelineItems.length > 0 ? (
                      timelineItems.map((item, index) => (
                        <div key={'id' in item ? item.id : `${item.type}-${item.data.id}-${index}`}>
                          {'type' in item && (item.type === 'break' || item.type === 'lunch' || item.type === 'dinner') ? (
                            // Render break, lunch, or dinner
                            <div className="text-center py-6">
                              <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-medium text-gray-700 mb-2">
                                  {item.type === 'lunch'
                                    ? '🍽️ Lunch Break'
                                    : item.type === 'dinner'
                                      ? '🍽️ Dinner'
                                      : '☕ Break'}
                                </h3>
                                <p className="text-gray-600">
                                  {formatTime(item.data.start_time)}
                                </p>
                              </div>
                            </div>
                          ) : (
                            // Render session group
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                              {/* Group Header */}
                              {item.title && (
                                <div 
                                  className="p-4 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
                                  onClick={() => toggleGroupCollapse(item.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900">
                                          {item.title}
                                        </h3>
                                      </div>
                                      <p className="text-sm text-gray-600">
                                        {formatTimeRange(item.startTime, item.endTime)}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs px-2 py-1 bg-[#fba758]/20 text-[#fba758] rounded-full">
                                        {item.sessions.length} session{item.sessions.length !== 1 ? 's' : ''}
                                      </span>
                                      <svg 
                                        className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                                          item.isCollapsed ? 'rotate-0' : 'rotate-180'
                                        }`}
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                      >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                      </svg>
                                    </div>
                                  </div>
                                </div>
                              )}
                              {/* Group Content */}
                              {!item.isCollapsed && (
                                <div className="p-4 space-y-3">
                                  {/* Render parent/child session cards within the group */}
                                  {(() => {
                                    const { parents, childrenByParent } = groupParentChild(item.sessions);
                                    return parents.map((parent) => (
                                      <div key={parent.id}>
                                        <div className={`rounded-lg border border-gray-200 shadow-sm mb-2 ${childrenByParent[parent.id] && childrenByParent[parent.id].length > 0 ? 'bg-orange-50' : 'bg-white'}`}>
                                          <div className="flex items-center p-4 cursor-pointer hover:bg-gray-100 transition-colors border-b border-gray-100" onClick={() => {
                                            setExpandedParents(prev => {
                                              const newSet = new Set(prev);
                                              if (newSet.has(parent.id)) newSet.delete(parent.id);
                                              else newSet.add(parent.id);
                                              return newSet;
                                            });
                                          }}>
                                            <div className="flex-1">
                                              <SessionCard 
                                                session={parent} 
                                                onClick={openSessionModal}
                                                isCurrent={isSessionCurrent(parent, currentTime, sessions)}
                                                isPast={isSessionPast(parent, currentTime)}
                                              />
                                            </div>
                                            {childrenByParent[parent.id] && childrenByParent[parent.id].length > 0 && (
                                              <span className="ml-4 flex-shrink-0">
                                                {expandedParents.has(parent.id) ? (
                                                  <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                                ) : (
                                                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                                                )}
                                              </span>
                                            )}
                                          </div>
                                          {childrenByParent[parent.id] && childrenByParent[parent.id].length > 0 && expandedParents.has(parent.id) && (
                                            <div className="pl-8 pb-2 space-y-2">
                                              {childrenByParent[parent.id].map(child => (
                                                <SessionCard
                                                  key={child.id}
                                                  session={child}
                                                  onClick={openSessionModal}
                                                  isCurrent={isSessionCurrent(child, currentTime, sessions)}
                                                  isPast={isSessionPast(child, currentTime)}
                                                />
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ));
                                  })()}
                                </div>
                              )}
                            </div>
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

export default function SessionsPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <SessionsPageContent />
    </Suspense>
  );
} 