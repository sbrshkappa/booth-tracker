import { Session } from './types';

// Conference date mapping
export const CONFERENCE_DATES: Record<number, string> = {
  1: '2025-07-11',
  2: '2025-07-12', 
  3: '2025-07-13'
};

// Test mode - set to true to enable testing with simulated times
const TEST_MODE = true;
let TEST_TIME = new Date('2025-07-11T10:00:00'); // Default test time

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

// Helper function to get session duration (default 1 hour)
export const getSessionDuration = (session?: Session) => {
  // For now, assume all sessions are 1 hour
  // This could be extended to use actual duration data if available
  return 60 * 60 * 1000; // 1 hour in milliseconds
};

// Helper function to get current session (only one at a time)
export const getCurrentSession = (sessions: Session[], currentTime: Date) => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : currentTime;
  
  // Find the session that is currently happening
  const currentSessions = sessions.filter(session => {
    const startTime = new Date(`${CONFERENCE_DATES[session.day]}T${session.start_time}`);
    const endTime = new Date(startTime.getTime() + getSessionDuration());
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
export const isSessionCurrent = (session: Session, now: Date): boolean => {
  const timeToUse = TEST_MODE ? getCurrentTimeForTesting() : now;
  const sessionDate = CONFERENCE_DATES[session.day];
  const sessionStartTime = new Date(`${sessionDate}T${session.start_time}`);
  const sessionEndTime = new Date(sessionStartTime.getTime() + getSessionDuration());
  
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