'use client'

import React from 'react'
import { Booth } from '@/utils/types'

interface BoothCardProps {
  booth: Booth
<<<<<<< HEAD
=======
  onClick?: (booth: Booth) => void
>>>>>>> feature/ui-improvements-and-session-enhancements
}

export default function BoothCard({ booth }: BoothCardProps) {
  return (
<<<<<<< HEAD
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
=======
    <div 
      className={`bg-white/90 border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
      onClick={() => onClick?.(booth)}
    >
>>>>>>> feature/ui-improvements-and-session-enhancements
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 mb-1">{booth.name}</h3>
          {booth.location && (
            <p className="text-sm text-gray-600 mb-1">📍 {booth.location}</p>
          )}
          <p className="text-xs text-gray-500">
            {booth.total_visits} visits
          </p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-[#fba758]/20 text-[#fba758] border border-[#fba758]/30">
          Booth
        </span>
      </div>
      {booth.description && (
        <p className="text-sm text-gray-700 mb-3">{booth.description}</p>
      )}
    </div>
  )
} 