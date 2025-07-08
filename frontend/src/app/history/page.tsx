"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import { User } from "@/utils/types";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { createMenuOptions } from "@/utils/menu";
import { AdminStatus } from "@/utils/admin";
import NoteCard, { NoteData } from "@/components/NoteCard";
import BackgroundImage from '@/components/BackgroundImage';
import ShareModal from '@/components/ShareModal';
import Logo from '@/components/Logo';
import AppTour from '@/components/AppTour';
import { shouldShowFirstTimeTour, markTourCompleted, markFirstTimeTourSeen } from '@/utils/tour';

export default function MyJourneyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [journeyItems, setJourneyItems] = useState<NoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'booths' | 'sessions'>('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  // Tour and help state
  const [isTourOpen, setIsTourOpen] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const userData = getUserFromStorage();
      setUser(userData);
      
      if (userData) {
        const adminData = await checkAdminStatus(userData.email);
        setAdminStatus(adminData);
        
        // Check if tour should continue (if user navigated here during tour)
        const shouldShowTour = shouldShowFirstTimeTour();
        setIsFirstTimeUser(shouldShowTour);
        
        // If this is a first-time user and we're on history, continue the tour
        if (shouldShowTour) {
          // Check if we're in the middle of a tour (by checking session storage)
          const isInTour = sessionStorage.getItem('tour-in-progress') === 'true';
          if (isInTour) {
            setIsTourOpen(true);
          }
        }
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    const fetchJourneyData = async () => {
      if (!user?.email) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch booth visits with notes and ratings
        const boothResponse = await fetch('/api/loginUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        // Fetch session notes and ratings
        const sessionResponse = await fetch('/api/getSessionNotes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ userEmail: user.email }),
        });

        const boothData = boothResponse.ok ? await boothResponse.json() : { data: { visitHistory: [] } };
        const sessionData = sessionResponse.ok ? await sessionResponse.json() : { data: [] };

        // Transform booth visits into NoteData format
        const boothNotes: NoteData[] = boothData.data?.visitHistory
          ?.filter((visit: { notes?: string; rating?: number }) => visit.notes || visit.rating)
          ?.map((visit: { 
            visitId: number; 
            boothName: string; 
            notes?: string; 
            rating?: number; 
            visitedAt: string; 
            boothPhrase?: string; 
            location?: string; 
          }) => ({
            id: visit.visitId,
            type: 'booth' as const,
            title: visit.boothName,
            notes: visit.notes,
            rating: visit.rating,
            visitedAt: visit.visitedAt,
            boothPhrase: visit.boothPhrase,
            boothLocation: visit.location || 'Exhibition Hall',
          })) || [];

        // Transform session notes into NoteData format
        const sessionNotes: NoteData[] = sessionData.data
          ?.filter((note: { notes?: string; rating?: number }) => note.notes || note.rating)
          ?.map((note: { 
            id: number; 
            notes?: string; 
            rating?: number; 
            updated_at: string; 
            sessions?: { 
              topic?: string; 
              speaker?: string; 
              start_time?: string; 
              room?: string; 
              day?: number; 
            }; 
          }) => ({
            id: note.id,
            type: 'session' as const,
            title: note.sessions?.topic || 'Session',
            subtitle: note.sessions?.speaker,
            notes: note.notes,
            rating: note.rating,
            visitedAt: note.updated_at,
            sessionTime: note.sessions?.start_time,
            sessionSpeaker: note.sessions?.speaker,
            sessionLocation: note.sessions?.room,
            sessionDay: note.sessions?.day,
          })) || [];

        // Combine and sort by date (newest first)
        const allNotes = [...boothNotes, ...sessionNotes].sort((a, b) => 
          new Date(b.visitedAt).getTime() - new Date(a.visitedAt).getTime()
        );

        setJourneyItems(allNotes);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch journey data');
      } finally {
        setLoading(false);
      }
    };

    fetchJourneyData();
  }, [user?.email]);

  const handleLogoutClick = () => handleLogout(router);

  const handleTourComplete = () => {
    if (isFirstTimeUser) {
      markTourCompleted();
      setIsFirstTimeUser(false);
    } else {
      markFirstTimeTourSeen();
    }
  };

  const handleTourClose = () => {
    setIsTourOpen(false);
    if (isFirstTimeUser) {
      markFirstTimeTourSeen();
      setIsFirstTimeUser(false);
    }
  };

  const handleNoteUpdate = (updatedNote: NoteData) => {
    setJourneyItems(prevItems => 
      prevItems.map(item => 
        item.id === updatedNote.id && item.type === updatedNote.type 
          ? updatedNote 
          : item
      )
    );
  };

  const menuOptions = createMenuOptions({
    currentPage: 'history',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  const filteredItems = journeyItems.filter(item => {
    if (activeFilter === 'all') return true;
    return item.type === (activeFilter === 'booths' ? 'booth' : 'session');
  });

  const getFilterStats = () => {
    const total = journeyItems.length;
    const booths = journeyItems.filter(item => item.type === 'booth').length;
    const sessions = journeyItems.filter(item => item.type === 'session').length;
    return { total, booths, sessions };
  };

  const stats = getFilterStats();

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
            <p className="text-gray-600">Loading your journey...</p>
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
      <div className="mb-6 flex-shrink-0">
        <div className="flex justify-between items-center mb-4">
          <Logo />
          <MenuDropdown 
            options={menuOptions} 
            userName={`${user.firstName} ${user.lastName}`}
          />
        </div>
        
        {/* Title and subtitle */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-[#fba758] mb-2" style={{ letterSpacing: 0.5 }}>
            My Journey
          </h1>
          <p className="text-xs text-gray-500 mb-2">
            Your personal collection of notes, ratings, and memories from the conference
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col w-full max-w-6xl mx-auto flex-1 min-h-0 history-content">
        {/* Filter tabs - fixed at top */}
        <div className="flex bg-gray-100 rounded-lg p-1 mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveFilter('all')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'all'
                ? 'bg-white text-[#fba758] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All ({stats.total})
          </button>
          <button
            onClick={() => setActiveFilter('booths')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'booths'
                ? 'bg-white text-[#fba758] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Booths ({stats.booths})
          </button>
          <button
            onClick={() => setActiveFilter('sessions')}
            className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200 ${
              activeFilter === 'sessions'
                ? 'bg-white text-[#fba758] shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Sessions ({stats.sessions})
          </button>
        </div>

        {/* Journey items - scrollable */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {filteredItems.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-6">
              {filteredItems.map((item) => (
                <NoteCard 
                  key={`${item.type}-${item.id}`} 
                  note={item}
                  onUpdate={handleNoteUpdate}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-gray-100 max-w-md mx-auto">
                <div className="text-4xl mb-4">🌟</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  Start Your Journey
                </h3>
                <p className="text-gray-600 mb-6">
                  {activeFilter === 'all' 
                    ? "Visit booths and attend sessions to start building your conference journey. Your notes and ratings will appear here."
                    : activeFilter === 'booths'
                    ? "Visit booths and leave notes or ratings to see them here."
                    : "Attend sessions and take notes or give ratings to see them here."
                  }
                </p>
                <div className="space-y-2">
                  {activeFilter === 'all' && (
                    <>
                      <button
                        onClick={() => router.push('/dashboard')}
                        className="w-full bg-[#fba758] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#fba758]/90 transition-colors"
                      >
                        Visit Booths
                      </button>
                      <button
                        onClick={() => router.push('/sessions')}
                        className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                      >
                        View Sessions
                      </button>
                    </>
                  )}
                  {activeFilter === 'booths' && (
                    <button
                      onClick={() => router.push('/dashboard')}
                      className="w-full bg-[#fba758] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#fba758]/90 transition-colors"
                    >
                      Start Booth Hunting
                    </button>
                  )}
                  {activeFilter === 'sessions' && (
                    <button
                      onClick={() => router.push('/sessions')}
                      className="w-full bg-[#fba758] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#fba758]/90 transition-colors"
                    >
                      Explore Sessions
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          journeyItems={journeyItems}
          user={user}
        />
      )}

      {/* Floating Share Button */}
      <button
        onClick={() => setIsShareModalOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#fba758] to-[#ff8c42] hover:from-[#ff8c42] hover:to-[#fba758] text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 z-40 flex items-center justify-center group share-button"
        title="Share your journey"
      >
        <svg 
          className="w-6 h-6 transition-transform group-hover:rotate-12" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2.5} 
            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" 
          />
        </svg>
      </button>

      {/* Tour Component */}
      <AppTour
        isOpen={isTourOpen}
        onClose={handleTourClose}
        onComplete={handleTourComplete}
        isFirstTime={isFirstTimeUser}
      />
    </div>
  );
} 