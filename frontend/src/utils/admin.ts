export interface AdminStatus {
  isAdmin: boolean;
  adminLevel: string | null;
  userId: number;
}

export const getAdminIcon = (level: string): string => {
  switch (level) {
    case 'super_admin': return '👑';
    case 'conference_admin': return '🛡️';
    case 'booth_admin': return '⭐';
    default: return '👤';
  }
}; 