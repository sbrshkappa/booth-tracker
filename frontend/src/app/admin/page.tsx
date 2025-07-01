"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";

interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  badgeNumber: string;
}

interface AdminStatus {
  isAdmin: boolean;
  adminLevel: string | null;
  userId: number;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/');
      return;
    }
    
    const userObj = JSON.parse(userData);
    setUser(userObj);
    
    // Check admin status
    checkAdminStatus(userObj.email);
  }, [router]);

  const checkAdminStatus = async (email: string) => {
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
        setAdminStatus(data);
        if (!data.isAdmin) {
          router.push('/dashboard');
        }
      } else {
        console.error('Failed to check admin status:', data.error);
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userProgress');
    router.push('/');
  };

  const getAdminIcon = (level: string) => {
    switch (level) {
      case 'super_admin': return '👑';
      case 'conference_admin': return '🛡️';
      case 'booth_admin': return '⭐';
      default: return '👤';
    }
  };

  const menuOptions = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      emoji: '🏠',
      action: () => router.push('/dashboard'),
    },
    {
      id: 'history',
      label: 'History',
      emoji: '📚',
      action: () => router.push('/history'),
    },
    {
      id: 'how-it-works',
      label: 'How it works',
      emoji: '❓',
      action: () => router.push('/how-it-works'),
    },
    {
      id: 'admin',
      label: 'Admin Panel',
      emoji: getAdminIcon(adminStatus?.adminLevel || ''),
      action: () => {}, // Already on admin page
      isCurrent: true,
    },
    {
      id: 'logout',
      label: 'Logout',
      emoji: '🚪',
      action: handleLogout,
      isDanger: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!user || !adminStatus?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">You don't have admin privileges.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-orange-500 text-white font-semibold rounded-lg hover:bg-orange-600 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-4 py-6 relative overflow-x-hidden">
      {/* Menu */}
      <MenuDropdown options={menuOptions} />

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-orange-500 mb-4" style={{ letterSpacing: 0.5 }}>
            Admin Dashboard {getAdminIcon(adminStatus.adminLevel || '')}
          </h1>
          <p className="text-lg text-gray-600">
            Conference Management Panel
          </p>
          <div className="mt-2 text-sm text-gray-500">
            Admin Level: {adminStatus.adminLevel?.replace('_', ' ').toUpperCase()}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', emoji: '📊' },
              { id: 'users', label: 'Users', emoji: '👥' },
              { id: 'booths', label: 'Booths', emoji: '🏢' },
              { id: 'settings', label: 'Settings', emoji: '⚙️' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="mr-2">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 bg-white/80 rounded-xl p-6 shadow-lg">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">📊 Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">0</div>
                  <div className="text-sm text-blue-600">Total Users</div>
                </div>
                <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                  <div className="text-3xl font-bold text-green-600">0</div>
                  <div className="text-sm text-green-600">Completed All Booths</div>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg border border-purple-200">
                  <div className="text-3xl font-bold text-purple-600">0%</div>
                  <div className="text-sm text-purple-600">Completion Rate</div>
                </div>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Coming Soon:</strong> Real-time statistics and analytics will be displayed here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">👥 Users</h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Coming Soon:</strong> User management, search, and export functionality will be available here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'booths' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">🏢 Booths</h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Coming Soon:</strong> Booth statistics, analytics, and management features will be implemented here.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">⚙️ Settings</h2>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-yellow-800">
                  <strong>Coming Soon:</strong> Admin management, system settings, and data export options will be available here.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 