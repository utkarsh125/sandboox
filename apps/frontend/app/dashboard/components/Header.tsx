"use client"
import React from 'react'
import {
    MagnifyingGlass,
    Sun,
    ClockCounterClockwise,
    Bell,
    Sidebar as SidebarIcon,
    Star,
    Command,
    UserIcon
} from '@phosphor-icons/react'

interface HeaderProps {
    title?: string
    breadcrumb?: string[]
}

const Header: React.FC<HeaderProps> = ({ title = "Default", breadcrumb = ["Dashboards", "Default"] }) => {
    return (
        <header className="bg-black px-8 py-6">
            <div className="flex items-center justify-between">
                {/* Left Side - Breadcrumb */}
                <div className="flex items-center gap-4">
                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <SidebarIcon size={20} className="text-[#A1A1A1]" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                        <Star size={20} className="text-[#A1A1A1]" />
                    </button>
                    <div className="flex items-center gap-3 text-sm tracking-tight">
                        {breadcrumb.map((item, index) => (
                            <React.Fragment key={index}>
                                {index > 0 && <span className="text-white/10">/</span>}
                                <span className={index === breadcrumb.length - 1 ? "text-white font-semibold" : "text-[#A1A1A1]"}>
                                    {item}
                                </span>
                            </React.Fragment>
                        ))}
                    </div>
                </div>

                {/* Right Side - Search & Actions */}
                <div className="flex items-center gap-4">
                    {/* Search */}
                    <div className="relative">
                        <div className="flex items-center gap-3 bg-[#161616] border border-white/5 rounded-2xl px-4 py-2.5 w-72 transition-all focus-within:border-[#BDF34E]/50 focus-within:ring-1 focus-within:ring-[#BDF34E]/20">
                            <MagnifyingGlass size={18} className="text-white/30" />
                            <input
                                type="text"
                                placeholder="Search everything..."
                                className="bg-transparent text-sm outline-none flex-1 text-white placeholder:text-white/20"
                            />
                            <div className="flex items-center gap-1 text-[10px] font-bold text-white/30 bg-white/5 px-2 py-0.5 rounded-lg border border-white/5">
                                <Command size={10} />
                                <span>/</span>
                            </div>
                        </div>
                    </div>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 bg-[#161616] border border-white/5 p-1 rounded-2xl">
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <Sun size={20} className="text-[#A1A1A1]" />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors">
                            <ClockCounterClockwise size={20} className="text-[#A1A1A1]" />
                        </button>
                        <button className="p-2 hover:bg-white/5 rounded-xl transition-colors relative">
                            <Bell size={20} className="text-[#A1A1A1]" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#BDF34E] rounded-full shadow-[0_0_10px_#BDF34E]"></span>
                        </button>
                    </div>
                    
                    <button className="w-10 h-10 rounded-2xl bg-[#BDF34E] flex items-center justify-center text-black hover:scale-105 transition-transform">
                        <UserIcon size={20} weight="bold" />
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
