"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import MenuDropdown from "@/components/MenuDropdown";
// import BoothForm from "@/components/BoothForm";
// import BoothCard from "@/components/BoothCard";
// import BoothModal from "@/components/BoothModal";
import AdminSessionModal from "@/components/AdminSessionModal";
import UserModal from "@/components/UserModal";
import UserForm from "@/components/UserForm";
import SessionFormModal from "@/components/SessionFormModal";
import { AdminStatus, getAdminIcon } from "@/utils/admin";
import { User, Session, AdminMetrics, SessionFormData, PopularSessionType, UserWithAdmin } from "@/utils/types";
import { createMenuOptions } from "@/utils/menu";
import { getUserFromStorage, checkAdminStatus, handleLogout } from "@/utils/auth";
import { LoadingScreen, LoadingSpinner } from "@/utils/ui";
import BackgroundImage from '@/components/BackgroundImage';
import Logo from '@/components/Logo';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { getSessionTypeColor } from '@/utils/theme';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  // const [showBoothForm, setShowBoothForm] = useState(false);
  // const [isCreatingBooth, setIsCreatingBooth] = useState(false);
  // const [boothMessage, setBoothMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // const [booths, setBooths] = useState<Booth[]>([]);
  // const [isLoadingBooths, setIsLoadingBooths] = useState(false);
  // const [selectedBooth, setSelectedBooth] = useState<Booth | null>(null);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Sessions state
  const [showSessionForm, setShowSessionForm] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [isEditingSession, setIsEditingSession] = useState(false);
  const [isSessionLoading, setIsSessionLoading] = useState(false);
  const [sessionTypeFilter, setSessionTypeFilter] = useState<string>('all');
  
  // Users state
  const [users, setUsers] = useState<UserWithAdmin[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithAdmin | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userMessage, setUserMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showAdminUsersOnly, setShowAdminUsersOnly] = useState(false);
  
  // Admin metrics state
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(false);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  // Collapsible state for overview sections
  // const [isBoothsCollapsed, setIsBoothsCollapsed] = useState(false);
  const [isSessionTypesCollapsed, setIsSessionTypesCollapsed] = useState(false);

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
    // if (activeTab === 'booths') {
    //   fetchBooths();
    // } else 
    if (activeTab === 'sessions') {
      fetchSessions();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'overview') {
      fetchAdminMetrics();
    }
  }, [activeTab]);

  const handleLogoutClick = () => handleLogout(router);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await fetch('/api/getSessions');
      const data = await response.json();
      
      if (response.ok) {
        setSessions(data.sessions || []);
      } else {
        console.error('Failed to fetch sessions:', data.error);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // const fetchBooths = async () => {
  //   setIsLoadingBooths(true);
  //   try {
  //     const response = await fetch('/api/getBooths');
  //     const data = await response.json();
      
  //     if (response.ok) {
  //       setBooths(data.booths || []);
  //     } else {
  //       console.error('Failed to fetch booths:', data.error);
  //     }
  //   } catch (err) {
  //     console.error('Error fetching booths:', err);
  //   } finally {
  //     setIsLoadingBooths(false);
  //   }
  // };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await fetch('/api/getAllUsers');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', data.error);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchAdminMetrics = async () => {
    setIsLoadingMetrics(true);
    setMetricsError(null);
    
    try {
      const response = await fetch('/api/getAdminMetrics');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch metrics');
      }
      
      setMetrics(data.data);
    } catch (error) {
      console.error('Error fetching admin metrics:', error);
      setMetricsError(error instanceof Error ? error.message : 'Failed to fetch metrics');
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  // const handleCreateBooth = async (boothData: { name: string; phrase: string; description?: string }) => {
  //   if (!user?.email) return;
    
  //   setIsCreatingBooth(true);
  //   setBoothMessage(null);
    
  //   try {
  //     const response = await fetch('/api/registerBooth', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         ...boothData,
  //         userEmail: user.email,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || 'Failed to create booth');
  //     }

  //     setBoothMessage({ type: 'success', text: 'Booth created successfully!' });
  //     setShowBoothForm(false);
      
  //     // Refresh booths list
  //     setTimeout(() => {
  //       fetchBooths();
  //     }, 1000);
  //   } catch (err) {
  //     setBoothMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create booth' });
  //   } finally {
  //     setIsCreatingBooth(false);
  //   }
  // };

  // const handleUpdateBooth = async (boothId: number, boothData: { name: string; phrase: string; description?: string }) => {
  //   if (!user?.email) return;
    
  //   try {
  //     const response = await fetch('/api/updateBooth', {
  //       method: 'PUT',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({
  //         boothId,
  //         ...boothData,
  //         userEmail: user.email,
  //       }),
  //     });

  //     const data = await response.json();

  //     if (!response.ok) {
  //       throw new Error(data.error || 'Failed to update booth');
  //     }

  //     // Update local state
  //     setBooths(prev => prev.map(booth => 
  //       booth.id === boothId 
  //         ? { ...booth, name: boothData.name, phrase: boothData.phrase, description: boothData.description }
  //         : booth
  //     ));

  //     return Promise.resolve();
  //   } catch (err) {
  //     return Promise.reject(err);
  //   }
  // };

  // const handleBoothCardClick = (booth: Booth) => {
  //   setSelectedBooth(booth);
  //   setIsModalOpen(true);
  // };

  const handleCreateSession = async (sessionData: SessionFormData) => {
    if (!user?.email) return;
    
    setIsCreatingSession(true);
    
    try {
      const requestBody = {
        ...sessionData,
        userEmail: user.email,
      };
      
      console.log('Sending session data:', requestBody);
      
      const response = await fetch('/api/createSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('Response from createSession API:', { status: response.status, data });

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create session');
      }

      setShowSessionForm(false);
      
      // Refresh sessions list
      setTimeout(() => {
        fetchSessions();
      }, 1000);
    } catch (err) {
      console.error('Error creating session:', err);
      throw err;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleUpdateSession = async (sessionId: number, sessionData: SessionFormData) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/updateSession', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          ...sessionData,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update session');
      }

      // Update local state
      setSessions(prev => prev.map(session => 
        session.id === sessionId 
          ? { ...session, ...sessionData }
          : session
      ));

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleDeleteSession = async (sessionId: number) => {
    if (!user?.email) return;
    
    try {
      const response = await fetch('/api/deleteSession', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete session');
      }

      // Remove from local state
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      setIsSessionModalOpen(false);
      setSelectedSession(null);

      // Refresh sessions list to ensure sync with database
      setTimeout(() => {
        fetchSessions();
      }, 500);

      return Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  const handleSessionCardClick = (session: Session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const handleUserCardClick = (user: UserWithAdmin) => {
    setSelectedUser(user);
    setIsUserModalOpen(true);
  };

  const handleCreateUser = async (userData: { email: string; firstName: string; lastName: string; badgeNumber: string }) => {
    if (!user?.email) return;
    
    setIsCreatingUser(true);
    setUserMessage(null);
    
    try {
      const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...userData,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      setUserMessage({ type: 'success', text: 'User created successfully!' });
      setShowUserForm(false);
      
      // Refresh users list
      setTimeout(() => {
        fetchUsers();
      }, 1000);
    } catch (err) {
      setUserMessage({ type: 'error', text: err instanceof Error ? err.message : 'Failed to create user' });
    } finally {
      setIsCreatingUser(false);
    }
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
          <Logo />
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
          <div className="bg-gray-100 rounded-lg p-1 flex flex-nowrap justify-center">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'overview'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overview
            </button>
            {/* <button
              onClick={() => setActiveTab('booths')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'booths'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Booths
            </button> */}
            <button
              onClick={() => setActiveTab('sessions')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'sessions'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Sessions
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md font-medium transition-colors text-sm ${
                activeTab === 'users'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Users
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="bg-white/80 rounded-xl p-8 shadow-lg overflow-y-auto max-h-[calc(100vh-200px)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">Admin Overview</h2>
              <button
                onClick={fetchAdminMetrics}
                disabled={isLoadingMetrics}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Refresh metrics"
              >
                <ArrowPathIcon className={`w-5 h-5 ${isLoadingMetrics ? 'animate-spin' : ''}`} />
              </button>
            </div>
            
            {isLoadingMetrics ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : metricsError ? (
              <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-md">
                <p className="font-semibold">Error loading metrics:</p>
                <p>{metricsError}</p>
                <button 
                  onClick={fetchAdminMetrics}
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            ) : metrics ? (
              <div className="space-y-8">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-blue-800 mb-2">Total Users</h3>
                    <p className="text-3xl font-bold text-blue-600">{metrics.totalUsers}</p>
                    <p className="text-sm text-blue-600 mt-1">Registered</p>
                  </div>
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Completion Rate</h3>
                    <p className="text-3xl font-bold text-green-600">{metrics.completionRate}%</p>
                    <p className="text-sm text-green-600 mt-1">{metrics.completedUsers} completed</p>
                  </div>
                  <div className="bg-purple-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-purple-800 mb-2">Active Users</h3>
                    <p className="text-3xl font-bold text-purple-600">{metrics.activeRate}%</p>
                    <p className="text-sm text-purple-600 mt-1">{metrics.activeUsers} active</p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-800 mb-2">Total Sessions</h3>
                    <p className="text-3xl font-bold text-orange-600">{metrics.totalSessions}</p>
                    <p className="text-sm text-orange-600 mt-1">Scheduled</p>
                  </div>
                </div>

                {/* Popular Booths - DISABLED */}
                {/* <div className="bg-gray-50 p-6 rounded-lg">
                  <button
                    className="flex items-center w-full text-left focus:outline-none"
                    onClick={() => setIsBoothsCollapsed((prev) => !prev)}
                    aria-expanded={!isBoothsCollapsed}
                  >
                    {isBoothsCollapsed ? (
                      <ChevronRightIcon className="w-5 h-5 mr-2 text-orange-600" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 mr-2 text-orange-600" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-800 mb-0">Most Popular Booths</h3>
                  </button>
                  {!isBoothsCollapsed && (
                    metrics.popularBooths && metrics.popularBooths.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {metrics.popularBooths.map((booth: PopularBooth, index: number) => (
                          <div key={booth.name} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-orange-600 mr-3">#{index + 1}</span>
                              <span className="font-medium text-gray-800">{booth.name}</span>
                            </div>
                            <span className="text-sm text-gray-600">{booth.visits} visits</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4 mt-4">No booth visit data available</p>
                    )
                  )}
                </div> */}

                {/* Popular Session Types */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <button
                    className="flex items-center w-full text-left focus:outline-none"
                    onClick={() => setIsSessionTypesCollapsed((prev) => !prev)}
                    aria-expanded={!isSessionTypesCollapsed}
                  >
                    {isSessionTypesCollapsed ? (
                      <ChevronRightIcon className="w-5 h-5 mr-2 text-purple-600" />
                    ) : (
                      <ChevronDownIcon className="w-5 h-5 mr-2 text-purple-600" />
                    )}
                    <h3 className="text-xl font-semibold text-gray-800 mb-0">Session Types Distribution</h3>
                  </button>
                  {!isSessionTypesCollapsed && (
                    metrics.popularSessionTypes && metrics.popularSessionTypes.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {metrics.popularSessionTypes.map((sessionType: PopularSessionType, index: number) => (
                          <div key={sessionType.type} className="flex items-center justify-between bg-white p-3 rounded-lg">
                            <div className="flex items-center">
                              <span className="text-lg font-bold text-purple-600 mr-3">#{index + 1}</span>
                              <span className="font-medium text-gray-800 capitalize">{sessionType.type.replace('_', ' ')}</span>
                            </div>
                            <span className="text-sm text-gray-600">{sessionType.count} sessions</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 text-center py-4 mt-4">No session data available</p>
                    )
                  )}
                </div>

                {/* Admin Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-indigo-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-indigo-800 mb-2">Admin Level</h3>
                    <p className="text-lg font-medium text-indigo-600 capitalize">
                      {adminStatus.adminLevel?.replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                  <div className="bg-teal-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-teal-800 mb-2">User ID</h3>
                    <p className="text-lg font-medium text-teal-600">#{adminStatus.userId}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">No metrics available</p>
              </div>
            )}
          </div>
        )}

        {/* {activeTab === 'booths' && (
          <div className="flex-1 flex flex-col min-h-0">
            <div className="bg-white/80 rounded-xl p-6 shadow-lg flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">Manage Booths</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/fixBoothVisitCounts', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                        });
                        const data = await response.json();
                        if (response.ok) {
                          setBoothMessage({ type: 'success', text: data.message });
                          setTimeout(() => {
                            fetchBooths();
                          }, 1000);
                        } else {
                          setBoothMessage({ type: 'error', text: data.error || 'Failed to fix visit counts' });
                        }
                      } catch (err) {
                        setBoothMessage({ type: 'error', text: 'Failed to fix visit counts' });
                      }
                    }}
                    className="bg-blue-500 text-white px-3 py-2 rounded-lg font-medium hover:bg-blue-600 transition-colors text-sm"
                    title="Fix booth visit counts"
                  >
                    🔧 Fix Counts
                  </button>
                  <button
                    onClick={() => setShowBoothForm(!showBoothForm)}
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
                  >
                    {showBoothForm ? 'Cancel' : '+ Add Booth'}
                  </button>
                </div>
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
        )} */}

        {activeTab === 'sessions' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Sessions List */}
            <div className="bg-white/80 rounded-xl p-6 shadow-lg flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">All Sessions</h3>
                <div className="flex items-center gap-2">
                  {/* Session Type Filter */}
                  <select
                    value={sessionTypeFilter}
                    onChange={(e) => setSessionTypeFilter(e.target.value)}
                    className="px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 text-base max-h-32 overflow-y-auto"
                    size={1}
                  >
                    <option value="all">All Types</option>
                    <option value="workshop">Workshop</option>
                    <option value="keynote">Keynote</option>
                    <option value="panel">Panel</option>
                    <option value="networking">Networking</option>
                    <option value="talk">Talk</option>
                    <option value="q&a">Q&A</option>
                    <option value="opening_ceremony">Opening Ceremony</option>
                    <option value="closing_ceremony">Closing Ceremony</option>
                    <option value="award_ceremony">Award Ceremony</option>
                    <option value="devotional">Devotional</option>
                    <option value="address">Address</option>
                    <option value="welcome">Welcome</option>
                    <option value="fireside_chat">Fireside Chat</option>
                    <option value="interview">Interview</option>
                    <option value="debate">Debate</option>
                    <option value="roundtable">Roundtable</option>
                    <option value="demo">Demo</option>
                    <option value="poster_session">Poster Session</option>
                    <option value="performance">Performance</option>
                    <option value="video">Video</option>
                    <option value="exhibition">Exhibition</option>
                    <option value="wellness">Wellness</option>
                    <option value="registration">Registration</option>
                    <option value="lunch">Lunch</option>
                    <option value="dinner">Dinner</option>
                    <option value="break">Break</option>
                  </select>
                  
                  {/* Create Session Button */}
                  <button
                    onClick={() => setShowSessionForm(true)}
                    className="w-10 h-10 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center text-xl font-bold"
                    title="Create Session"
                  >
                    +
                  </button>
                  
                  {/* Refresh Button */}
                  <button
                    onClick={fetchSessions}
                    disabled={isLoadingSessions}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh sessions"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${isLoadingSessions ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
              
              {isLoadingSessions ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📅</div>
                  <p className="text-gray-600">No sessions found. Create your first session!</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sessions
                      .filter(session => sessionTypeFilter === 'all' || session.type === sessionTypeFilter)
                      .map((session) => (
                      <div
                        key={session.id}
                        onClick={() => handleSessionCardClick(session)}
                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-semibold text-gray-900 line-clamp-2">{session.topic}</h4>
                          <span className={`text-xs px-2 py-1 rounded-full border ${getSessionTypeColor(session.type)} ml-2 flex-shrink-0`}>
                            {session.type.replace('_', ' ')}
                          </span>
                        </div>
                        {session.speaker && (
                          <p className="text-sm text-gray-600 mb-2">by {session.speaker}</p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>Day {session.day}</span>
                          <span>•</span>
                          <span>{session.start_time}</span>
                          {session.room && (
                            <>
                              <span>•</span>
                              <span>{session.room}</span>
                            </>
                          )}
                        </div>
                        {session.is_children_friendly && (
                          <span className="inline-block mt-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                            Children Friendly
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Show message if no sessions match filter */}
                  {sessions.filter(session => sessionTypeFilter === 'all' || session.type === sessionTypeFilter).length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">🔍</div>
                      <p className="text-gray-600">No sessions found for the selected type.</p>
                      <p className="text-sm text-gray-500 mt-2">Try changing the filter or create a new session.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex-1 flex flex-col min-h-0">
            {/* Users List */}
            <div className="bg-white/80 rounded-xl p-6 shadow-lg flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-800">All Users</h3>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 mr-4">
                    <input
                      type="checkbox"
                      id="adminFilter"
                      checked={showAdminUsersOnly}
                      onChange={(e) => setShowAdminUsersOnly(e.target.checked)}
                      className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                    />
                    <label htmlFor="adminFilter" className="text-sm text-gray-700">
                      Show admins only
                    </label>
                  </div>
                  <button
                    onClick={() => setShowUserForm(!showUserForm)}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    {showUserForm ? 'Cancel' : 'Create User'}
                  </button>
                  <button
                    onClick={fetchUsers}
                    disabled={isLoadingUsers}
                    className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Refresh users"
                  >
                    <ArrowPathIcon className={`w-5 h-5 ${isLoadingUsers ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* User Creation Form */}
              {showUserForm && (
                <div className="mb-6">
                  <UserForm
                    onSubmit={handleCreateUser}
                    isLoading={isCreatingUser}
                    onCancel={() => setShowUserForm(false)}
                  />
                  {userMessage && (
                    <div className={`mt-4 p-3 rounded-md ${
                      userMessage.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {userMessage.text}
                    </div>
                  )}
                </div>
              )}

              {isLoadingUsers ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner size="lg" />
                </div>
              ) : users.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👥</div>
                  <p className="text-gray-600">No users found.</p>
                </div>
              ) : users.filter(user => !showAdminUsersOnly || user.is_admin).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">👑</div>
                  <p className="text-gray-600">No admin users found.</p>
                  <p className="text-sm text-gray-500 mt-2">Try unchecking the "Show admins only" filter.</p>
                </div>
              ) : (
                <div className="h-full overflow-y-auto pr-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {users
                      .filter(user => !showAdminUsersOnly || user.is_admin)
                      .map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleUserCardClick(user)}
                        className="bg-white rounded-lg border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-shadow relative"
                      >
                        {/* User ID in top right */}
                        <div className="absolute top-3 right-3">
                          <span className="text-xs text-gray-500 font-mono">#{user.id}</span>
                        </div>
                        
                        {/* User Info */}
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">
                              {user.firstName.charAt(0).toUpperCase() + user.firstName.slice(1).toLowerCase()}{' '}
                              {user.lastName.charAt(0).toUpperCase() + user.lastName.slice(1).toLowerCase()}
                            </span>
                            {user.is_admin && (
                              <span className="ml-2 text-yellow-500" title={user.admin_level_name || 'Admin'}>
                                ⭐
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Email */}
                        <p className="text-sm text-gray-600 mb-2">{user.email}</p>
                        
                        {/* Admin Level */}
                        {user.is_admin && user.admin_level_name && (
                          <p className="text-xs text-orange-600 font-medium mb-2">{user.admin_level_name}</p>
                        )}
                        
                        {/* Badge Number */}
                        {user.badgeNumber && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500">
                              Badge: <span className="font-mono">{user.badgeNumber}</span>
                            </p>
                          </div>
                        )}
                        
                        {/* Join Date */}
                        <p className="text-xs text-gray-500">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Booth Modal - DISABLED */}
      {/* <BoothModal
        booth={selectedBooth}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedBooth(null);
        }}
        onUpdate={handleUpdateBooth}
      /> */}

      {/* Admin Session Modal */}
      <AdminSessionModal
        session={selectedSession}
        isOpen={isSessionModalOpen}
        onClose={() => {
          setIsSessionModalOpen(false);
          setSelectedSession(null);
          setIsEditingSession(false);
        }}
        onEdit={async (sessionData) => {
          if (!selectedSession) return;
          setIsSessionLoading(true);
          try {
            await handleUpdateSession(selectedSession.id, sessionData);
            setSessions(prev =>
              prev.map(session =>
                session.id === selectedSession.id ? { ...session, ...sessionData } : session
              )
            );
            setSelectedSession(prev =>
              prev ? { ...prev, ...sessionData } : prev
            );
            setIsEditingSession(false);
          } catch (error) {
            console.error('Error updating session:', error);
          } finally {
            setIsSessionLoading(false);
          }
        }}
        onDelete={async () => {
          if (!selectedSession) return;
          try {
            await handleDeleteSession(selectedSession.id);
          } catch (error) {
            console.error('Error deleting session:', error);
          }
        }}
        isEditing={isEditingSession}
        isLoading={isSessionLoading}
        onSetEditing={setIsEditingSession}
      />

      {/* User Modal */}
      <UserModal
        user={selectedUser}
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setSelectedUser(null);
        }}
      />

      {/* Session Form Modal */}
      <SessionFormModal
        isOpen={showSessionForm}
        onClose={() => setShowSessionForm(false)}
        onSubmit={handleCreateSession}
        isLoading={isCreatingSession}
      />
    </div>
  );
}
