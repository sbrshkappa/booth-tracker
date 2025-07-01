'use client'

import { useState, useEffect } from 'react'

interface BoothFormProps {
  onSubmit: (data: { name: string; phrase: string }) => void
  isLoading?: boolean
  onCancel?: () => void
  initialData?: { name: string; phrase: string }
}

export default function BoothForm({ onSubmit, isLoading = false, onCancel, initialData }: BoothFormProps) {
  const [name, setName] = useState(initialData?.name || '')
  const [phrase, setPhrase] = useState(initialData?.phrase || '')
  const [errors, setErrors] = useState<{ name?: string; phrase?: string }>({})

  // Update form when initialData changes
  useEffect(() => {
    if (initialData) {
      setName(initialData.name)
      setPhrase(initialData.phrase)
    }
  }, [initialData])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    const newErrors: { name?: string; phrase?: string } = {}
    
    if (!name.trim()) {
      newErrors.name = 'Booth name is required'
    }
    
    if (!phrase.trim()) {
      newErrors.phrase = 'Booth phrase is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit form
    onSubmit({ name: name.trim(), phrase: phrase.trim() })
    
    // Clear form
    setName('')
    setPhrase('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Booth Name *
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter booth name"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="phrase" className="block text-sm font-medium text-gray-700 mb-1">
          Booth Phrase *
        </label>
        <input
          type="text"
          id="phrase"
          value={phrase}
          onChange={(e) => setPhrase(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.phrase ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter booth phrase"
          disabled={isLoading}
        />
        {errors.phrase && (
          <p className="mt-1 text-sm text-red-600">{errors.phrase}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create Booth'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
} 