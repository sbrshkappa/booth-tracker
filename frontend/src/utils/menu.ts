import { AdminStatus } from './admin';

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
  currentPage: 'home' | 'dashboard' | 'sessions' | 'history' | 'how-it-works' | 'admin' | 'contact';
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
      id: 'home',
      label: 'Home',
      emoji: '🏠',
      action: currentPage === 'home' ? () => {} : () => router.push('/home'),
      isCurrent: currentPage === 'home',
    },
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
      emoji: '🎯',
      action: currentPage === 'dashboard' ? () => {} : () => router.push('/dashboard'),
      isCurrent: currentPage === 'dashboard',
    },
    {
      id: 'history',
      label: 'My Journey',
      emoji: '📊',
      action: currentPage === 'history' ? () => {} : () => router.push('/history'),
      isCurrent: currentPage === 'history',
    },
  ];

  // Help option - navigates to how-it-works page
  const helpOption: MenuOption = {
    id: 'help',
    label: 'Help & Tour',
    emoji: '❓',
    action: currentPage === 'how-it-works' ? () => {} : () => router.push('/how-it-works'),
    isCurrent: currentPage === 'how-it-works',
  };

  const adminOption: MenuOption[] = adminStatus?.isAdmin ? [{
    id: 'admin',
    label: 'Admin Panel',
    emoji: '⚙️',
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

  const contactOption: MenuOption = {
    id: 'contact',
    label: 'Contact Us',
    emoji: '📧',
    action: currentPage === 'contact' ? () => {} : () => router.push('/contact'),
    isCurrent: currentPage === 'contact',
  };

  return [...baseOptions, helpOption, contactOption, ...adminOption, logoutOption];
}; 