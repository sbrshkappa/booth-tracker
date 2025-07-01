"use client";
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import StarRating from "@/components/StarRating";
import { AdminStatus, getAdminIcon } from "@/utils/admin";
import { User, Progress } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { sendVisitNotesEmail } from "@/utils/email";
import { LoadingScreen, LoadingSpinner } from "@/utils/ui";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [phrase, setPhrase] = useState("");
  const [notes, setNotes] = useState("");
  const [rating, setRating] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const prevProgressRef = useRef<Progress | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");

  // Check if user has completed all booths
  const isCompleted = progress && progress.visited > 0 && progress.visited === progress.total;

  useEffect(() => {
    // Load user data from localStorage
    const userObj = getUserFromStorage();
    const progressData = localStorage.getItem('userProgress');
    if (userObj) {
      setUser(userObj);
      // Check admin status
      checkAdminStatus(userObj.email).then(setAdminStatus);
    }
    if (progressData) setProgress(JSON.parse(progressData));
  }, []);

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
        const oldProgress = prevProgressRef.current;
        
        setProgress(newProgress);
        prevProgressRef.current = newProgress;
        
        // Update localStorage with fresh data
        localStorage.setItem('userProgress', JSON.stringify(newProgress));
        
        // Check if user just completed all booths
        const wasCompleted = oldProgress && oldProgress.visited === oldProgress.total && oldProgress.visited > 0;
        const isNowCompleted = newProgress.visited === newProgress.total && newProgress.visited > 0;
        
        if (!wasCompleted && isNowCompleted) {
          // User just completed all booths - trigger Google Sheets write
          if (user?.email) {
            try {
              console.log('Triggering Google Sheets write for completed user:', user.email);
              
              const sheetsResponse = await fetch('/api/writeToGoogleSheet', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userEmail: user.email }),
              });

              const sheetsData = await sheetsResponse.json();
              
              if (sheetsResponse.ok) {
                console.log('Successfully wrote to Google Sheets:', sheetsData);
              } else {
                console.error('Failed to write to Google Sheets:', sheetsData.error);
              }
            } catch (err) {
              console.error('Error writing to Google Sheets:', err);
            }
          }
        }
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchUserProgress();
    }
  }, [user?.email, fetchUserProgress]);

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

  const handleLogoutClick = () => handleLogout(router);

  const menuOptions = createMenuOptions({
    currentPage: 'dashboard',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

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
    return <LoadingScreen />;
  }

  // Dynamic header
  let headerText = "";
  if (progress.remaining === 1) headerText = "Just one more to go!";
  else if (progress.remaining === 0) headerText = "All done!";
  else headerText = `Only ${progress.remaining} more to go!`;

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown 
        options={menuOptions} 
        userName={`${user.firstName} ${user.lastName}`}
      />

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
            
            {/* Email Button */}
            <div className="mt-6">
              <button
                onClick={async () => {
                  if (!user?.email) return;
                  setIsEmailLoading(true);
                  setEmailError("");
                  setEmailSuccess("");
                  
                  const result = await sendVisitNotesEmail(user);
                  
                  if (result.success) {
                    setEmailSuccess(result.message);
                  } else {
                    setEmailError(result.message);
                  }
                  
                  setIsEmailLoading(false);
                }}
                disabled={isEmailLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2 mx-auto"
              >
                {isEmailLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Sending...
                  </>
                ) : (
                  <>
                    📧 Email My Visit Summary
                  </>
                )}
              </button>
              {emailSuccess && (
                <div className="text-green-600 text-sm mt-2">{emailSuccess}</div>
              )}
              {emailError && (
                <div className="text-red-600 text-sm mt-2">{emailError}</div>
              )}
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
                  <StarRating rating={rating} onRatingChange={setRating} />
                </div>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-500 text-white py-3 px-6 rounded-xl font-semibold hover:bg-orange-600 transition-colors disabled:bg-orange-300 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" color="white" />
                    Visiting...
                  </>
                ) : (
                  'Visit Booth'
                )}
              </button>
            </form>
            
            {/* Success/Error Messages */}
            {success && (
              <div className="text-green-600 text-sm text-center bg-green-50 p-3 rounded-lg">
                {success}
              </div>
            )}
            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                {error}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
