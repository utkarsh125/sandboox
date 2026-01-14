import React from 'react'
import { TrendUp, TrendDown } from '@phosphor-icons/react'

interface StatCardProps {
    label: string
    value: string | number
    change?: number
    changeLabel?: string
    variant?: 'default' | 'blue'
}

const StatCard: React.FC<StatCardProps> = ({
    label,
    value,
    change,
    changeLabel,
    variant = 'default'
}) => {
    const isPositive = change && change > 0
    const bgClass = variant === 'blue' ? 'bg-blue-50' : 'bg-white'
    const borderClass = variant === 'blue' ? 'border-blue-100' : 'border-gray-100'

    return (
        <div className={`${bgClass} border ${borderClass} rounded-2xl p-5 transition-all hover:shadow-sm`}>
            <div className="text-sm text-gray-500 mb-2">{label}</div>
            <div className="flex items-end justify-between">
                <div className="text-3xl font-semibold text-gray-900">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
                {change !== undefined && (
                    <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-500'}`}>
                        <span>{isPositive ? '+' : ''}{change}%</span>
                        {isPositive ? <TrendUp size={16} weight="bold" /> : <TrendDown size={16} weight="bold" />}
                    </div>
                )}
            </div>
        </div>
    )
}

export default StatCard
