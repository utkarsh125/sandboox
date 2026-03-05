"use client"
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    House,
    FolderSimple,
    User,
    Snowflake
} from '@phosphor-icons/react'

interface NavItemProps {
    icon: React.ReactNode
    label: string
    href: string
    isActive?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive }) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer"
    const activeClasses = isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"

    return (
        <Link href={href} className={`${baseClasses} ${activeClasses}`}>
            <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            <span className="flex-1">{label}</span>
        </Link>
    )
}

const Sidebar: React.FC = () => {
    const pathname = usePathname()

    return (
        <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col overflow-y-auto">
            {/* Logo */}
            <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                        <Snowflake size={18} weight="bold" className="text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">Sandboox</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-6">
                {/* Navigation Section */}
                <div>
                    <div className="px-3 mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Overview</span>
                    </div>
                    <div className="space-y-0.5">
                        <NavItem icon={<House size={18} />} label="Overview" href="/dashboard" isActive={pathname === '/dashboard'} />
                        <NavItem icon={<FolderSimple size={18} />} label="Projects" href="/dashboard/projects" isActive={pathname === '/dashboard/projects'} />
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    <div className="px-3 mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Settings</span>
                    </div>
                    <div className="space-y-0.5">
                        <NavItem icon={<User size={18} />} label="Account" href="/dashboard/account" isActive={pathname === '/dashboard/account'} />
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Snowflake size={14} />
                    <span>SANDBOOX</span>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
