'use client'

import { UserWithAdmin } from '@/utils/types'

interface UserModalProps {
  user: UserWithAdmin | null
  isOpen: boolean
  onClose: () => void
}

export default function UserModal({ user, isOpen, onClose }: UserModalProps) {
  if (!isOpen || !user) return null

  const formatName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            User Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-6">
            {/* User Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User ID</label>
                <p className="text-gray-900 font-mono">#{user.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <p className="text-gray-900 font-medium">
                  {formatName(user.firstName)} {formatName(user.lastName)}
                  {user.is_admin && (
                    <span className="ml-2 text-yellow-500" title={user.admin_level_name || 'Admin'}>
                      ⭐
                    </span>
                  )}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Badge Number</label>
                <p className="text-gray-900 font-mono">{user.badgeNumber || 'Not assigned'}</p>
              </div>
              {user.is_admin && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Admin Level</label>
                  <p className="text-orange-600 font-medium">{user.admin_level_name || 'Unknown'}</p>
                </div>
              )}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Joined</label>
                <p className="text-gray-900">{formatDate(user.created_at)}</p>
              </div>
            </div>

            {/* Admin Status */}
            {user.is_admin && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <span className="text-orange-600 mr-2">⭐</span>
                  <div>
                    <h3 className="font-medium text-orange-800">Admin User</h3>
                    <p className="text-sm text-orange-700">
                      This user has administrative privileges with level: {user.admin_level_name}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 