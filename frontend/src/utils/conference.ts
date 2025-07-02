import { Session } from './types';

// Conference date mapping
export const CONFERENCE_DATES: Record<number, string> = {
  1: '2025-07-11',
  2: '2025-07-12', 
  3: '2025-07-13'
};

// Helper function to get current session
export const getCurrentSession = (sessions: Session[], currentTime: Date) => {
  return sessions.find(session => {
    const startTime = new Date(`${CONFERENCE_DATES[session.day]}T${session.start_time}`);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour sessions
    return currentTime >= startTime && currentTime < endTime;
  });
};

// Helper function to get current day based on date
export const getCurrentDay = (currentTime: Date) => {
  const currentDate = currentTime.toISOString().split('T')[0];
  
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
  const sessionDate = CONFERENCE_DATES[session.day];
  const sessionTime = new Date(`${sessionDate}T${session.start_time}`);
  return currentTime > sessionTime;
};

// Helper function to check if session is current
export const isSessionCurrent = (session: Session, now: Date): boolean => {
  const currentTimeStr = now.toTimeString().slice(0, 5);
  const startTime = session.start_time;
  
  // Calculate end time as 1 hour after start time
  const startDate = new Date(`2000-01-01T${startTime}`);
  const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour later
  const endTime = endDate.toTimeString().slice(0, 5);
  
  return currentTimeStr >= startTime && currentTimeStr <= endTime;
};

// Helper function to check if a day is in the past
export const isDayPast = (day: number, currentTime: Date) => {
  return getCurrentDay(currentTime) > day;
};

// Helper function to check if a day is current
export const isDayCurrent = (day: number, currentTime: Date) => {
  return getCurrentDay(currentTime) === day;
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

// Helper function to get session duration (default 1 hour)
export const getSessionDuration = () => {
  // For now, assume all sessions are 1 hour
  // This could be extended to use actual duration data if available
  return 60 * 60 * 1000; // 1 hour in milliseconds
}; 