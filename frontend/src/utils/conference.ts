import { Session } from './types';

// Conference date mapping
export const CONFERENCE_DATES: Record<number, string> = {
  1: '2025-09-05',
  2: '2025-09-06', 
  3: '2025-09-07'
};

// Test mode - set to true to enable testing with simulated times
export const TEST_MODE = false;
let TEST_TIME = new Date('2025-09-04T10:00:00'); // Default test time

// Function to update test time (for testing purposes)
export const updateTestTime = (newTime: Date) => {
  TEST_TIME = newTime;
};

// Helper function to get current time (with test mode support)
const getCurrentTimeForTesting = (): Date => {
  if (TEST_MODE) {
    return TEST_TIME;
  }
  return new Date();
};

// Export test time for display purposes
export const getTestTime = (): Date | null => {
  return TEST_MODE ? getCurrentTimeForTesting() : null;
};

// Helper function to get session duration by calculating time until next session
export const getSessionDuration = (session: Session, allSessions: Session[]): number => {
  if (!session) return 60 * 60 * 1000; // Default 1 hour if no session provided
  
  // Find the next session on the same day
  const daySessions = allSessions
    .filter(s => s.day === session.day)
    .sort((a, b) => a.start_time.localeCompare(b.start_time));
  
  const currentIndex = daySessions.findIndex(s => s.id === session.id);
  if (currentIndex === -1) return 60 * 60 * 1000; // Default 1 hour if session not found
  
  // If this is the last session of the day, use default duration
  if (currentIndex === daySessions.length - 1) {
    return 60 * 60 * 1000; // Default 1 hour for last session
  }
  
  // Calculate duration until next session starts
  const currentStart = new Date(`${CONFERENCE_DATES[session.day]}T${session.start_time}`);
  const nextSession = daySessions[currentIndex + 1];
  const nextStart = new Date(`${CONFERENCE_DATES[nextSession.day]}T${nextSession.start_time}`);
  
  return nextStart.getTime() - currentStart.getTime();
};

// Helper function to get current session (only one at a time)
export const getCurrentSession = (sessions: Session[], currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  
  // Find the session that is currently happening
  const currentSessions = sessions.filter(session => {
    const startTime = new Date(`${CONFERENCE_DATES[session.day]}T${session.start_time}`);
    const endTime = new Date(startTime.getTime() + getSessionDuration(session, sessions));
    return timeToUse >= startTime && timeToUse < endTime;
  });
  
  // Return the first (earliest) current session if multiple exist
  return currentSessions.length > 0 ? currentSessions[0] : null;
};

// Helper function to get current day based on date
export const getCurrentDay = (currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  const currentDate = timeToUse.toISOString().split('T')[0];
  
  for (const [day, date] of Object.entries(CONFERENCE_DATES)) {
    if (currentDate === date) {
      return parseInt(day);
    }
  }
  
  // If not during conference, default to day 1
  return 1;
};

// Helper function to check if session is in the past
export const isSessionPast = (session: Session, currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  const sessionDate = CONFERENCE_DATES[session.day];
  const sessionTime = new Date(`${sessionDate}T${session.start_time}`);
  return timeToUse > sessionTime;
};

// Helper function to check if session is current
export const isSessionCurrent = (session: Session, now: Date, allSessions: Session[]): boolean => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : now;
  const sessionDate = CONFERENCE_DATES[session.day];
  const sessionStartTime = new Date(`${sessionDate}T${session.start_time}`);
  const sessionEndTime = new Date(sessionStartTime.getTime() + getSessionDuration(session, allSessions));
  
  return timeToUse >= sessionStartTime && timeToUse < sessionEndTime;
};

// Helper function to check if a day is in the past
export const isDayPast = (day: number, currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  return getCurrentDay(timeToUse) > day;
};

// Helper function to check if a day is current
export const isDayCurrent = (day: number, currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  
  // Only show current day if we're actually during the conference dates
  const conferenceStart = new Date('2025-09-05T00:00:00');
  const conferenceEnd = new Date('2025-09-07T23:59:59');
  
  // If we're not during the conference dates, no day should be considered current
  if (timeToUse < conferenceStart || timeToUse > conferenceEnd) {
    return false;
  }
  
  return getCurrentDay(timeToUse) === day;
};

// Helper function to format conference date
export const formatConferenceDate = (day: number) => {
  const date = new Date(CONFERENCE_DATES[day]);
  return date.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });
}; 