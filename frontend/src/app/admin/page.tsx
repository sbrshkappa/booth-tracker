"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
import BoothForm from "@/components/BoothForm";
import BoothCard from "@/components/BoothCard";
import BoothModal from "@/components/BoothModal";
import { AdminStatus, getAdminIcon } from "@/utils/admin";
import { User, Booth } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen, LoadingSpinner } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';

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
    const userObj = getUserFromStorage();
    if (!userObj) {
      router.push('/');
      return;
    }
    setUser(userObj);
    
    // Check admin status
    checkAdminStatus(userObj.email).then(setAdminStatus);
  }, [router]);

  useEffect(() => {
    if (activeTab === 'booths') {
      fetchBooths();
    }
  }, [activeTab]);

  const handleLogoutClick = () => handleLogout(router);

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
    } catch (err) {
      console.error('Error fetching booths:', err);
    } finally {
      setIsLoadingBooths(false);
    }
  };

  const handleCreateBooth = async (boothData: { name: string; phrase: string }) => {
    if (!user?.email) return;
    
    setIsCreatingBooth(true);
    setBoothMessage(null);
    
    try {
      const response = await fetch('/api/registerBooth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...boothData,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create booth');
      }

      setBoothMessage({ type: 'success', text: 'Booth created successfully!' });
      setShowBoothForm(false);
      
      // Refresh booths list
      setTimeout(() => {
        fetchBooths();
      }, 1000);
    } catch (err) {
      setBoothMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create booth' });
    } finally {
      setIsCreatingBooth(false);
    }
  };

  const handleUpdateBooth = async (boothId: number, boothData: { name: string; phrase: string }) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/updateBooth', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          boothId,
          ...boothData,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booth');
      }

      // Update local state
      setBooths(prev => prev.map(booth => 
        booth.id === boothId 
          ? { ...booth, name: boothData.name, phrase: boothData.phrase }
          : booth
      ));

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleBoothCardClick = (booth: Booth) => {
    setSelectedBooth(booth);
    setIsModalOpen(true);
  };

  const menuOptions = createMenuOptions({
    currentPage: 'admin',
    router,
    handleLogout: handleLogoutClick,
    adminStatus,
  });

  if (!user || !adminStatus) {
    return <LoadingScreen />;
  }

  if (!adminStatus.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access the admin panel.</p>
          <button
            onClick={() => router.push('/sessions')}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Sessions
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col px-4 py-6 relative overflow-hidden">
      <BackgroundImage />
      {/* Header with title and menu */}
      <div className="mb-6">
        {/* Top row: Logo and Menu */}
        <div className="flex justify-between items-center mb-4">
          <img 
            src="/assets/conference-companion.png" 
            alt="Conference Companion" 
            className="h-12 w-auto"
          />
          <MenuDropdown 
            options={menuOptions} 
            userName={`${user.firstName} ${user.lastName}`}
          />
        </div>
        
        {/* Bottom row: Title and subtitle */}
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold text-orange-500 mb-2" style={{ letterSpacing: 0.5 }}>
            Admin Panel {getAdminIcon(adminStatus.adminLevel || '')}
          </h1>
          <p className="text-lg text-gray-600">
            Manage booths and monitor user activity
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col w-full max-w-6xl mx-auto min-h-0">
        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'overview'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('booths')}
              className={`px-6 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'booths'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Booths
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/80 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Booths</h3>
                <p className="text-3xl font-bold text-blue-600">{booths.length}</p>
              </div>
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Admin Level</h3>
                <p className="text-lg font-medium text-green-600 capitalize">
                  {adminStatus.adminLevel?.replace('_', ' ') || 'Unknown'}
                </p>
              </div>
              <div className="bg-purple-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 mb-2">User ID</h3>
                <p className="text-lg font-medium text-purple-600">#{adminStatus.userId}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'booths' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Booths List */}
            <div className="bg-white/80 rounded-xl p-6 shadow-lg flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Manage Booths</h3>
                <button
                  onClick={() => setShowBoothForm(!showBoothForm)}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                >
                  {showBoothForm ? 'Cancel' : '+ Add Booth'}
                </button>
              </div>
              
              {boothMessage && (
                <div className={`p-4 rounded-md mb-4 ${
                  boothMessage.type === 'success' 
                    ? 'bg-green-50 border border-green-200 text-green-800' 
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  {boothMessage.text}
                </div>
              )}

              {showBoothForm && (
                <div className="border-t border-gray-200 pt-6 mb-6">
                  <BoothForm
                    onSubmit={handleCreateBooth}
                    isLoading={isCreatingBooth}
                    onCancel={() => setShowBoothForm(false)}
                  />
                </div>
              )}
              
              {isLoadingBooths ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : booths.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🏪</div>
                  <p className="text-gray-600">No booths found. Create your first booth!</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {booths.map((booth) => (
                      <BoothCard
                        key={booth.id}
                        booth={booth}
                        onClick={handleBoothCardClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booth Modal */}
      <BoothModal
        booth={selectedBooth}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooth(null);
        }}
        onUpdate={handleUpdateBooth}
      />
    </div>
  );
}
