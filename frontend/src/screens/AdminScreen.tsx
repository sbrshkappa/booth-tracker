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

const AdminScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
        
        // Redirect if not admin
        if (!data.isAdmin) {
          router.push('/dashboard');
        }
      }
    } catch (err) {
      console.error('Error checking admin status:', err);
      router.push('/dashboard');
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

  const getAdminLevelDisplay = (level: string) => {
    switch (level) {
      case 'super_admin': return 'Super Administrator';
      case 'conference_admin': return 'Conference Administrator';
      case 'booth_admin': return 'Booth Administrator';
      default: return 'User';
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
    ...(adminStatus?.isAdmin ? [{
      id: 'admin',
      label: 'Admin Panel',
      emoji: getAdminIcon(adminStatus.adminLevel || ''),
      action: () => router.push('/admin'),
      isAdmin: true,
      isCurrent: true,
    }] : []),
    {
      id: 'logout',
      label: 'Logout',
      emoji: '🚪',
      action: handleLogout,
      isDanger: true,
    },
  ];

  if (!user || !adminStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!adminStatus.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">Access Denied</h3>
          <p className="text-gray-500 mb-6">You don't have permission to access the admin panel.</p>
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
      <MenuDropdown 
        options={menuOptions} 
        userName={`${user.firstName} ${user.lastName}`}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-4" style={{ letterSpacing: 0.5 }}>
            Admin Panel {getAdminIcon(adminStatus.adminLevel || '')}
          </h1>
          <p className="text-lg text-gray-600">
            Welcome, {getAdminLevelDisplay(adminStatus.adminLevel || '')}
          </p>
        </div>

        {/* Admin Content */}
        <div className="flex-1 bg-white/80 rounded-xl p-6 shadow-lg">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'users'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              👥 Users
            </button>
            <button
              onClick={() => setActiveTab('booths')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'booths'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              🏢 Booths
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                activeTab === 'analytics'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              📈 Analytics
            </button>
          </div>

          {/* Tab Content */}
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">👥</div>
                      <div>
                        <h3 className="text-lg font-semibold text-blue-800">Total Users</h3>
                        <p className="text-2xl font-bold text-blue-600">0</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-6 rounded-xl border border-green-200">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">🏢</div>
                      <div>
                        <h3 className="text-lg font-semibold text-green-800">Total Booths</h3>
                        <p className="text-2xl font-bold text-green-600">0</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-6 rounded-xl border border-purple-200">
                    <div className="flex items-center">
                      <div className="text-3xl mr-4">📊</div>
                      <div>
                        <h3 className="text-lg font-semibold text-purple-800">Total Visits</h3>
                        <p className="text-2xl font-bold text-purple-600">0</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h3 className="text-xl font-semibold text-yellow-800 mb-4">🚧 Coming Soon</h3>
                  <p className="text-yellow-700">
                    The admin panel is currently under development. More features will be available soon, including:
                  </p>
                  <ul className="mt-4 space-y-2 text-yellow-700">
                    <li>• User management and analytics</li>
                    <li>• Booth configuration and monitoring</li>
                    <li>• Visit statistics and reports</li>
                    <li>• Real-time data export</li>
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">User Management</h3>
                <p className="text-gray-500">User management features coming soon!</p>
              </div>
            )}

            {activeTab === 'booths' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Booth Management</h3>
                <p className="text-gray-500">Booth configuration features coming soon!</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Analytics Dashboard</h3>
                <p className="text-gray-500">Advanced analytics and reporting coming soon!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminScreen; 