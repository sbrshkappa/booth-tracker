import React, { useState } from 'react';
import StarRating from './StarRating';

export interface NoteData {
  id: number;
  type: 'booth' | 'session';
  title: string;
  subtitle?: string;
  notes?: string;
  rating?: number;
  visitedAt: string;
  // Booth specific
  boothPhrase?: string;
  boothLocation?: string;
  // Session specific
  sessionTime?: string;
  sessionSpeaker?: string;
  sessionLocation?: string;
  sessionDay?: number;
}

interface NoteCardProps {
  note: NoteData;
  onClick?: () => void;
  onUpdate?: (updatedNote: NoteData) => void;
}

export default function NoteCard({ note, onClick, onUpdate }: NoteCardProps) {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isEditingRating, setIsEditingRating] = useState(false);
  const [editedNotes, setEditedNotes] = useState(note.notes || '');
  const [editedRating, setEditedRating] = useState(note.rating || 0);
  const [isSaving, setIsSaving] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = () => {
    return note.type === 'booth' ? '🎯' : '📅';
  };

  const getTypeColor = () => {
    return note.type === 'booth' ? 'bg-blue-50 border-blue-200' : 'bg-purple-50 border-purple-200';
  };

  const getTypeTextColor = () => {
    return note.type === 'booth' ? 'text-blue-700' : 'text-purple-700';
  };

  const getUserEmail = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.email;
      } catch {
        return null;
      }
    }
    return null;
  };

  const handleNotesClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingNotes(true);
  };

  const handleRatingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingRating(true);
  };

  const handleSaveNotes = async () => {
    if (editedNotes === note.notes) {
      setIsEditingNotes(false);
      return;
    }

    setIsSaving(true);
    try {
      if (note.type === 'booth') {
        // Update booth visit notes
        const response = await fetch('/api/updateVisitNotes', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitId: note.id,
            notes: editedNotes,
            userEmail: getUserEmail()
          }),
        });

        if (response.ok) {
          const updatedNote = { ...note, notes: editedNotes };
          onUpdate?.(updatedNote);
        }
      } else {
        // Update session notes
        const requestBody = {
          session_id: note.id,
          notes: editedNotes,
          rating: note.rating,
          userEmail: getUserEmail()
        };
        
        const response = await fetch('/api/saveSessionNotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });

        if (response.ok) {
          const updatedNote = { ...note, notes: editedNotes };
          onUpdate?.(updatedNote);
        }
      }
      setIsEditingNotes(false);
    } catch (error) {
      console.error('Error saving notes:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveRating = async () => {
    if (editedRating === note.rating) {
      setIsEditingRating(false);
      return;
    }

    setIsSaving(true);
    try {
      if (note.type === 'booth') {
        // Update booth visit rating
        const response = await fetch('/api/updateBoothRating', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            visitId: note.id,
            rating: editedRating,
            userEmail: getUserEmail()
          }),
        });

        if (response.ok) {
          const updatedNote = { ...note, rating: editedRating };
          onUpdate?.(updatedNote);
        }
      } else {
        // Update session rating
        const response = await fetch('/api/saveSessionNotes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: note.id,
            notes: note.notes,
            rating: editedRating,
            userEmail: getUserEmail()
          }),
        });

        if (response.ok) {
          const updatedNote = { ...note, rating: editedRating };
          onUpdate?.(updatedNote);
        }
      }
      setIsEditingRating(false);
    } catch (error) {
      console.error('Error saving rating:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelNotes = () => {
    setEditedNotes(note.notes || '');
    setIsEditingNotes(false);
  };

  const handleCancelRating = () => {
    setEditedRating(note.rating || 0);
    setIsEditingRating(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent, saveFunction: () => void, cancelFunction: () => void) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      saveFunction();
    } else if (e.key === 'Escape') {
      cancelFunction();
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl shadow-sm border-2 ${getTypeColor()} hover:shadow-md transition-all duration-200 cursor-pointer transform hover:scale-[1.02] ${
        onClick ? 'hover:shadow-lg' : ''
      }`}
      onClick={onClick}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getTypeIcon()}</span>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg leading-tight">
                {note.title}
              </h3>
              {note.subtitle && (
                <p className="text-sm text-gray-600 mt-1">
                  {note.subtitle}
                </p>
              )}
            </div>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${getTypeTextColor()} bg-white/80`}>
            {note.type === 'booth' ? 'Booth' : 'Session'}
          </span>
        </div>

        {/* Details */}
        <div className="space-y-3 mb-4">
          {/* Booth specific details */}
          {note.type === 'booth' && note.boothPhrase && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-gray-500">Secret Phrase:</span>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-700">
                {note.boothPhrase}
              </span>
            </div>
          )}

          {/* Session specific details */}
          {note.type === 'session' && (
            <div className="flex items-center gap-4 text-sm text-gray-600">
              {note.sessionDay && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">📅</span>
                  Day {note.sessionDay}
                </span>
              )}
              {note.sessionTime && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">🕐</span>
                  {note.sessionTime}
                </span>
              )}
              {note.sessionSpeaker && (
                <span className="flex items-center gap-1">
                  <span className="text-gray-400">👤</span>
                  {note.sessionSpeaker}
                </span>
              )}
            </div>
          )}

          {/* Location */}
          {(note.boothLocation || note.sessionLocation) && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="text-gray-400">📍</span>
              <span>{note.boothLocation || note.sessionLocation}</span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div className="mb-4">
          <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
            {isEditingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  onKeyDown={(e) => handleKeyPress(e, handleSaveNotes, handleCancelNotes)}
                  className="w-full text-sm text-gray-700 leading-relaxed bg-transparent border-none outline-none resize-none"
                  placeholder="Add your notes..."
                  autoFocus
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveNotes}
                    disabled={isSaving}
                    className="px-3 py-1 bg-[#fba758] text-white text-xs rounded hover:bg-[#fba758]/90 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancelNotes}
                    disabled={isSaving}
                    className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div 
                onClick={handleNotesClick}
                className="cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
              >
                {note.notes ? (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {note.notes}
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 italic">
                    Click to add notes...
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Rating */}
        <div className="mb-4">
          {isEditingRating ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Your Rating:</span>
                <StarRating 
                  rating={editedRating} 
                  onRatingChange={setEditedRating}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSaveRating}
                  disabled={isSaving}
                  className="px-3 py-1 bg-[#fba758] text-white text-xs rounded hover:bg-[#fba758]/90 disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleCancelRating}
                  disabled={isSaving}
                  className="px-3 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div 
              onClick={handleRatingClick}
              className="cursor-pointer hover:bg-gray-50 rounded p-1 -m-1 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600">Your Rating:</span>
                {note.rating ? (
                  <StarRating rating={note.rating} />
                ) : (
                  <span className="text-sm text-gray-500 italic">
                    Click to add rating...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {formatDate(note.visitedAt)}
          </span>
          <div className="flex items-center gap-1">
            {note.notes && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                Notes
              </span>
            )}
            {note.rating && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Rated
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 