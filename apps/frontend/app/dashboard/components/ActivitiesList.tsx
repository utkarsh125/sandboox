"use client"
import React from 'react'
import {
    PaintBrush,
    Rocket,
    Bug,
    PencilSimple,
    Trash
} from '@phosphor-icons/react'

interface Activity {
    id: string
    icon: 'style' | 'release' | 'bug' | 'edit' | 'delete'
    iconColor: string
    message: string
    time: string
}

interface ActivitiesListProps {
    activities: Activity[]
}

const iconMap = {
    style: PaintBrush,
    release: Rocket,
    bug: Bug,
    edit: PencilSimple,
    delete: Trash
}

const ActivitiesList: React.FC<ActivitiesListProps> = ({ activities }) => {
    return (
        <div className="space-y-3">
            {activities.map((activity) => {
                const Icon = iconMap[activity.icon]

                return (
                    <div key={activity.id} className="flex items-start gap-3">
                        <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white mt-0.5"
                            style={{ backgroundColor: activity.iconColor }}
                        >
                            <Icon size={14} weight="bold" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{activity.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default ActivitiesList
