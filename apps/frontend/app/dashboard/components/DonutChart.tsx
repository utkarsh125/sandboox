"use client"
import React from 'react'

interface DonutSegment {
    label: string
    value: number
    color: string
}

interface DonutChartProps {
    data: DonutSegment[]
    size?: number
    strokeWidth?: number
    showLegend?: boolean
}

const DonutChart: React.FC<DonutChartProps> = ({
    data,
    size = 140,
    strokeWidth = 24,
    showLegend = true
}) => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const radius = (size - strokeWidth) / 2
    const circumference = 2 * Math.PI * radius
    const center = size / 2

    let cumulativeOffset = 0

    return (
        <div className="flex items-center gap-6">
            {/* Donut Chart */}
            <div className="relative" style={{ width: size, height: size }}>
                <svg width={size} height={size} className="-rotate-90">
                    {data.map((segment, index) => {
                        const percentage = segment.value / total
                        const strokeDasharray = `${circumference * percentage} ${circumference * (1 - percentage)}`
                        const strokeDashoffset = -circumference * cumulativeOffset

                        cumulativeOffset += percentage

                        return (
                            <circle
                                key={index}
                                cx={center}
                                cy={center}
                                r={radius}
                                fill="none"
                                stroke={segment.color}
                                strokeWidth={strokeWidth}
                                strokeDasharray={strokeDasharray}
                                strokeDashoffset={strokeDashoffset}
                                className="transition-all duration-300"
                            />
                        )
                    })}
                </svg>
            </div>

            {/* Legend */}
            {showLegend && (
                <div className="flex flex-col gap-2">
                    {data.map((segment, index) => (
                        <div key={index} className="flex items-center justify-between gap-4 min-w-[120px]">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: segment.color }}
                                />
                                <span className="text-sm text-gray-600">{segment.label}</span>
                            </div>
                            <span className="text-sm text-gray-900 font-medium">{segment.value}%</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default DonutChart
