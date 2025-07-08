import React from 'react';
import { Session } from '@/utils/types';
import SessionForm, { SessionFormData } from './SessionForm';

interface AdminSessionModalProps {
  session: Session | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (sessionData: SessionFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  isEditing: boolean;
  isLoading: boolean;
  onSetEditing: (editing: boolean) => void;
}

export default function AdminSessionModal({
  session,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  isEditing,
  isLoading,
  onSetEditing
}: AdminSessionModalProps) {
  if (!isOpen || !session) return null;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Session' : session.topic}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          {isEditing ? (
            <SessionForm
              onSubmit={onEdit}
              onCancel={onClose}
              isLoading={isLoading}
              initialData={{
                day: session.day,
                start_time: session.start_time,
                topic: session.topic,
                speaker: session.speaker || '',
                description: session.description || '',
                type: session.type,
                location: session.location || '',
                room: session.room || '',
                capacity: session.capacity || undefined,
                is_children_friendly: session.is_children_friendly,
                requires_registration: session.requires_registration,
                tags: session.tags || [],
                parent_session_id: session.parent_session_id ?? null,
              }}
            />
          ) : (
            <div className="space-y-6">
              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Day</h3>
                  <p className="text-lg text-gray-900">Day {session.day}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Start Time</h3>
                  <p className="text-lg text-gray-900">{formatTime(session.start_time)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Type</h3>
                  <p className="text-lg text-gray-900">{formatType(session.type)}</p>
                </div>
                {session.speaker && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Speaker</h3>
                    <p className="text-lg text-gray-900">{session.speaker}</p>
                  </div>
                )}
                {session.location && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Location</h3>
                    <p className="text-lg text-gray-900">{session.location}</p>
                  </div>
                )}
                {session.room && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Room</h3>
                    <p className="text-lg text-gray-900">{session.room}</p>
                  </div>
                )}
                {session.capacity && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Capacity</h3>
                    <p className="text-lg text-gray-900">{session.capacity} attendees</p>
                  </div>
                )}
              </div>

              {session.description && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                  <p className="text-gray-900">{session.description}</p>
                </div>
              )}

              {/* Tags */}
              {session.tags && session.tags.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {session.tags.map(tag => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Flags */}
              <div className="flex gap-4">
                {session.is_children_friendly && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                    Children Friendly
                  </span>
                )}
                {session.requires_registration && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                    Registration Required
                  </span>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 pt-6 border-t">
                <button
                  onClick={() => onDelete()}
                  className="px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                >
                  Delete Session
                </button>
                <button
                  onClick={() => onSetEditing(true)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                >
                  Edit Session
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 