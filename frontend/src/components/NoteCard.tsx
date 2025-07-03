import React from 'react';
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
}

export default function NoteCard({ note, onClick }: NoteCardProps) {
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
        {note.notes && (
          <div className="mb-4">
            <div className="bg-white/60 rounded-lg p-3 border border-gray-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                {note.notes}
              </p>
            </div>
          </div>
        )}

        {/* Rating */}
        {note.rating && (
          <div className="mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-600">Your Rating:</span>
              <StarRating rating={note.rating} readonly />
            </div>
          </div>
        )}

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