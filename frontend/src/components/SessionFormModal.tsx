'use client'

import { useState } from 'react'
import { SessionFormData } from '@/utils/types'

interface SessionFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: SessionFormData) => void
  isLoading?: boolean
  session?: SessionFormData | null
  isEditing?: boolean
}

export default function SessionFormModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  isLoading = false, 
  session = null,
  isEditing = false 
}: SessionFormModalProps) {
  const [formData, setFormData] = useState<SessionFormData>({
    day: session?.day || 1,
    start_time: session?.start_time || '',
    topic: session?.topic || '',
    speaker: session?.speaker || '',
    description: session?.description || '',
    type: session?.type || 'workshop',
    location: session?.location || '',
    room: session?.room || '',
    capacity: session?.capacity || undefined,
    is_children_friendly: session?.is_children_friendly || false,
    requires_registration: session?.requires_registration || false,
    tags: session?.tags || [],
    parent_session_id: session?.parent_session_id ?? null,
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    const newErrors: { [key: string]: string } = {}
    
    if (!formData.day || formData.day < 1 || formData.day > 3) {
      newErrors.day = 'Day must be between 1 and 3'
    }
    
    if (!formData.start_time.trim()) {
      newErrors.start_time = 'Start time is required'
    }
    
    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic is required'
    }
    
    if (!formData.type) {
      newErrors.type = 'Type is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit form
    onSubmit(formData)
  }

  const handleInputChange = (field: keyof SessionFormData, value: string | number | boolean | null | undefined) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-[150] p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit Session' : 'Create New Session'}
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="day" className="block text-sm font-medium text-gray-700 mb-1">
                  Day *
                </label>
                <select
                  id="day"
                  value={formData.day}
                  onChange={(e) => handleInputChange('day', parseInt(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.day ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value={1}>Day 1</option>
                  <option value={2}>Day 2</option>
                  <option value={3}>Day 3</option>
                </select>
                {errors.day && (
                  <p className="mt-1 text-sm text-red-600">{errors.day}</p>
                )}
              </div>

              <div>
                <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="start_time"
                  value={formData.start_time}
                  onChange={(e) => handleInputChange('start_time', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.start_time ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                />
                {errors.start_time && (
                  <p className="mt-1 text-sm text-red-600">{errors.start_time}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-1">
                Topic *
              </label>
              <input
                type="text"
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                  errors.topic ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter session topic"
                disabled={isLoading}
              />
              {errors.topic && (
                <p className="mt-1 text-sm text-red-600">{errors.topic}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="speaker" className="block text-sm font-medium text-gray-700 mb-1">
                  Speaker
                </label>
                <input
                  type="text"
                  id="speaker"
                  value={formData.speaker}
                  onChange={(e) => handleInputChange('speaker', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter speaker name"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                  Type *
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
                    errors.type ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={isLoading}
                >
                  <option value="workshop">Workshop</option>
                  <option value="keynote">Keynote</option>
                  <option value="panel">Panel</option>
                  <option value="networking">Networking</option>
                  <option value="breakout">Breakout</option>
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter session description"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter location"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-1">
                  Room
                </label>
                <input
                  type="text"
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange('room', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter room number"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                id="capacity"
                value={formData.capacity || ''}
                onChange={(e) => handleInputChange('capacity', e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                placeholder="Enter capacity"
                min="1"
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="parent_session_id" className="block text-sm font-medium text-gray-700 mb-1">
                  Parent Session ID
                </label>
                <input
                  type="number"
                  id="parent_session_id"
                  value={formData.parent_session_id ?? ''}
                  onChange={e => handleInputChange('parent_session_id', e.target.value === '' ? null : parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  placeholder="Enter parent session ID (optional)"
                  min="1"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_children_friendly"
                  checked={formData.is_children_friendly}
                  onChange={(e) => handleInputChange('is_children_friendly', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="is_children_friendly" className="ml-2 block text-sm text-gray-700">
                  Children Friendly
                </label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="requires_registration"
                  checked={formData.requires_registration}
                  onChange={(e) => handleInputChange('requires_registration', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  disabled={isLoading}
                />
                <label htmlFor="requires_registration" className="ml-2 block text-sm text-gray-700">
                  Requires Registration
                </label>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Session' : 'Create Session')}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 