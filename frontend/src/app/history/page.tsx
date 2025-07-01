"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import StarRating from "@/components/StarRating";
import { AdminStatus, getAdminIcon } from "@/utils/admin";
import { User, Progress, VisitHistory } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";

const HistoryPage: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [visitHistory, setVisitHistory] = useState<VisitHistory[]>([]);
  const [editingNotes, setEditingNotes] = useState<number | null>(null);
  const [editingNotesText, setEditingNotesText] = useState("");
  const [editingRating, setEditingRating] = useState<number | null>(null);
  const [editingRatingValue, setEditingRatingValue] = useState(0);
  const [error, setError] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    // Check admin status
    checkAdminStatus(userObj.email);
  }, [router]);

  const checkAdminStatus = async (email: string) => {
    try {
      const response = await fetch('/api/checkAdminStatus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail: email }),
      });

      const data = await response.json();

      if (response.ok) {
        setAdminStatus(data);
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
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

      if (response.ok) {
        const newProgress = data.data.progress;
        setProgress(newProgress);
        setVisitHistory(data.data.visitHistory);
        
        // Update localStorage with fresh data
        localStorage.setItem('userProgress', JSON.stringify(newProgress));
      }
    } catch (err) {
      console.error('Error fetching progress:', err);
    }
  }, [user?.email]);

  useEffect(() => {
    if (user?.email) {
      fetchUserProgress();
    }
  }, [user, fetchUserProgress]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProgress');
    router.push('/');
  };

  const handleEditNotes = (visitId: number, currentNotes: string) => {
    setEditingNotes(visitId);
    setEditingNotesText(currentNotes || "");
  };

  const handleSaveNotes = async (visitId: number) => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/updateVisitNotes', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitId,
          notes: editingNotesText.trim(),
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update notes');
      }

      // Update local state
      setVisitHistory(prev => prev.map(visit => 
        visit.visitId === visitId 
          ? { ...visit, notes: editingNotesText.trim() }
          : visit
      ));

      setEditingNotes(null);
      setEditingNotesText("");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notes. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingNotes(null);
    setEditingNotesText("");
  };

  const handleEditRating = (visitId: number, currentRating: number) => {
    setEditingRating(visitId);
    setEditingRatingValue(currentRating || 0);
  };

  const handleSaveRating = async (visitId: number) => {
    if (!user?.email) return;

    try {
      const response = await fetch('/api/updateBoothRating', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          visitId,
          rating: editingRatingValue,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rating');
      }

      // Update local state
      setVisitHistory(prev => prev.map(visit => 
        visit.visitId === visitId 
          ? { ...visit, rating: editingRatingValue }
          : visit
      ));

      setEditingRating(null);
      setEditingRatingValue(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update rating. Please try again.');
    }
  };

  const handleCancelRatingEdit = () => {
    setEditingRating(null);
    setEditingRatingValue(0);
  };

  const menuOptions = createMenuOptions({
    currentPage: 'history',
    router,
    handleLogout,
    adminStatus,
  });

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

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown options={menuOptions} />

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-orange-500 mb-4" style={{ letterSpacing: 0.5 }}>
            Visit History 📚
          </h1>
          <p className="text-lg text-gray-600">
            Your journey through SSSIO-USA booths
          </p>
          {progress && (
            <div className="mt-4 text-sm text-gray-500">
              {progress.visited} of {progress.total} booths visited
            </div>
          )}
          
          {/* Email Button */}
          {visitHistory.length > 0 && (
            <div className="mt-6">
              <button
                onClick={async () => {
                  if (!user?.email) return;
                  setIsEmailLoading(true);
                  setEmailError("");
                  setEmailSuccess("");
                  try {
                    const response = await fetch('/api/sendVisitNotesEmail', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        userEmail: user.email,
                        userName: `${user.firstName} ${user.lastName}`
                      }),
                    });
                    const data = await response.json();
                    if (!response.ok) throw new Error(data.error || 'Failed to send email');
                    setEmailSuccess(`📧 Email sent successfully! Check your inbox for your booth visit summary.`);
                  } catch (err) {
                    setEmailError(err instanceof Error ? err.message : 'Failed to send email. Please try again.');
                  } finally {
                    setIsEmailLoading(false);
                  }
                }}
                disabled={isEmailLoading}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-300 flex items-center gap-2 mx-auto"
              >
                {isEmailLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
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
          )}
        </div>

        {/* Visit History - Full height scrolling */}
        <div className="flex-1 bg-white/80 rounded-xl p-6 shadow-lg">
          {visitHistory.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No booths visited yet</h3>
              <p className="text-gray-500 mb-6">Start your journey by visiting your first booth!</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-4 h-full">
              {error && (
                <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg">
                  {error}
                </div>
              )}
              
              <div className="h-full overflow-y-auto pr-2">
                <ul className="space-y-6">
                  {visitHistory.map((visit) => (
                    <li key={visit.visitId} className="bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-4">
                        <div>
                          <span className="font-semibold text-green-800 text-xl">{visit.boothName}</span>
                          <span className="ml-2 text-sm text-green-600">Phrase: {visit.boothPhrase}</span>
                        </div>
                        <div className="text-sm text-green-600 mt-2 sm:mt-0">
                          {new Date(visit.visitedAt).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      
                      {/* Notes Section */}
                      <div className="mb-4">
                        {editingNotes === visit.visitId ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full rounded-lg border border-green-300 px-4 py-3 text-sm text-gray-900 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
                              value={editingNotesText}
                              onChange={e => setEditingNotesText(e.target.value)}
                              placeholder="Add notes about this booth..."
                              rows={3}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveNotes(visit.visitId)}
                                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              {visit.notes ? (
                                <p className="text-sm text-gray-700">
                                  {visit.notes}
                                </p>
                              ) : (
                                <p className="text-sm text-gray-500 italic">No notes added</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleEditNotes(visit.visitId, visit.notes || "")}
                              className="ml-4 px-4 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            >
                              {visit.notes ? 'Edit' : 'Add'} Notes
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Rating Section */}
                      <div className="pt-4 border-t border-green-200">
                        {editingRating === visit.visitId ? (
                          <div className="space-y-4">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700">Rating:</span>
                              <StarRating 
                                rating={editingRatingValue} 
                                onRatingChange={setEditingRatingValue}
                                size="md"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleSaveRating(visit.visitId)}
                                className="px-4 py-2 text-sm bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                              >
                                Save Rating
                              </button>
                              <button
                                onClick={handleCancelRatingEdit}
                                className="px-4 py-2 text-sm bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-sm font-medium text-gray-700">Rating:</span>
                              {visit.rating ? (
                                <StarRating 
                                  rating={visit.rating} 
                                  readonly={true}
                                  size="md"
                                />
                              ) : (
                                <span className="text-sm text-gray-500 italic">No rating</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleEditRating(visit.visitId, visit.rating || 0)}
                              className="px-4 py-2 text-sm bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                            >
                              {visit.rating ? 'Edit' : 'Add'} Rating
                            </button>
                          </div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HistoryPage; 