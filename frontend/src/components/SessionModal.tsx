import React, { useState, useEffect, useCallback } from 'react';
import { getUserFromStorage } from '@/utils/auth';
import { User, UserSessionNotes } from '@/utils/types';
import StarRating from '@/components/StarRating';
import { getSessionTypeColor } from '@/utils/theme';

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

interface SessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

interface SessionNoteWithSession extends UserSessionNotes {
  sessions: {
    id: number;
    topic: string;
    speaker: string | null;
    start_time: string;
    type: string;
    room: string | null;
  };
}

export default function SessionModal({ session, isOpen, onClose }: SessionModalProps) {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [user, setUser] = useState<User | null>(null);

  // Get user on component mount
  useEffect(() => {
    const currentUser = getUserFromStorage();
    setUser(currentUser);
  }, []);

  const loadSessionNotes = useCallback(async () => {
    if (!user || !session) return;
    
    try {
      const response = await fetch(`/api/getSessionNotes?userEmail=${encodeURIComponent(user.email)}`);
      if (response.ok) {
        const data = await response.json();
        const sessionNote = data.data?.find((note: SessionNoteWithSession) => note.session_id === session.id);
        if (sessionNote) {
          setNotes(sessionNote.notes || '');
          setRating(sessionNote.rating || 0);
        } else {
          setNotes('');
          setRating(0);
        }
      }
    } catch (error) {
      console.error('Error loading session notes:', error);
    }
  }, [user, session]);

  // Load existing notes when modal opens
  useEffect(() => {
    if (session && isOpen && user) {
      loadSessionNotes();
    }
  }, [session, isOpen, user, loadSessionNotes]);

  const saveNotes = async () => {
    if (!session || !user) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const response = await fetch('/api/saveSessionNotes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: session.id,
          notes: notes.trim() || null,
          rating: rating > 0 ? rating : 0,
          userEmail: user.email,
        }),
      });

      if (response.ok) {
        setSaveStatus('success');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      setSaveStatus('error');
    } finally {
      setIsSaving(false);
    }
  };

  if (!session || !isOpen) return null;

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };



  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{session.topic}</h2>
              {session.speaker && (
                <p className="text-lg text-gray-600 mb-2">by {session.speaker}</p>
              )}
              <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <span>🕐 {formatTime(session.start_time)}</span>
                {session.room && <span>📍 {session.room}</span>}
                {session.location && <span>🏢 {session.location}</span>}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className="mb-4">
            <span className={`text-sm px-3 py-1 rounded-full border ${getSessionTypeColor(session.type)}`}>
              {session.type.replace('_', ' ')}
            </span>
            {session.is_children_friendly && (
              <span className="ml-2 text-sm px-3 py-1 rounded-full bg-[#fe84a0]/20 text-[#fe84a0] border border-[#fe84a0]/30">
                Children Friendly
              </span>
            )}
          </div>

          {session.description && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed">{session.description}</p>
            </div>
          )}

          {session.requires_registration && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-blue-800 font-medium">⚠️ Registration Required</p>
              <p className="text-blue-700 text-sm mt-1">
                This session requires advance registration. Please register to secure your spot.
              </p>
            </div>
          )}

          {/* Notes and Rating Section */}
          <div className="border-t pt-6 mb-6">
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                📝 My Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this session..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-[#fba758] focus:border-transparent"
                rows={4}
                maxLength={1000}
              />
              <div className="text-xs text-gray-500 mt-1">
                {notes.length}/1000 characters
              </div>
            </div>

            {/* Rating Section */}
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                Rate this Session
              </h3>
              <div className="flex justify-center">
                <StarRating 
                  rating={rating} 
                  onRatingChange={setRating} 
                  size="lg" 
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-center">
              <button
                onClick={saveNotes}
                disabled={isSaving || !user}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isSaving || !user
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-[#fba758] text-white hover:bg-[#fba758]/90'
                }`}
              >
                {isSaving ? 'Saving...' : 'Save Notes & Rating'}
              </button>
            </div>
            
            {/* Save Status */}
            {saveStatus === 'success' && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm text-center">✅ Notes and rating saved successfully!</p>
              </div>
            )}
            {saveStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm text-center">❌ Failed to save. Please try again.</p>
              </div>
            )}
          </div>

          {session.tags && session.tags.length > 0 && (
            <div className="border-t pt-6">
              <div className="flex flex-wrap gap-2">
                {session.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 