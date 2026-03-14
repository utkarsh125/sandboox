"use client"
import React from 'react'
import { Sidebar } from './components'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-y-auto">
                {children}
            </div>
        </div>
    )
}
