'use client'

import { useState } from 'react'

interface UserFormProps {
  onSubmit: (data: { 
    email: string; 
    firstName: string; 
    lastName: string; 
    badgeNumber: string;
  }) => void
  isLoading?: boolean
  onCancel?: () => void
}

export default function UserForm({ onSubmit, isLoading = false, onCancel }: UserFormProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [badgeNumber, setBadgeNumber] = useState('')
  const [errors, setErrors] = useState<{ email?: string; firstName?: string; lastName?: string }>({})

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})
    
    // Validate form
    const newErrors: { email?: string; firstName?: string; lastName?: string } = {}
    
    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address'
    }
    
    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    
    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    
    // Submit form
    onSubmit({ 
      email: email.trim(), 
      firstName: firstName.trim(), 
      lastName: lastName.trim(), 
      badgeNumber: badgeNumber.trim()
    })
    
    // Clear form
    setEmail('')
    setFirstName('')
    setLastName('')
    setBadgeNumber('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.firstName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter first name"
            disabled={isLoading}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
              errors.lastName ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter last name"
            disabled={isLoading}
          />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter email address"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="badgeNumber" className="block text-sm font-medium text-gray-700 mb-1">
          Badge Number
        </label>
        <input
          type="text"
          id="badgeNumber"
          value={badgeNumber}
          onChange={(e) => setBadgeNumber(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
          placeholder="Enter badge number (optional)"
          disabled={isLoading}
        />
        <p className="mt-1 text-sm text-gray-500">
          Optional badge number for the user
        </p>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Creating...' : 'Create User'}
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