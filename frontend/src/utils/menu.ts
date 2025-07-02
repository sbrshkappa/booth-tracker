import { AdminStatus, getAdminIcon } from './admin';

export interface MenuOption {
  id: string;
  label: string;
  emoji: string;
  action: () => void;
  isCurrent?: boolean;
  isAdmin?: boolean;
  isDanger?: boolean;
}

export interface MenuConfig {
  currentPage: 'dashboard' | 'sessions' | 'history' | 'how-it-works' | 'admin';
  router: {
    push: (path: string) => void;
  };
  handleLogout: () => void;
  adminStatus: AdminStatus | null;
}

export const createMenuOptions = (config: MenuConfig): MenuOption[] => {
  const { currentPage, router, handleLogout, adminStatus } = config;

  const baseOptions: MenuOption[] = [
    {
      id: 'sessions',
      label: 'Sessions',
      emoji: '📅',
      action: currentPage === 'sessions' ? () => {} : () => router.push('/sessions'),
      isCurrent: currentPage === 'sessions',
    },
    {
      id: 'dashboard',
      label: 'Booth Tracker',
      emoji: '🏠',
      action: currentPage === 'dashboard' ? () => {} : () => router.push('/dashboard'),
      isCurrent: currentPage === 'dashboard',
    },
    {
      id: 'history',
      label: 'History',
      emoji: '📚',
      action: currentPage === 'history' ? () => {} : () => router.push('/history'),
      isCurrent: currentPage === 'history',
    },
    {
      id: 'how-it-works',
      label: 'Help',
      emoji: '❓',
      action: currentPage === 'how-it-works' ? () => {} : () => router.push('/how-it-works'),
      isCurrent: currentPage === 'how-it-works',
    },
  ];

  const adminOption: MenuOption[] = adminStatus?.isAdmin ? [{
    id: 'admin',
    label: 'Admin Panel',
    emoji: getAdminIcon(adminStatus.adminLevel || ''),
    action: currentPage === 'admin' ? () => {} : () => router.push('/admin'),
    isCurrent: currentPage === 'admin',
    isAdmin: true,
  }] : [];

  const logoutOption: MenuOption = {
    id: 'logout',
    label: 'Logout',
    emoji: '🚪',
    action: handleLogout,
    isDanger: true,
  };

  return [...baseOptions, ...adminOption, logoutOption];
}; 