import React, { useState } from 'react';
import { User } from '@/utils/types';
import { NoteData } from './NoteCard';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  journeyItems: NoteData[];
  user: User | null;
}

type ShareType = 'all' | 'booths' | 'sessions' | 'custom';
type ShareMethod = 'email-self' | 'email-other';

export default function ShareModal({ isOpen, onClose, journeyItems, user }: ShareModalProps) {
  const [shareType, setShareType] = useState<ShareType>('all');
  const [shareMethod, setShareMethod] = useState<ShareMethod>('email-self');
  const [customEmail, setCustomEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBooths, setSelectedBooths] = useState<number[]>([]);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  if (!isOpen) return null;

  const getFilteredItems = () => {
    switch (shareType) {
      case 'all':
        return journeyItems;
      case 'booths':
        return journeyItems.filter(item => item.type === 'booth');
      case 'sessions':
        return journeyItems.filter(item => item.type === 'session');
      case 'custom':
        return journeyItems.filter(item => 
          (item.type === 'booth' && selectedBooths.includes(item.id)) ||
          (item.type === 'session' && selectedSessions.includes(item.id))
        );
      default:
        return journeyItems;
    }
  };

  const getSessionItems = () => {
    return journeyItems.filter(item => item.type === 'session');
  };

  const getBoothItems = () => {
    return journeyItems.filter(item => item.type === 'booth');
  };

  const handleSessionToggle = (sessionId: number) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    );
  };

  const handleBoothToggle = (boothId: number) => {
    setSelectedBooths(prev => 
      prev.includes(boothId) 
        ? prev.filter(id => id !== boothId)
        : [...prev, boothId]
    );
  };

  const handleSelectAllBooths = () => {
    const allBoothIds = getBoothItems().map(booth => booth.id);
    setSelectedBooths(allBoothIds);
  };

  const handleSelectAllSessions = () => {
    const allSessionIds = getSessionItems().map(session => session.id);
    setSelectedSessions(allSessionIds);
  };

  const handleDeselectAllBooths = () => {
    setSelectedBooths([]);
  };

  const handleDeselectAllSessions = () => {
    setSelectedSessions([]);
  };

  const formatShareContent = () => {
    const items = getFilteredItems();
    if (items.length === 0) return 'No items to share.';

    let content = `My SSSIO National Conference 2025 Journey\n\n`;
    
    const boothItems = items.filter(item => item.type === 'booth');
    const sessionItems = items.filter(item => item.type === 'session');

    if (boothItems.length > 0) {
      content += `🏠 BOOTH VISITS (${boothItems.length})\n`;
      content += '─'.repeat(30) + '\n';
      boothItems.forEach(item => {
        content += `• ${item.title}\n`;
        if (item.boothPhrase) content += `  Secret Phrase: ${item.boothPhrase}\n`;
        if (item.notes) content += `  Notes: ${item.notes}\n`;
        if (item.rating) content += `  Rating: ${'⭐'.repeat(item.rating)}\n`;
        content += `  Visited: ${new Date(item.visitedAt).toLocaleDateString()}\n\n`;
      });
    }

    if (sessionItems.length > 0) {
      content += `📅 SESSION NOTES (${sessionItems.length})\n`;
      content += '─'.repeat(30) + '\n';
      sessionItems.forEach(item => {
        content += `• ${item.title}\n`;
        if (item.subtitle) content += `  Speaker: ${item.subtitle}\n`;
        if (item.sessionTime) content += `  Time: ${item.sessionTime}\n`;
        if (item.sessionDay) content += `  Day: ${item.sessionDay}\n`;
        if (item.notes) content += `  Notes: ${item.notes}\n`;
        if (item.rating) content += `  Rating: ${'⭐'.repeat(item.rating)}\n`;
        content += `  Updated: ${new Date(item.visitedAt).toLocaleDateString()}\n\n`;
      });
    }

    return content;
  };

  const handleShare = async () => {
    setIsSharing(true);
    
    try {
      const content = formatShareContent();
      
      switch (shareMethod) {
        case 'email-self':
          // Send email to self
          await fetch('/api/sendVisitNotesEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userEmail: user?.email,
              content,
              subject: 'My SSSIO Conference Journey',
              shareType
            }),
          });
          break;
          
        case 'email-other':
          if (!customEmail) {
            alert('Please enter an email address');
            return;
          }
          // Send email to other
          await fetch('/api/sendVisitNotesEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              userEmail: customEmail,
              content,
              subject: 'SSSIO Conference Journey Shared',
              shareType
            }),
          });
          break;
      }
      
      // Show success state
      setIsSuccess(true);
      setIsSharing(false);
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
      setIsSharing(false);
    }
  };

  const filteredItems = getFilteredItems();

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden relative">
        {/* Success Overlay */}
        {isSuccess && (
          <div className="absolute inset-0 bg-white rounded-2xl flex items-center justify-center z-10 animate-in fade-in duration-300">
            <div className="text-center">
              {/* Success Icon Animation */}
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-500">
                  <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                {/* Email Icon */}
                <div className="w-16 h-16 bg-[#fba758] rounded-full flex items-center justify-center mx-auto mb-4 animate-in slide-in-from-bottom-4 duration-700 delay-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2 animate-in slide-in-from-bottom-4 duration-700 delay-500">
                Email Sent Successfully! 🎉
              </h3>
              <p className="text-gray-600 mb-6 animate-in slide-in-from-bottom-4 duration-700 delay-700">
                Your conference journey has been sent to your email.
              </p>
              
              {/* Loading Dots */}
              <div className="flex justify-center space-x-1 animate-in slide-in-from-bottom-4 duration-700 delay-900">
                <div className="w-2 h-2 bg-[#fba758] rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-[#fba758] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-[#fba758] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Share Your Journey</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {/* What to share */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">What would you like to share?</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setShareType('all')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  shareType === 'all' 
                    ? 'bg-[#fba758] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Notes ({journeyItems.length})
              </button>
              
              <button
                onClick={() => setShareType('booths')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  shareType === 'booths' 
                    ? 'bg-[#fba758] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Booth Notes ({journeyItems.filter(item => item.type === 'booth').length})
              </button>
              
              <button
                onClick={() => setShareType('sessions')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  shareType === 'sessions' 
                    ? 'bg-[#fba758] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Session Notes ({journeyItems.filter(item => item.type === 'session').length})
              </button>
              
              <button
                onClick={() => setShareType('custom')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  shareType === 'custom' 
                    ? 'bg-[#fba758] text-white shadow-sm' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Custom ({selectedBooths.length + selectedSessions.length})
              </button>
            </div>
          </div>

          {/* Custom selection */}
          {shareType === 'custom' && (
            <div className="mb-6">
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full p-3 border border-gray-300 rounded-lg bg-white text-left flex items-center justify-between hover:border-gray-400 transition-colors"
                >
                  <span className="text-gray-700">
                    {selectedBooths.length + selectedSessions.length === 0 
                      ? 'Select items to share...' 
                      : `${selectedBooths.length + selectedSessions.length} items selected`
                    }
                  </span>
                  <svg 
                    className={`w-5 h-5 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                    <div className="p-3">
                      {getBoothItems().length > 0 && (
                        <div className="mb-4">
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedBooths.length === getBoothItems().length && getBoothItems().length > 0}
                              onChange={selectedBooths.length === getBoothItems().length ? handleDeselectAllBooths : handleSelectAllBooths}
                              className="rounded border-gray-300 text-[#fba758] focus:ring-[#fba758]"
                            />
                            <h5 className="font-medium text-gray-900 text-sm">🏠 Booths</h5>
                          </label>
                          <div className="space-y-1">
                            {getBoothItems().map(booth => (
                              <label key={booth.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={selectedBooths.includes(booth.id)}
                                  onChange={() => handleBoothToggle(booth.id)}
                                  className="rounded border-gray-300 text-[#fba758] focus:ring-[#fba758]"
                                />
                                <span className="text-sm text-gray-700">{booth.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {getSessionItems().length > 0 && (
                        <div className="mb-2">
                          <label className="flex items-center space-x-2 cursor-pointer mb-2">
                            <input
                              type="checkbox"
                              checked={selectedSessions.length === getSessionItems().length && getSessionItems().length > 0}
                              onChange={selectedSessions.length === getSessionItems().length ? handleDeselectAllSessions : handleSelectAllSessions}
                              className="rounded border-gray-300 text-[#fba758] focus:ring-[#fba758]"
                            />
                            <h5 className="font-medium text-gray-900 text-sm">📅 Sessions</h5>
                          </label>
                          <div className="space-y-1">
                            {getSessionItems().map(session => (
                              <label key={session.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={selectedSessions.includes(session.id)}
                                  onChange={() => handleSessionToggle(session.id)}
                                  className="rounded border-gray-300 text-[#fba758] focus:ring-[#fba758]"
                                />
                                <span className="text-sm text-gray-700">{session.title}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* How to share */}
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-3">How would you like to share?</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="shareMethod"
                  value="email-self"
                  checked={shareMethod === 'email-self'}
                  onChange={(e) => setShareMethod(e.target.value as ShareMethod)}
                  className="text-[#fba758] focus:ring-[#fba758]"
                />
                <span>📧 Self</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="shareMethod"
                  value="email-other"
                  checked={shareMethod === 'email-other'}
                  onChange={(e) => setShareMethod(e.target.value as ShareMethod)}
                  className="text-[#fba758] focus:ring-[#fba758]"
                />
                <span>📧 Someone else</span>
              </label>
              
              {shareMethod === 'email-other' && (
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-[#fba758] focus:border-[#fba758]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSharing || isSuccess}
          >
            Cancel
          </button>
          <button
            onClick={handleShare}
            disabled={isSharing || isSuccess || filteredItems.length === 0}
            className="px-6 py-2 bg-[#fba758] text-white rounded-lg font-medium hover:bg-[#fba758]/90 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isSharing && (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{isSharing ? 'Sending...' : 'Share'}</span>
          </button>
        </div>
      </div>
    </div>
  );
} 