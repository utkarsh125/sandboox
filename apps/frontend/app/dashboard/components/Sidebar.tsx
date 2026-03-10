"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    House,
    FolderSimple,
    User,
    Snowflake,
    SignOut,
    CaretUp,
    SignOutIcon,
    SnowflakeIcon
} from '@phosphor-icons/react'
import { signOut } from '@sandboox/auth/client'

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
    const router = useRouter()
    const [accountOpen, setAccountOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setAccountOpen(false)
            }
        }
        if (accountOpen) {
            document.addEventListener('mousedown', handleClickOutside)
        }
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [accountOpen])

    const handleLogout = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push('/login')
                }
            }
        })
    }

    return (
        <aside className="w-64 bg-white border-r border-gray-100 h-screen flex flex-col overflow-y-auto">
            <style>{`
                @keyframes dropdownSlide {
                    from { opacity: 0; transform: translateY(-8px) scale(0.95); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
                .dropdown-anim {
                    animation: dropdownSlide 0.15s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    transform-origin: top;
                }
            `}</style>
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
                    <div className="space-y-0.5 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setAccountOpen(!accountOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${accountOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            <span className="w-5 h-5 flex items-center justify-center">
                                <User size={18} />
                            </span>
                            <span className="flex-1 text-left">Account</span>
                            <CaretUp
                                size={14}
                                className={`text-gray-400 transition-transform ${accountOpen ? '' : 'rotate-180'}`}
                            />
                        </button>

                        {/* Dropdown */}
                        {accountOpen && (
                            <div className="dropdown-anim absolute top-full left-0 w-full mt-0 overflow-hidden z-10 p-1">
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-400 hover:text-red-500 transition-colors cursor-pointer"
                                >
                                    <SignOutIcon size={16} weight="bold" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <SnowflakeIcon size={14} />
                    <span>SANDBOOX</span>
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
