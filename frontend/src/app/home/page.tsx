'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { User, Session } from '@/utils/types';
import { getUserFromStorage, checkAdminStatus, handleLogout } from '@/utils/auth';
import { createMenuOptions } from '@/utils/menu';
import { AdminStatus } from '@/utils/admin';
import MenuDropdown from '@/components/MenuDropdown';
import SessionCard from '@/components/SessionCard';
import BackgroundImage from '@/components/BackgroundImage';
import Logo from '@/components/Logo';

// Conference start date - July 11, 2025 at 9:00 AM
const CONFERENCE_START = new Date('2025-07-11T09:00:00');

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  // Check if conference has started
  const isConferenceStarted = currentTime >= CONFERENCE_START;

  // Calculate countdown
  const getCountdown = () => {
    const diff = CONFERENCE_START.getTime() - currentTime.getTime();
    if (diff <= 0) return null;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { days, hours, minutes, seconds };
  };

  const countdown = getCountdown();

  // Get current session
  const getCurrentSession = (sessions: Session[], now: Date): Session | null => {
    // Only show current sessions if we're actually during the conference dates
    const conferenceStart = new Date('2025-07-11T00:00:00');
    const conferenceEnd = new Date('2025-07-13T23:59:59');
    
    // If we're not during the conference dates, don't show any current session
    if (now < conferenceStart || now > conferenceEnd) {
      return null;
    }
    
    const currentTimeStr = now.toTimeString().slice(0, 5);
    
    return sessions.find(session => {
      const startTime = session.start_time;
      // For sessions, we'll use a default end time of 1 hour after start if not specified
      const endTime = session.start_time ? 
        new Date(`2000-01-01T${startTime}`).getTime() + (60 * 60 * 1000) : 
        new Date(`2000-01-01T${startTime}`).getTime() + (60 * 60 * 1000);
      const currentTime = new Date(`2000-01-01T${currentTimeStr}`).getTime();
      return currentTime >= new Date(`2000-01-01T${startTime}`).getTime() && currentTime <= endTime;
    }) || null;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUserFromStorage();
      setUser(userData);
      
      if (userData) {
        const adminData = await checkAdminStatus(userData.email);
        setAdminStatus(adminData);
      }
    };

    checkAuth();
  }, []);

  // Update current time every second and auto-detect current session
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      
      // Auto-detect current session
      const current = getCurrentSession(sessions, now);
      setCurrentSession(current || null);
    };

    // Update immediately
    updateTime();
    
    // Update every second for countdown
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [sessions]);

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

  const handleLogoutClick = () => handleLogout(router);

  const menuOptions = createMenuOptions({
    currentPage: 'home',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  const openSessionModal = () => {
    // Navigate to sessions page
    router.push('/sessions');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fba758] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
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
            <p className="text-gray-600">Loading...</p>
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
      <BackgroundImage />
      
      {/* Header with logo and menu */}
      <div className="mb-12">
        <div className="flex justify-between items-center mb-12">
          <Logo />
          <MenuDropdown 
            options={menuOptions} 
            userName={`${user.firstName} ${user.lastName}`}
          />
        </div>
        
        {/* Welcome message */}
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-[#fba758] mb-6 leading-tight" style={{ letterSpacing: 0.5 }}>
            Welcome {user.firstName}
          </h1>
          <h2 className="text-2xl font-semibold text-gray-700 mb-6 leading-tight" style={{ letterSpacing: 0.3 }}>
            SSSIO National Conference 2025
          </h2>
        </div>
        
        {/* SSSIO Logo */}
        <div className="text-center mb-8">
          <Image 
            src="/assets/ssio-logo-english.png" 
            alt="SSSIO Logo" 
            className="h-32 w-auto mx-auto"
            width={128}
            height={128}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-4xl mx-auto flex-1">
        {!isConferenceStarted && countdown ? (
          /* Countdown Timer */
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Conference Starts In
              </h2>
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#fba758]">{countdown.days}</div>
                  <div className="text-sm text-gray-600">Days</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#fba758]">{countdown.hours}</div>
                  <div className="text-sm text-gray-600">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#fba758]">{countdown.minutes}</div>
                  <div className="text-sm text-gray-600">Minutes</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#fba758]">{countdown.seconds}</div>
                  <div className="text-sm text-gray-600">Seconds</div>
                </div>
              </div>
              <p className="text-gray-600">
                Get ready for an inspiring journey of knowledge and connection
              </p>
            </div>
          </div>
        ) : currentSession ? (
          /* Current Session Card */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Currently Happening
              </h2>
              <p className="text-gray-600">
                Don't miss out on what's happening right now
              </p>
            </div>
            
            <SessionCard 
              session={currentSession} 
              onClick={openSessionModal}
              isCurrent={true}
              isPast={false}
            />
            
            <div className="text-center">
              <button
                onClick={() => router.push('/sessions')}
                className="bg-[#fba758] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#fba758]/90 transition-colors shadow-sm"
              >
                See Full Schedule
              </button>
            </div>
          </div>
        ) : (
          /* No current session - conference has started but no session is happening */
          <div className="text-center py-12">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Conference is Live!
              </h2>
              <p className="text-gray-600 mb-6">
                Check out the full schedule to see what's coming up next
              </p>
              <button
                onClick={() => router.push('/sessions')}
                className="bg-[#fba758] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#fba758]/90 transition-colors shadow-sm"
              >
                View Schedule
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 