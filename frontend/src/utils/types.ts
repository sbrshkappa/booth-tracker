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