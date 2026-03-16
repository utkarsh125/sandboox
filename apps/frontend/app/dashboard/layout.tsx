"use client"

import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react"
import { Sidebar } from "./components"
import { useState } from "react"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="flex h-screen bg-black overflow-hidden relative text-white">
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />

            {/* Toggle lives here — outside sidebar, no overflow clipping */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute z-20 top-8 flex items-center justify-center w-6 h-6 bg-[#161616] border border-white/10 rounded-full text-gray-400 hover:text-white hover:border-[#BDF34E] shadow-sm transition-all duration-300"
                style={{ left: isCollapsed ? '68px' : '252px' }}
            >
                {isCollapsed
                    ? <CaretRightIcon size={12} weight="bold" />
                    : <CaretLeftIcon size={12} weight="bold" />}
            </button>

            <div className="flex-1 flex flex-col overflow-y-auto bg-black">
                {children}
            </div>
        </div>
    )
}