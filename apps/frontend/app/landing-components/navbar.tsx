"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { SidebarIcon, ShieldCheckIcon } from '@phosphor-icons/react';

const Navbar = () => {
    const router = useRouter();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollTo = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <nav 
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${
                scrolled 
                ? "bg-[#0D0D0D]/80 backdrop-blur-xl py-4 border-white/5" 
                : "bg-transparent py-6 border-transparent"
            }`}
        >
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="flex items-center gap-3 group transition-transform hover:scale-[1.02] cursor-pointer">
                        <div className="w-10 h-10 bg-[#BDF34E] rounded-xl flex items-center justify-center text-black shadow-lg shadow-[#BDF34E]/20">
                            <ShieldCheckIcon size={24} weight="bold" />
                        </div>
                        <span className="text-xl font-black text-white tracking-tighter uppercase italic">Sandboox</span>
                    </button>

                    {/* Navigation Links - Center */}
                    <div className="hidden md:flex items-center gap-10">
                        {['Features', 'About'].map((item) => (
                            <button 
                                key={item} 
                                onClick={() => scrollTo(item.toLowerCase())}
                                className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-[#BDF34E] transition-colors cursor-pointer"
                            >
                                {item}
                            </button>
                        ))}
                    </div>

                    {/* Right Side - Desktop */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link 
                            href="/login" 
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white px-6 py-3 transition-colors"
                        >
                            Sign In
                        </Link>
                        <button
                            onClick={() => router.push('/login')}
                            className="px-8 py-3.5 bg-[#BDF34E] text-black text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-[#D4FF7E] transition-all shadow-xl shadow-[#BDF34E]/10 flex items-center gap-2 group"
                        >
                            Get Started
                            <span className="w-1.5 h-1.5 rounded-full bg-black/20 group-hover:bg-black transition-colors" />
                        </button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden w-12 h-12 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 text-white transition-all hover:bg-white/10"
                        aria-label="Toggle menu"
                    >
                        <div className="space-y-1.5">
                            <div className={`w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
                            <div className={`w-5 h-0.5 bg-current transition-all ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                            <div className={`w-3 h-0.5 bg-current transition-all ml-auto ${mobileMenuOpen ? '-rotate-45 -translate-y-2 !w-5' : ''}`} />
                        </div>
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pt-8 pb-10 border-t border-white/5 mt-6 animate-in slide-in-from-top-4 duration-300">
                        <div className="flex flex-col gap-6">
                            {['Features', 'About'].map((item) => (
                                <button 
                                    key={item} 
                                    onClick={() => scrollTo(item.toLowerCase())}
                                    className="text-left text-lg font-bold text-white/40 hover:text-[#BDF34E] transition-colors"
                                >
                                    {item}
                                </button>
                            ))}
                            <div className="pt-6 border-t border-white/5 flex flex-col gap-4">
                                <button
                                    onClick={() => {
                                        router.push('/login');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="px-8 py-4 bg-[#BDF34E] text-black font-black text-xs uppercase tracking-widest rounded-2xl w-full shadow-xl shadow-[#BDF34E]/10"
                                >
                                    Launch Interface
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;