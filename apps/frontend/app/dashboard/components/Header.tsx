"use client"
import React from 'react'
import {
    MagnifyingGlass,
    Sun,
    ClockCounterClockwise,
    Bell,
    Sidebar as SidebarIcon,
    Star,
    Command
} from '@phosphor-icons/react'

interface HeaderProps {
    title?: string
    breadcrumb?: string[]
}

const Header: React.FC<HeaderProps> = ({ title = "Default", breadcrumb = ["Dashboards", "Default"] }) => {
    return (
        <header className="bg-white border-b border-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
                {/* Left Side - Breadcrumb */}
                <div className="flex items-center gap-3">
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <SidebarIcon size={20} className="text-gray-500" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                        <Star size={20} className="text-gray-500" />
                    </button>
                    <div className="flex items-center gap-2 text-sm">
                        {breadcrumb.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span className="text-gray-300">/</span>}
                                <span className={index === breadcrumb.length - 1 ? "text-gray-900 font-medium" : "text-gray-500"}>
                                    {item}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right Side - Search & Actions */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-64">
                            <MagnifyingGlass size={18} className="text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search"
                                className="bg-transparent text-sm outline-none flex-1 placeholder:text-gray-400"
                            />
                            <div className="flex items-center gap-0.5 text-xs text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-200">
                                <Command size={12} />
                                <span>/</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Sun size={20} className="text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <ClockCounterClockwise size={20} className="text-gray-500" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors relative">
                        <Bell size={20} className="text-gray-500" />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <SidebarIcon size={20} className="text-gray-500" />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
