export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
}

export interface Progress {
  visited: number;
  total: number;
  remaining: number;
  percentage: number;
  isComplete: boolean;
}

export interface Booth {
  id: number;
  name: string;
  phrase: string;
  description?: string;
  location?: string;
  total_visits: number;
}

export interface VisitHistory {
  visitId: number;
  boothId: number;
  boothPhrase: string;
  boothName: string;
  visitedAt: string;
  notes?: string;
  rating?: number;
}

export interface Session {
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

export interface UserSessionNotes {
  id: number;
  user_id: number;
  session_id: number;
  notes: string | null;
  rating: number;
  created_at: string;
  updated_at: string;
}

export interface SessionGroup {
  id: string;
  title: string;
  sessions: Session[];
  startTime: string;
  endTime: string;
  isCollapsed: boolean;
}

export type TimelineItem = SessionGroup | { type: 'break'; data: Session } | { type: 'lunch'; data: Session }; 

export interface PopularBooth {
  name: string;
  visits: number;
}

export interface PopularSessionType {
  type: string;
  count: number;
}

export interface AdminMetrics {
  totalUsers: number;
  completedUsers: number;
  activeUsers: number;
  completionRate: number;
  activeRate: number;
  popularBooths: PopularBooth[];
  popularSessionTypes: PopularSessionType[];
  totalSessions: number;
  totalBooths: number;
}

export interface SessionFormData {
  day: number;
  start_time: string;
  topic: string;
  speaker?: string;
  description?: string;
  type: string;
  location?: string;
  room?: string;
  capacity?: number;
  is_children_friendly: boolean;
  requires_registration: boolean;
  tags: string[];
} 