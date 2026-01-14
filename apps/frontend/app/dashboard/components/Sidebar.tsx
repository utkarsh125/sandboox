"use client"
import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    House,
    FolderSimple,
    ShoppingCart,
    Briefcase,
    GraduationCap,
    User,
    FileText,
    Users,
    Buildings,
    Article,
    ShareNetwork,
    Star,
    Clock,
    CaretDown,
    CaretRight,
    Snowflake
} from '@phosphor-icons/react'

interface NavItemProps {
    icon: React.ReactNode
    label: string
    href?: string
    isActive?: boolean
    hasSubmenu?: boolean
    isExpanded?: boolean
    onClick?: () => void
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, href, isActive, hasSubmenu, isExpanded, onClick }) => {
    const baseClasses = "flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer"
    const activeClasses = isActive ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"

    const content = (
        <>
            <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
            <span className="flex-1">{label}</span>
            {hasSubmenu && (
                <span className="w-4 h-4">
                    {isExpanded ? <CaretDown size={14} /> : <CaretRight size={14} />}
                </span>
            )}
        </>
    )

    if (href) {
        return (
            <Link href={href} className={`${baseClasses} ${activeClasses}`}>
                {content}
            </Link>
        )
    }

    return (
        <div className={`${baseClasses} ${activeClasses}`} onClick={onClick}>
            {content}
        </div>
    )
}

interface SubNavItemProps {
    label: string
    href: string
    isActive?: boolean
}

const SubNavItem: React.FC<SubNavItemProps> = ({ label, href, isActive }) => {
    return (
        <Link
            href={href}
            className={`block pl-11 pr-3 py-2 text-sm rounded-lg transition-colors ${isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:bg-gray-50'
                }`}
        >
            {label}
        </Link>
    )
}

const Sidebar: React.FC = () => {
    const pathname = usePathname()
    const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
        userProfile: true
    })

    const toggleMenu = (menu: string) => {
        setExpandedMenus(prev => ({ ...prev, [menu]: !prev[menu] }))
    }

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
                {/* Favorites Section */}
                <div>
                    <div className="flex items-center gap-2 px-3 mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Favorites</span>
                        <Clock size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">Recently</span>
                    </div>
                    <div className="space-y-0.5">
                        <NavItem icon={<House size={18} />} label="Overview" href="/dashboard" isActive={pathname === '/dashboard'} />
                        <NavItem icon={<FolderSimple size={18} />} label="Projects" href="/dashboard/projects" isActive={pathname === '/dashboard/projects'} />
                    </div>
                </div>

                {/* Dashboards Section */}
                <div>
                    <div className="px-3 mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Dashboards</span>
                    </div>
                    <div className="space-y-0.5">
                        <NavItem icon={<House size={18} />} label="Overview" href="/dashboard" isActive={pathname === '/dashboard'} />
                        <NavItem icon={<ShoppingCart size={18} />} label="eCommerce" href="/dashboard/ecommerce" isActive={pathname === '/dashboard/ecommerce'} />
                        <NavItem icon={<Briefcase size={18} />} label="Projects" href="/dashboard/projects" isActive={pathname === '/dashboard/projects'} />
                        <NavItem icon={<GraduationCap size={18} />} label="Online Courses" href="/dashboard/courses" isActive={pathname === '/dashboard/courses'} />
                    </div>
                </div>

                {/* Pages Section */}
                <div>
                    <div className="px-3 mb-2">
                        <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pages</span>
                    </div>
                    <div className="space-y-0.5">
                        <NavItem
                            icon={<User size={18} />}
                            label="User Profile"
                            hasSubmenu
                            isExpanded={expandedMenus.userProfile}
                            onClick={() => toggleMenu('userProfile')}
                        />
                        {expandedMenus.userProfile && (
                            <div className="space-y-0.5">
                                <SubNavItem label="Overview" href="/dashboard/profile" isActive={pathname === '/dashboard/profile'} />
                                <SubNavItem label="Projects" href="/dashboard/profile/projects" isActive={pathname === '/dashboard/profile/projects'} />
                                <SubNavItem label="Campaigns" href="/dashboard/profile/campaigns" isActive={pathname === '/dashboard/profile/campaigns'} />
                                <SubNavItem label="Documents" href="/dashboard/profile/documents" isActive={pathname === '/dashboard/profile/documents'} />
                                <SubNavItem label="Followers" href="/dashboard/profile/followers" isActive={pathname === '/dashboard/profile/followers'} />
                            </div>
                        )}
                        <NavItem icon={<User size={18} />} label="Account" href="/dashboard/account" isActive={pathname === '/dashboard/account'} />
                        <NavItem icon={<Buildings size={18} />} label="Corporate" href="/dashboard/corporate" isActive={pathname === '/dashboard/corporate'} />
                        <NavItem icon={<Article size={18} />} label="Blog" href="/dashboard/blog" isActive={pathname === '/dashboard/blog'} />
                        <NavItem icon={<ShareNetwork size={18} />} label="Social" href="/dashboard/social" isActive={pathname === '/dashboard/social'} />
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
