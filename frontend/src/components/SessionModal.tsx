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

interface SessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SessionModal({ session, isOpen, onClose }: SessionModalProps) {
  if (!session || !isOpen) return null;

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
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
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
            <span className={`text-sm px-3 py-1 rounded-full border ${getTypeColor(session.type)}`}>
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

          {/* Placeholder for future notes and rating functionality */}
          <div className="border-t pt-6 mb-6">
            <div className="text-center text-gray-500">
              <p className="text-sm">Notes and rating functionality coming soon!</p>
            </div>
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