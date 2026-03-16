"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowRightIcon, 
    ShieldCheckIcon, 
    BugIcon, 
    LockIcon, 
    LightningIcon, 
    MagnifyingGlassIcon,
    DatabaseIcon,
    DetectiveIcon
} from '@phosphor-icons/react';

const Hero = () => {
    const router = useRouter();
    
    return (
        <div className="bg-[#0D0D0D]">
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(40px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-slide-up { animation: slideUp 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .animate-fade-in { animation: fadeIn 1s ease-out forwards; }
                .delay-200 { animation-delay: 0.2s; }
                .delay-300 { animation-delay: 0.3s; }
                .delay-500 { animation-delay: 0.5s; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.01);
                    backdrop-filter: blur(24px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
            `}</style>

            {/* Hero Section */}
            <section className="relative min-h-screen pt-40 pb-32 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#BDF34E]/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
                </div>

                <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-24 space-y-12">
                        <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full animate-fade-in">
                            <span className="w-2 h-2 rounded-full bg-[#BDF34E] animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Vulnerability Discovery Orchestration</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl lg:text-9xl font-bold text-white leading-[0.9] tracking-tighter max-w-5xl mx-auto animate-slide-up">
                            BREAK YOUR <span className="text-white/20 italic">APK</span><br />
                            BEFORE THEY DO.
                        </h1>

                        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto leading-relaxed animate-fade-in delay-200">
                            Expose Android app vulnerabilities in minutes. Sandboox identifies critical security flaws, leaked keys, and dangerous permission flows automatically.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-4 animate-fade-in delay-300">
                            <button 
                                onClick={() => router.push('/login')} 
                                className="px-10 py-5 bg-[#BDF34E] text-black text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-[#D4FF7E] transition-all shadow-2xl shadow-[#BDF34E]/20 hover:scale-105 active:scale-95 group flex items-center gap-3 cursor-pointer"
                            >
                                Get Started Free
                                <ArrowRightIcon size={18} weight="bold" className="group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button className="px-10 py-5 bg-white/5 border border-white/10 text-white text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all cursor-pointer">
                                View Documentation
                            </button>
                        </div>
                    </div>

                    <div className="max-w-6xl mx-auto animate-slide-up delay-500">
                        <div className="relative glass-card rounded-[40px] p-8 md:p-12 overflow-hidden shadow-2xl shadow-black/50">
                            <div className="absolute inset-0 bg-gradient-to-br from-[#BDF34E]/5 to-transparent pointer-events-none" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                                <FeatureItem icon={<BugIcon size={32} />} title="Automated Audits" text="Continuous security scanning for your mobile ecosystem." />
                                <FeatureItem icon={<ShieldCheckIcon size={32} />} title="Trust Engine" text="Dynamic vulnerability scoring based on exploitation risk." />
                                <FeatureItem icon={<LockIcon size={32} />} title="Data Sanctity" text="Detection of hardcoded secrets and unsafe storage patterns." />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="mb-20 space-y-4">
                        <h2 className="text-[10px] font-black text-[#BDF34E] uppercase tracking-[0.4em]">Core Capabilities</h2>
                        <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter">Everything you need<br />to secure your build.</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <FeatureCard 
                            icon={<DetectiveIcon size={24} weight="fill" />} 
                            title="Static Analysis" 
                            text="Decompiles APKs to identify logic flaws, hardcoded credentials, and insecure API endpoints." 
                        />
                        <FeatureCard 
                            icon={<LightningIcon size={24} weight="fill" />} 
                            title="Rapid Processing" 
                            text="Leverages distributed BullMQ workers to process large binaries in seconds, not hours." 
                        />
                        <FeatureCard 
                            icon={<DatabaseIcon size={24} weight="fill" />} 
                            title="Session Integrity" 
                            text="Verifies session management and cookie security across web integrated components." 
                        />
                        <FeatureCard 
                            icon={<MagnifyingGlassIcon size={24} weight="fill" />} 
                            title="Permission Audit" 
                            text="Flags dangerous permission requests that could lead to data extraction or privilege escalation." 
                        />
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section id="about" className="py-32 border-t border-white/5 relative overflow-hidden">
                <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#BDF34E]/5 rounded-full blur-[150px] pointer-events-none" />
                
                <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div className="space-y-10">
                        <div className="space-y-4">
                            <h2 className="text-[10px] font-black text-[#BDF34E] uppercase tracking-[0.4em]">The Platform</h2>
                            <h3 className="text-4xl md:text-6xl font-bold text-white tracking-tighter italic">Sanitizing the<br />Android Ecosystem.</h3>
                        </div>
                        
                        <div className="space-y-6">
                            <p className="text-xl text-white/60 leading-relaxed font-medium">
                                Sandboox is a high-fidelity security orchestration platform engineered to automate the labor-intensive process of mobile vulnerability discovery.
                            </p>
                            <p className="text-lg text-white/40 leading-relaxed">
                                By leveraging a distributed architecture of Next.js frontends, Hono API nodes, and background analysis workers, Sandboox identifies critical flaws before they reach production. Our mission is to help security researchers and developers stay ahead of the curve, providing the tools necessary to break their infrastructure—so attackers can't.
                            </p>
                        </div>

                        <div className="flex items-center gap-10 pt-4">
                             <div>
                                <p className="text-3xl font-bold text-white">100%</p>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Automated</p>
                             </div>
                             <div className="w-px h-10 bg-white/5" />
                             <div>
                                <p className="text-3xl font-bold text-white">Real-time</p>
                                <p className="text-[10px] font-black text-white/20 uppercase tracking-widest mt-1">Audit Stream</p>
                             </div>
                        </div>
                    </div>

                    <div className="relative">
                        <div className="aspect-square glass-card rounded-[60px] p-1 flex items-center justify-center group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-[#BDF34E]/10 to-transparent group-hover:scale-110 transition-transform duration-700" />
                            <ShieldCheckIcon size={200} weight="thin" className="text-[#BDF34E] opacity-20 group-hover:opacity-40 transition-opacity" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-20 border-t border-white/5">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center text-[#BDF34E]">
                            <ShieldCheckIcon size={20} weight="bold" />
                        </div>
                        <span className="text-sm font-black text-white uppercase italic">Sandboox</span>
                    </div>
                    <p className="text-[10px] font-black text-white/10 uppercase tracking-[0.3em]">
                        © 2026 Sandboox Security. All Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

function FeatureItem({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="space-y-4">
            <div className="text-[#BDF34E]">{icon}</div>
            <h4 className="text-lg font-bold text-white">{title}</h4>
            <p className="text-sm text-white/40 leading-relaxed">{text}</p>
        </div>
    );
}

function FeatureCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
    return (
        <div className="glass-card rounded-[32px] p-8 space-y-6 hover:border-[#BDF34E]/30 transition-all group">
            <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-[#BDF34E] group-hover:scale-110 transition-transform">
                {icon}
            </div>
            <div className="space-y-3">
                <h4 className="text-lg font-bold text-white">{title}</h4>
                <p className="text-sm text-white/30 leading-relaxed">{text}</p>
            </div>
        </div>
    );
}

export default Hero;