"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import StarRating from "@/components/StarRating";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
}

interface Progress {
  visited: number;
  total: number;
  remaining: number;
  percentage: number;
  isComplete: boolean;
}

interface VisitHistory {
  visitId: number;
  boothId: number;
  boothPhrase: string;
  boothName: string;
  visitedAt: string;
  notes?: string;
}

const UserDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [phrase, setPhrase] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if user has completed all booths
  const isCompleted = progress && progress.visited > 0 && progress.visited === progress.total;

  useEffect(() => {
    // Load user data from localStorage
    const userData = localStorage.getItem('user');
    const progressData = localStorage.getItem('userProgress');
    if (userData) setUser(JSON.parse(userData));
    if (progressData) setProgress(JSON.parse(progressData));
  }, []);

  const triggerGoogleSheetsWrite = async () => {
    if (!user?.email) return;
    
    try {
      console.log('Triggering Google Sheets write for completed user:', user.email);
      
      const response = await fetch('/api/writeToGoogleSheet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: user.email }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log('Successfully wrote to Google Sheets:', data);
      } else {
        console.error('Failed to write to Google Sheets:', data.error);
      }
    } catch (err) {
      console.error('Error writing to Google Sheets:', err);
    }
  };

  const fetchUserProgress = useCallback(async () => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/loginUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await response.json();
      console.log('User progress API response:', data);

      if (response.ok) {
        const newProgress = data.data.progress;
        setProgress(newProgress);
        
        // Update localStorage with fresh data
        localStorage.setItem('userProgress', JSON.stringify(newProgress));
        
        // Check if user just completed all booths
        const wasCompleted = progress && progress.visited === progress.total && progress.visited > 0;
        const isNowCompleted = newProgress.visited === newProgress.total && newProgress.visited > 0;
        
        if (!wasCompleted && isNowCompleted) {
          // User just completed all booths - trigger Google Sheets write
          triggerGoogleSheetsWrite();
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [user?.email, progress, triggerGoogleSheetsWrite]);

  useEffect(() => {
    if (user?.email) {
      fetchUserProgress();
    }
  }, [user, fetchUserProgress]);

  const handleSubmitPhrase = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('handleSubmitPhrase called', { phrase, notes, rating });
    if (!phrase.trim()) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch('/api/visitBooth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: user?.email,
          phrase: phrase.trim(),
          notes: notes.trim() || null,
          rating: rating > 0 ? rating : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to visit booth');
      }

      setSuccess(`✅ Correct phrase! You've successfully visited a booth`);
      setPhrase("");
      setNotes("");
      setRating(0);
      
      // Refresh progress data
      setTimeout(() => {
        fetchUserProgress();
      }, 1000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to visit booth. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

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
      action: () => {}, // Already on dashboard
      isCurrent: true,
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
      action: () => router.push('/how-it-works'),
    },
    {
      id: 'logout',
      label: 'Logout',
      emoji: '🚪',
      action: handleLogout,
      isDanger: true,
    },
  ];

  // Circular progress bar SVG
  const renderProgressCircle = () => {
    if (!progress) return null;
    const radius = 90;
    const stroke = 12;
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const percent = Math.min(progress.visited / progress.total, 1);
    const strokeDashoffset = circumference - percent * circumference;
    return (
      <div className="relative flex items-center justify-center w-[200px] h-[200px] mx-auto">
        {/* Faded background image placeholder */}
        <div
          className="absolute inset-0 w-full h-full bg-gradient-to-br from-yellow-200 to-purple-200 rounded-full opacity-20"
          style={{ zIndex: 0 }}
        />
        {/* SVG Progress Circle */}
        <svg height={radius * 2} width={radius * 2} className="relative z-10">
          <circle
            stroke="#E5E7EB"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          <circle
            stroke="#4B6FAE"
            fill="transparent"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 0.5s' }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
        </svg>
        {/* Progress Text */}
        <span className="absolute inset-0 flex items-center justify-center text-4xl font-light text-gray-500 z-20">
          {progress.visited}/{progress.total}
        </span>
      </div>
    );
  };

  if (!user || !progress) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Dynamic header
  let headerText = "";
  if (progress.remaining === 1) headerText = "Just one more to go!";
  else if (progress.remaining === 0) headerText = "All done!";
  else headerText = `Only ${progress.remaining} more to go!`;

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown options={menuOptions} />

      {/* Main content fills available space */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto">
        {/* Header */}
        <h2 className="text-2xl font-semibold text-orange-500 text-center mt-10 mb-4" style={{ letterSpacing: 0.5 }}>
          {headerText}
        </h2>
        {/* Progress Circle */}
        {renderProgressCircle()}
        
        {isCompleted ? (
          /* Completion Message */
          <div className="mt-8 mb-4 text-center">
            <div className="text-6xl mb-4">🎉🎊✨</div>
            <div className="text-xl font-bold text-green-600 mb-3">Congratulations!</div>
            <div className="text-base text-gray-700 leading-relaxed">
              You've visited all booths and hopefully have learned about the various wonderful activities happening in the different regions of the organization. You are now entered into a raffle! Good luck! 🍀
            </div>
          </div>
        ) : (
          /* Input Form */
          <>
            {/* Instruction */}
            <div className="mt-8 mb-2 text-lg text-center text-gray-900 font-medium">Visit a booth, get a phrase</div>
            {/* Phrase Input */}
            <form onSubmit={handleSubmitPhrase} className="w-full flex flex-col items-center gap-4 mb-4">
              <input
                className="w-full rounded-xl border-2 border-orange-400 px-4 py-3 text-base text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                type="text"
                value={phrase}
                onChange={e => setPhrase(e.target.value)}
                placeholder="Enter the phrase"
              />
              <textarea
                className="w-full rounded-xl border-2 border-orange-400 px-4 py-3 text-base text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Enter any notes about the booth"
              />
              <div className="w-full">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate this booth (optional)
                </label>
                <div className="flex justify-center">
                  <StarRating 
                    rating={rating} 
                    onRatingChange={setRating}
                    size="lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1453A3] text-white text-xl font-bold py-3 rounded-xl mt-2 hover:bg-blue-900 transition-colors disabled:bg-blue-300"
              >
                Submit
              </button>
              {error && (
                <div className="text-red-600 text-sm text-center w-full">{error}</div>
              )}
              {success && (
                <div className="text-green-600 text-sm text-center w-full">{success}</div>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard; 