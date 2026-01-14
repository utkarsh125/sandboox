"use client"
import React from 'react'
import {
    CheckCircle,
    User,
    Bug,
    Heart
} from '@phosphor-icons/react'

interface Notification {
    id: string
    icon: 'check' | 'user' | 'bug' | 'heart'
    message: string
    time: string
}

interface NotificationsListProps {
    notifications: Notification[]
}

const iconMap = {
    check: CheckCircle,
    user: User,
    bug: Bug,
    heart: Heart
}

const iconColorMap = {
    check: 'text-green-500',
    user: 'text-blue-500',
    bug: 'text-red-500',
    heart: 'text-pink-500'
}

const NotificationsList: React.FC<NotificationsListProps> = ({ notifications }) => {
    return (
        <div className="space-y-3">
            {notifications.map((notification) => {
                const Icon = iconMap[notification.icon]
                const iconColor = iconColorMap[notification.icon]

                return (
                    <div key={notification.id} className="flex items-start gap-3">
                        <span className={`mt-0.5 ${iconColor}`}>
                            <Icon size={18} weight="fill" />
                        </span>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug">{notification.message}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{notification.time}</p>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}

export default NotificationsList
