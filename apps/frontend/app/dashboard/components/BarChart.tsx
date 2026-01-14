"use client"
import React from 'react'

interface BarData {
    label: string
    values: number[]
    colors?: string[]
}

interface BarChartProps {
    data: BarData[]
    height?: number
    barWidth?: number
    showValues?: boolean
}

const BarChart: React.FC<BarChartProps> = ({
    data,
    height = 200,
    barWidth = 20,
    showValues = false
}) => {
    const allValues = data.flatMap(d => d.values)
    const maxValue = Math.max(...allValues)

    // Default colors for stacked bars
    const defaultColors = ['#1e293b', '#3b82f6', '#60a5fa', '#93c5fd', '#c7d2fe']

    // Y-axis labels
    const yLabels = [0, 10000, 20000, 30000].reverse()

    return (
        <div className="w-full">
            <div className="flex">
                {/* Y-axis labels */}
                <div className="flex flex-col justify-between pr-3 text-xs text-gray-400" style={{ height }}>
                    {yLabels.map((label, index) => (
                        <span key={index}>{label >= 1000 ? `${label / 1000}K` : label}</span>
                    ))}
                </div>

                {/* Chart area */}
                <div className="flex-1 relative" style={{ height }}>
                    {/* Grid lines */}
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                        {yLabels.map((_, index) => (
                            <div key={index} className="border-b border-gray-100 w-full"></div>
                        ))}
                    </div>

                    {/* Bars */}
                    <div className="relative h-full flex items-end justify-around px-2">
                        {data.map((item, itemIndex) => (
                            <div
                                key={itemIndex}
                                className="flex flex-col items-center gap-1"
                            >
                                <div className="flex items-end gap-0.5">
                                    {item.values.map((value, valueIndex) => {
                                        const barHeight = (value / maxValue) * height
                                        const color = item.colors?.[valueIndex] || defaultColors[valueIndex % defaultColors.length]

                                        return (
                                            <div
                                                key={valueIndex}
                                                className="rounded-t transition-all hover:opacity-80"
                                                style={{
                                                    width: barWidth / item.values.length,
                                                    height: barHeight,
                                                    backgroundColor: color
                                                }}
                                            />
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* X-axis labels */}
            <div className="flex justify-around mt-2 pl-10 text-xs text-gray-400">
                {data.map((item, index) => (
                    <span key={index} className="text-center">{item.label}</span>
                ))}
            </div>
        </div>
    )
}

export default BarChart
