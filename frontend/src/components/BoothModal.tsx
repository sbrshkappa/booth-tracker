'use client'

import { useState, useEffect } from 'react'
import BoothForm from './BoothForm'
import { Booth } from '@/utils/types'

interface BoothModalProps {
  booth: Booth | null
  isOpen: boolean
  onClose: () => void
  onUpdate: (boothId: number, data: { name: string; phrase: string }) => Promise<void>
}

export default function BoothModal({ booth, isOpen, onClose, onUpdate }: BoothModalProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    if (isOpen) {
      setIsEditing(false)
      setMessage(null)
    }
  }, [isOpen])

  const handleUpdate = async (data: { name: string; phrase: string }) => {
    if (!booth) return
    
    setIsUpdating(true)
    setMessage(null)
    
    try {
      await onUpdate(booth.id, data)
      setMessage({ type: 'success', text: 'Booth updated successfully!' })
      setIsEditing(false)
      setTimeout(() => setMessage(null), 3000)
    } catch {
      setMessage({ type: 'error', text: 'Failed to update booth' })
    } finally {
      setIsUpdating(false)
    }
  }

  if (!isOpen || !booth) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-[150]">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            {isEditing ? 'Edit Booth' : 'Booth Details'}
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
          {message && (
            <div className={`p-4 rounded-md mb-4 ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {message.text}
            </div>
          )}

          {isEditing ? (
            <BoothForm
              onSubmit={handleUpdate}
              isLoading={isUpdating}
              onCancel={() => setIsEditing(false)}
              initialData={{ name: booth.name, phrase: booth.phrase }}
            />
          ) : (
            <div className="space-y-6">
              {/* Booth Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booth Name</label>
                  <p className="text-gray-900 font-medium">{booth.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Booth ID</label>
                  <p className="text-gray-900 font-mono">#{booth.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phrase</label>
                  <p className="text-gray-900 font-mono bg-gray-50 p-2 rounded">"{booth.phrase}"</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Visits</label>
                  <p className="text-blue-600 font-bold text-lg">{booth.total_visits}</p>
                </div>
                {booth.description && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <p className="text-gray-900">{booth.description}</p>
                  </div>
                )}
                {booth.location && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <p className="text-gray-900">📍 {booth.location}</p>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Edit Booth
                </button>
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 