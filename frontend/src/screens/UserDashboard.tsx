"use client";
import React, { useState, useEffect, useCallback } from "react";

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
}

const HOW_IT_WORKS = [
  "Visit each booth to discover how SSSIO-USA uplifts communities through love and selfless service.",
  "Collect secret phrases along the way to unlock your journey.",
  "Complete all booths to experience the full impact—and qualify for a raffle!"
];

const UserDashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [phrase, setPhrase] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [howItWorksOpen, setHowItWorksOpen] = useState(true);
  const [visitHistoryOpen, setVisitHistoryOpen] = useState(false);

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
        setVisitHistory(data.data.visitHistory);
        
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
    console.log('handleSubmitPhrase called', { phrase });
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
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to visit booth');
      }

      setSuccess(`✅ Correct phrase! You&apos;ve successfully visited a booth`);
      setPhrase("");
      
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
    window.location.href = '/';
  };

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
      {/* Logout button only, menu removed */}
      <div className="absolute top-6 right-6 z-30 flex items-center gap-4">
        <button
          onClick={handleLogout}
          className="px-3 py-1 text-sm font-semibold text-white bg-red-500 rounded-lg shadow hover:bg-red-600 focus:outline-none"
        >
          Logout
        </button>
      </div>
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
              You&apos;ve visited all booths and hopefully have learned about the various wonderful activities happening in the different regions of the organization. You are now entered into a raffle! Good luck! 🍀
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
        {/* Collapsible Visit History */}
        <div className="w-full mb-4 bg-white/80 rounded-xl p-4 shadow-sm relative z-10 transition-all duration-300">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-gray-800">Visit History</h3>
            <button
              type="button"
              aria-label={visitHistoryOpen ? 'Hide visit history' : 'Show visit history'}
              onClick={() => setVisitHistoryOpen((v) => !v)}
              className="ml-2 text-orange-500 hover:text-orange-700 focus:outline-none text-lg font-bold"
            >
              {visitHistoryOpen ? '−' : '+'}
            </button>
          </div>
          <div
            className={`transition-all duration-300 overflow-hidden relative ${visitHistoryOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
          >
            {visitHistory.length === 0 ? (
              <div className="text-gray-500 text-center py-2">No booths visited yet.</div>
            ) : (
              <ul className="space-y-2">
                {visitHistory.map((visit) => (
                  <li key={visit.visitId} className="bg-green-50 border border-green-200 rounded-lg p-3 flex flex-col sm:flex-row sm:justify-between items-start sm:items-center">
                    <div>
                      <span className="font-semibold text-green-800">{visit.boothName}</span>
                      <span className="ml-2 text-xs text-green-600">Phrase: {visit.boothPhrase}</span>
                    </div>
                    <div className="text-xs text-green-600 mt-1 sm:mt-0">
                      {new Date(visit.visitedAt).toLocaleDateString()}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
      {/* How it works at the bottom, collapses downward */}
      <div className="w-full max-w-md mx-auto mb-2 bg-white/80 rounded-xl p-4 shadow-sm relative z-10 transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-800">How it works?</h3>
          <button
            type="button"
            aria-label={howItWorksOpen ? 'Hide how it works' : 'Show how it works'}
            onClick={() => setHowItWorksOpen((v) => !v)}
            className="ml-2 text-orange-500 hover:text-orange-700 focus:outline-none text-lg font-bold"
          >
            {howItWorksOpen ? '−' : '+'}
          </button>
        </div>
        <div
          className={`transition-all duration-300 overflow-hidden relative ${howItWorksOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
          <ul className="list-disc pl-5 space-y-1 text-gray-800 text-[15px] sm:text-base relative z-10">
            {HOW_IT_WORKS.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
          {/* Decorative background art now inside the section */}
          <div className="absolute left-0 bottom-0 w-full h-full pointer-events-none select-none z-0" style={{ background: 'radial-gradient(circle at 70% 80%, #fbeee6 40%, transparent 80%)' }} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard; 