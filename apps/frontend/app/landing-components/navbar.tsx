"use client"
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

const Navbar = () => {
    const router = useRouter()
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-2">

                        <span className="text-base font-semibold text-black">Sandboox</span>
                    </div>



                    {/* Right Side - Desktop */}
                    <div className="hidden md:flex items-center gap-2 lg:gap-3">
                        <Link href="/about" className="text-sm border rounded-full px-4 lg:px-5 py-2 lg:py-2.5 text-gray-700 hover:text-black transition-colors">
                            About
                        </Link>
                        <button
                            onClick={() => router.push('/login')}
                            className="hover:cursor-pointer px-5 lg:px-6 py-3 lg:py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all whitespace-nowrap"
                        >
                            Login
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2"
                        aria-label="Toggle menu"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        </svg>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4">
                        <div className="flex flex-col gap-4">
                            <div>About</div>
                            <button
                                onClick={() => router.push('/login')}
                                className="px-4 py-2.5 bg-black text-white text-sm font-medium rounded-full w-full hover:bg-gray-800 transition-all"
                            >
                                Download for Web
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar