import React from 'react';
import { Session } from '@/utils/types';
import { getSessionTypeColor } from '@/utils/theme';

interface SessionCardProps {
  session: Session;
  onClick: (session: Session) => void;
  isCurrent?: boolean;
  isPast?: boolean;
}

export default function SessionCard({ session, onClick, isCurrent = false, isPast = false }: SessionCardProps) {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <div 
      data-session-id={session.id}
      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        isCurrent
          ? 'bg-[#f97316]/10 border-[#f97316] shadow-lg ring-2 ring-[#f97316]/20'
          : isPast
            ? 'bg-gray-50/80 border-gray-300 opacity-60'
            : session.is_children_friendly 
              ? 'bg-white/90 border-[#fe84a0] hover:bg-[#fe84a0]/15' 
              : 'bg-white/90 border-[#fba758] shadow-sm hover:bg-gray-50'
      }`}
      onClick={() => onClick(session)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold mb-1 ${
              isCurrent ? 'text-[#f97316]' : isPast ? 'text-gray-500' : 'text-gray-900'
            }`}>
              {session.topic}
            </h3>
            {isCurrent && (
              <span className="text-xs px-2 py-1 bg-[#f97316] text-white rounded-full font-medium animate-pulse">
                NOW
              </span>
            )}
          </div>
          {session.speaker && (
            <p className={`text-sm mb-1 ${
              isPast ? 'text-gray-400' : 'text-gray-600'
            }`}>
              {session.speaker}
            </p>
          )}
          <p className={`text-xs mb-1 ${
            isPast ? 'text-gray-400' : 'text-gray-500'
          }`}>
            {formatTime(session.start_time)}
          </p>
          {session.room && (
            <p className={`text-xs ${
              isPast ? 'text-gray-400' : 'text-gray-500'
            }`}>
              📍 {session.room}
            </p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${getSessionTypeColor(session.type)} ${
          isPast ? 'opacity-50' : ''
        }`}>
          {session.type.replace('_', ' ')}
        </span>
      </div>
      {session.description && (
        <p className={`text-sm ${
          isPast ? 'text-gray-400' : 'text-gray-700'
        }`}>
          {session.description}
        </p>
      )}
      {session.requires_registration && (
        <p className={`text-xs mt-2 ${
          isPast ? 'text-gray-400' : 'text-blue-600'
        }`}>
          ⚠️ Registration required
        </p>
      )}
    </div>
  );
} 