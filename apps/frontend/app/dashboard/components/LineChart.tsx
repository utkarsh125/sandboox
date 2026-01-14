"use client"
import React from 'react'

interface DataPoint {
    label: string
    value: number
}

interface LineChartProps {
    data: DataPoint[]
    data2?: DataPoint[]
    height?: number
    showLegend?: boolean
    legend1?: string
    legend2?: string
}

const LineChart: React.FC<LineChartProps> = ({
    data,
    data2,
    height = 200,
    showLegend = true,
    legend1 = "This year",
    legend2 = "Last year"
}) => {
    const maxValue = Math.max(...data.map(d => d.value), ...(data2?.map(d => d.value) || []))
    const padding = { top: 20, right: 20, bottom: 30, left: 10 }
    const chartWidth = 100 // percentage
    const chartHeight = height - padding.top - padding.bottom

    // Generate Y-axis labels
    const yLabels = [0, 10000, 20000, 30000].reverse()

    // Generate path for line
    const generatePath = (points: DataPoint[]) => {
        const stepX = 100 / (points.length - 1)

        return points.map((point, index) => {
            const x = index * stepX
            const y = 100 - (point.value / maxValue) * 100
            return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
        }).join(' ')
    }

    // Generate smooth bezier curve path
    const generateSmoothPath = (points: DataPoint[]) => {
        if (points.length < 2) return ''

        const stepX = 100 / (points.length - 1)
        let path = ''

        points.forEach((point, index) => {
            const x = index * stepX
            const y = 100 - (point.value / maxValue) * 100

            if (index === 0) {
                path += `M ${x} ${y}`
            } else {
                const prevX = (index - 1) * stepX
                const prevY = 100 - (points[index - 1].value / maxValue) * 100
                const cpX1 = prevX + stepX / 3
                const cpX2 = x - stepX / 3
                path += ` C ${cpX1} ${prevY}, ${cpX2} ${y}, ${x} ${y}`
            }
        })

        return path
    }

    // Generate area path (for gradient fill)
    const generateAreaPath = (points: DataPoint[]) => {
        const linePath = generateSmoothPath(points)
        const stepX = 100 / (points.length - 1)
        const lastX = (points.length - 1) * stepX
        return `${linePath} L ${lastX} 100 L 0 100 Z`
    }

    return (
        <div className="w-full">
            {/* Legend */}
            {showLegend && (
                <div className="flex items-center gap-6 mb-4">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gray-900"></span>
                        <span className="text-sm text-gray-600">{legend1}</span>
                    </div>
                    {data2 && (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-blue-300"></span>
                            <span className="text-sm text-gray-600">{legend2}</span>
                        </div>
                    )}
                </div>
            )}

            <div className="flex">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between pr-3 text-xs text-gray-400" style={{ height: chartHeight }}>
                    {yLabels.map((label, index) => (
                        <span key={index}>{label >= 1000 ? `${label / 1000}K` : label}</span>
                    ))}
                </div>

                {/* Chart */}
                <div className="flex-1 relative" style={{ height: chartHeight }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between">
                        {yLabels.map((_, index) => (
                            <div key={index} className="border-b border-gray-100 w-full"></div>
                        ))}
                    </div>

                    {/* SVG Chart */}
                    <svg
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                        className="absolute inset-0 w-full h-full"
                    >
                        <defs>
                            <linearGradient id="areaGradient1" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(59, 130, 246)" stopOpacity="0.1" />
                                <stop offset="100%" stopColor="rgb(59, 130, 246)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="areaGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="rgb(147, 197, 253)" stopOpacity="0.2" />
                                <stop offset="100%" stopColor="rgb(147, 197, 253)" stopOpacity="0" />
                            </linearGradient>
                        </defs>

                        {/* Area fills */}
                        <path
                            d={generateAreaPath(data)}
                            fill="url(#areaGradient1)"
                        />
                        {data2 && (
                            <path
                                d={generateAreaPath(data2)}
                                fill="url(#areaGradient2)"
                            />
                        )}

                        {/* Lines */}
                        <path
                            d={generateSmoothPath(data)}
                            fill="none"
                            stroke="rgb(17, 24, 39)"
                            strokeWidth="0.5"
                        />
                        {data2 && (
                            <path
                                d={generateSmoothPath(data2)}
                                fill="none"
                                stroke="rgb(147, 197, 253)"
                                strokeWidth="0.5"
                                strokeDasharray="2,1"
                            />
                        )}
                    </svg>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-between mt-2 pl-10 text-xs text-gray-400">
                {data.map((point, index) => (
                    <span key={index}>{point.label}</span>
                ))}
            </div>
        </div>
    )
}

export default LineChart
