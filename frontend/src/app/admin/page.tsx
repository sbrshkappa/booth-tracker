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

export default function AdminPage() {
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
    {
      id: 'admin',
      label: 'Admin Panel',
      emoji: getAdminIcon(adminStatus?.adminLevel || ''),
      action: () => {}, // Already on admin
      isCurrent: true,
      isAdmin: true,
    },
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
          <p className="text-gray-600">Access denied. Redirecting...</p>
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
      <div className="flex-1 flex flex-col w-full max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-1">
              Welcome, {getAdminLevelDisplay(adminStatus.adminLevel || '')}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'overview'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('booths')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'booths'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Booths
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">🏢</div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Booths</p>
                    <p className="text-2xl font-bold text-blue-900">{booths.length}</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">👥</div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Active Users</p>
                    <p className="text-2xl font-bold text-green-900">-</p>
                  </div>
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="text-2xl mr-3">📊</div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Total Visits</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {booths.reduce((sum, booth) => sum + booth.total_visits, 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booths' && (
          <div className="space-y-6">
            {/* Add Booth Section */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Manage Booths</h2>
                <button
                  onClick={() => setShowBoothForm(!showBoothForm)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  {showBoothForm ? '✕' : '➕'} Add Booth
                </button>
              </div>

              {/* Booth Form */}
              {showBoothForm && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <BoothForm
                    onSubmit={handleCreateBooth}
                    isLoading={isCreatingBooth}
                  />
                </div>
              )}

              {/* Message */}
              {boothMessage && (
                <div className={`mb-4 p-3 rounded-lg ${
                  boothMessage.type === 'success' 
                    ? 'bg-green-100 text-green-700 border border-green-200' 
                    : 'bg-red-100 text-red-700 border border-red-200'
                }`}>
                  {boothMessage.text}
                </div>
              )}

              {/* Booths List */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Existing Booths</h3>
                {isLoadingBooths ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-800"></div>
                    <span className="ml-2 text-gray-600">Loading booths...</span>
                  </div>
                ) : booths.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No booths found. Create your first booth above!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {booths.map((booth) => (
                      <BoothCard
                        key={booth.id}
                        booth={booth}
                        onClick={() => handleBoothClick(booth)}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Booth Modal */}
      {selectedBooth && (
        <BoothModal
          booth={selectedBooth}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onUpdate={handleUpdateBooth}
        />
      )}
    </div>
  );
}
