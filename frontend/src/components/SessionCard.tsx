import React from 'react';

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

interface SessionCardProps {
  session: Session;
  onClick: (session: Session) => void;
}

export default function SessionCard({ session, onClick }: SessionCardProps) {
  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'keynote':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'workshop':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'panel':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'break':
      case 'lunch':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'performance':
        return 'bg-pink-100 text-pink-800 border-pink-200';
      default:
        return 'bg-[#fba758]/20 text-[#fba758] border-[#fba758]/30';
    }
  };

  return (
    <div 
      className={`bg-white/90 p-4 rounded-lg border-l-4 cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-[1.02] ${
        session.is_children_friendly 
          ? 'border-[#fe84a0] hover:bg-[#fe84a0]/15' 
          : 'border-[#fba758] shadow-sm hover:bg-gray-50'
      }`}
      onClick={() => onClick(session)}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{session.topic}</h3>
          {session.speaker && (
            <p className="text-sm text-gray-600 mb-1">{session.speaker}</p>
          )}
          <p className="text-xs text-gray-500 mb-1">
            {formatTime(session.start_time)}
          </p>
          {session.room && (
            <p className="text-xs text-gray-500">📍 {session.room}</p>
          )}
        </div>
        <span className={`text-xs px-2 py-1 rounded-full border ${getTypeColor(session.type)}`}>
          {session.type.replace('_', ' ')}
        </span>
      </div>
      {session.description && (
        <p className="text-sm text-gray-700">{session.description}</p>
      )}
      {session.requires_registration && (
        <p className="text-xs text-blue-600 mt-2">⚠️ Registration required</p>
      )}
    </div>
  );
} 