import { AdminStatus } from './admin';
import { User } from './types';

export const getUserFromStorage = (): User | null => {
  if (typeof window === 'undefined') return null;
  
  const userData = localStorage.getItem('user');
  if (!userData) return null;
  
  try {
    return JSON.parse(userData);
  } catch {
    return null;
  }
};

export const clearUserData = (): void => {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem('user');
  localStorage.removeItem('userProgress');
};

export const checkAdminStatus = async (email: string): Promise<AdminStatus | null> => {
  try {
    const response = await fetch('/api/checkAdminStatus', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userEmail: email }),
    });

    const data = await response.json();

    if (response.ok) {
      return data;
    }
    return null;
  } catch (err) {
    console.error('Error checking admin status:', err);
    return null;
  }
};

export const handleLogout = (router: { push: (path: string) => void }): void => {
  clearUserData();
  router.push('/');
}; 