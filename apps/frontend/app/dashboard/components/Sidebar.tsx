"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
    SignOutIcon,
    SnowflakeIcon,
    CaretUpIcon,
    UserIcon,
    HouseIcon,
    FolderSimpleIcon,
    ChartPieSlice,
} from '@phosphor-icons/react'
import { signOut } from '@sandboox/auth/client'

interface NavItemProps {
    icon: React.ReactNode
    label: string
    href: string
    isActive?: boolean
    isCollapsed?: boolean
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive, isCollapsed }) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer"
    const activeClasses = isActive 
        ? "bg-[#BDF34E] text-black font-semibold shadow-[0_0_20px_rgba(189,243,78,0.2)]" 
        : "text-[#A1A1A1] hover:text-white hover:bg-white/5"

    return (
        <Link href={href} className={`${baseClasses} ${activeClasses} ${isCollapsed ? 'justify-center' : ''}`}>
            <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            {!isCollapsed && <span className="flex-1">{label}</span>}
        </Link>
    )
}

interface SidebarProps {
    isCollapsed: boolean
    setIsCollapsed: (collapsed: boolean) => void
}

const Sidebar: React.FC<SidebarProps> = ({ isCollapsed, setIsCollapsed }) => {
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
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-[#0D0D0D] border-r border-white/5 h-screen flex flex-col overflow-hidden transition-all duration-300 relative`}>
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
            <div className={`p-6 border-b border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#BDF34E] rounded-lg flex items-center justify-center shrink-0">
                        <SnowflakeIcon size={18} weight="bold" className="text-black" />
                    </div>
                    {!isCollapsed && <span className="font-bold text-lg tracking-tight text-white">Sandboox</span>}
                </div>
            </div>

            {/* Navigation */}
            <nav className={`flex-1 p-4 ${isCollapsed ? 'space-y-4' : 'space-y-8'}`}>
                {/* Navigation Section */}
                <div>
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">General</span>
                        </div>
                    )}
                    <div className="space-y-1">
                        <NavItem icon={<HouseIcon size={20} weight={pathname === '/dashboard' ? 'fill' : 'regular'} />} label="Overview" href="/dashboard" isActive={pathname === '/dashboard'} isCollapsed={isCollapsed} />
                        <NavItem icon={<FolderSimpleIcon size={20} weight={pathname === '/dashboard/projects' ? 'fill' : 'regular'} />} label="Projects" href="/dashboard/projects" isActive={pathname === '/dashboard/projects'} isCollapsed={isCollapsed} />
                        <NavItem icon={<ChartPieSlice size={20} weight={pathname === '/dashboard/reports' ? 'fill' : 'regular'} />} label="Reports" href="/dashboard/reports" isActive={pathname === '/dashboard/reports'} isCollapsed={isCollapsed} />
                    </div>
                </div>

                {/* Account Section */}
                <div>
                    {!isCollapsed && (
                        <div className="px-3 mb-3">
                            <span className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Settings</span>
                        </div>
                    )}
                    <div className="space-y-1 relative" ref={dropdownRef}>
                        <button
                            onClick={() => setAccountOpen(!accountOpen)}
                            className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-xl transition-all duration-200 cursor-pointer ${accountOpen ? 'bg-white/10 text-white' : 'text-[#A1A1A1] hover:text-white hover:bg-white/5'
                                } ${isCollapsed ? 'justify-center' : ''}`}
                        >
                            <span className="w-5 h-5 flex items-center justify-center shrink-0">
                                <UserIcon size={20} weight={accountOpen ? 'fill' : 'regular'} />
                            </span>
                            {!isCollapsed && <span className="flex-1 text-left">Account</span>}
                            {!isCollapsed && (
                                <CaretUpIcon
                                    size={14}
                                    className={`text-white/20 transition-transform ${accountOpen ? '' : 'rotate-180'}`}
                                />
                            )}
                        </button>

                        {/* Dropdown */}
                        {accountOpen && (
                            <div className={`dropdown-anim absolute ${isCollapsed ? 'left-full top-0 ml-3 w-48 bg-[#161616] border border-white/10 rounded-2xl shadow-2xl' : 'top-full left-0 w-full mt-2 bg-[#161616] border border-white/10 rounded-xl'} overflow-hidden z-30 p-1.5`}>
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
                                >
                                    <SignOutIcon size={18} weight="bold" />
                                    <span>Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Footer */}
            <div className={`p-6 border-t border-white/5 ${isCollapsed ? 'flex justify-center' : ''}`}>
                <div className="flex items-center gap-2 text-[10px] font-bold text-white/20 tracking-widest">
                    <SnowflakeIcon size={14} className="shrink-0" />
                    {!isCollapsed && <span>SANDBOOX</span>}
                </div>
            </div>
        </aside>
    )
}

export default Sidebar
