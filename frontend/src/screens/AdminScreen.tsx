"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import BoothForm from "@/components/BoothForm";
import BoothCard from "@/components/BoothCard";
import BoothModal from "@/components/BoothModal";

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

interface Booth {
  id: number;
  name: string;
  phrase: string;
  description?: string;
  location?: string;
  total_visits: number;
}

const AdminScreen: React.FC = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBoothForm, setShowBoothForm] = useState(false);
  const [isCreatingBooth, setIsCreatingBooth] = useState(false);
  const [boothMessage, setBoothMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [booths, setBooths] = useState<Booth[]>([]);
  const [isLoadingBooths, setIsLoadingBooths] = useState(false);
  const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  // Fetch booths when booths tab is active
  useEffect(() => {
    if (activeTab === 'booths') {
      fetchBooths();
    }
  }, [activeTab]);

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

  const handleCreateBooth = async (data: { name: string; phrase: string }) => {
    setIsCreatingBooth(true);
    setBoothMessage(null);
    
    try {
      const response = await fetch('/api/registerBooth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setBoothMessage({ type: 'success', text: 'Booth created successfully!' });
        setShowBoothForm(false);
        // Refresh booths list
        fetchBooths();
        // Clear message after 3 seconds
        setTimeout(() => setBoothMessage(null), 3000);
      } else {
        setBoothMessage({ type: 'error', text: result.error || 'Failed to create booth' });
      }
    } catch (error) {
      console.error('Error creating booth:', error);
      setBoothMessage({ type: 'error', text: 'An error occurred while creating the booth' });
    } finally {
      setIsCreatingBooth(false);
    }
  };

  const fetchBooths = async () => {
    setIsLoadingBooths(true);
    try {
      const response = await fetch('/api/getBooths');
      const data = await response.json();

      if (response.ok) {
        setBooths(data.booths || []);
      } else {
        console.error('Failed to fetch booths:', data.error);
      }
    } catch (error) {
      console.error('Error fetching booths:', error);
    } finally {
      setIsLoadingBooths(false);
    }
  };

  const handleUpdateBooth = async (boothId: number, data: { name: string; phrase: string }) => {
    try {
      const response = await fetch('/api/updateBooth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ boothId, ...data }),
      });

      const result = await response.json();

      if (response.ok) {
        // Refresh booths list
        fetchBooths();
        return result;
      } else {
        throw new Error(result.error || 'Failed to update booth');
      }
    } catch (error) {
      console.error('Error updating booth:', error);
      throw error;
    }
  };

  const handleBoothClick = (booth: Booth) => {
    setSelectedBooth(booth);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedBooth(null);
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
              <div className="space-y-6">
                {/* Header */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-800 mb-2">🏢 Booth Management</h3>
                  <p className="text-gray-600 mb-4">Create and manage conference booths</p>
                  <button
                    onClick={() => setShowBoothForm(!showBoothForm)}
                    className="px-3 py-1.5 text-sm border border-blue-300 text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    {showBoothForm ? 'Cancel' : '+ Add Booth'}
                  </button>
                </div>

                {/* Success/Error Message */}
                {boothMessage && (
                  <div className={`p-4 rounded-md ${
                    boothMessage.type === 'success' 
                      ? 'bg-green-50 border border-green-200 text-green-800' 
                      : 'bg-red-50 border border-red-200 text-red-800'
                  }`}>
                    {boothMessage.text}
                  </div>
                )}

                {/* Booth Creation Form */}
                {showBoothForm && (
                  <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Create New Booth</h4>
                    <BoothForm
                      onSubmit={handleCreateBooth}
                      isLoading={isCreatingBooth}
                      onCancel={() => setShowBoothForm(false)}
                    />
                  </div>
                )}

                {/* Booth List */}
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Existing Booths</h4>
                  
                  {isLoadingBooths ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-gray-500">Loading booths...</p>
                    </div>
                  ) : booths.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {booths.map((booth) => (
                        <BoothCard
                          key={booth.id}
                          booth={booth}
                          onClick={handleBoothClick}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-4xl mb-2">📋</div>
                      <p>No booths found</p>
                      <p className="text-sm mt-1">Create your first booth using the form above</p>
                    </div>
                  )}
                </div>
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
      
      {/* Booth Modal */}
      <BoothModal
        booth={selectedBooth}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUpdate={handleUpdateBooth}
      />
    </div>
  );
};

export default AdminScreen; 