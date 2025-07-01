'use client'

interface Booth {
  id: number
  name: string
  phrase: string
  description?: string
  location?: string
  total_visits: number
}

interface BoothCardProps {
  booth: Booth
  onClick: (booth: Booth) => void
}

export default function BoothCard({ booth, onClick }: BoothCardProps) {
  return (
    <div 
      onClick={() => onClick(booth)}
      className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
          {booth.name}
        </h3>
        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          #{booth.id}
        </div>
      </div>
      
      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
        {booth.description || 'No description available'}
      </p>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">{booth.total_visits}</div>
            <div className="text-xs text-gray-500">Visits</div>
          </div>
          {booth.location && (
            <div className="text-xs text-gray-500">
              📍 {booth.location}
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded font-mono">
          "{booth.phrase}"
        </div>
      </div>
    </div>
  )
} 