"use client"
import React from 'react'

interface TrafficSource {
    name: string
    progress: number
    color?: string
}

interface TrafficByWebsiteProps {
    data: TrafficSource[]
}

const TrafficByWebsite: React.FC<TrafficByWebsiteProps> = ({ data }) => {
    return (
        <div className="space-y-3">
            {data.map((source, index) => (
                <div key={index} className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 w-20 truncate">{source.name}</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${source.progress}%`,
                                backgroundColor: source.color || '#1e293b'
                            }}
                        />
                    </div>
                </div>
            ))}
        </div>
    )
}

export default TrafficByWebsite
