"use client";

import React, { useEffect, useState } from 'react';
import { getSession } from "@/lib/sessions";
import axios from 'axios';
import {
    ShieldCheckIcon,
    BugIcon,
    PackageIcon,
    ArrowRightIcon,
    CircleNotchIcon,
    ChartBarIcon,
    LightningIcon,
    TrendUpIcon,
} from "@phosphor-icons/react";
import Link from 'next/link';

interface Stats {
    totalApps: number;
    totalVulnerabilities: number;
    avgScore: number;
    categoryData: { name: string; count: number; color: string }[];
}

export default function DashboardOverview() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [userName, setUserName] = useState("Explorer");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Fetch Session for Name
                const sessionRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/get-session`, { credentials: "include" });
                if (sessionRes.ok) {
                    const sessionData = await sessionRes.json();
                    if (sessionData?.user?.name) {
                        setUserName(sessionData.user.name.split(' ')[0]);
                    }
                }

                // Fetch Projects for Stats
                const { data } = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`, { withCredentials: true });
                const projects = data.projects || [];

                let totalVulns = 0;
                let totalScore = 0;
                let activeApps = 0;
                const catMap = new Map<string, number>();

                projects.forEach((p: any) => {
                    if (p.apk?.analysis) {
                        activeApps++;
                        const vulns = p.apk.analysis.vulnerabilities || [];
                        totalVulns += vulns.length;
                        totalScore += p.apk.analysis.securityScore || 0;

                        vulns.forEach((v: any) => {
                            const cat = v.category || "General";
                            catMap.set(cat, (catMap.get(cat) || 0) + 1);
                        });
                    }
                });

                const colors = ['#BDF34E', '#84cc16', '#4ade80', '#22c55e', '#16a34a'];
                const categoryData = Array.from(catMap.entries())
                    .map(([name, count], i) => ({
                        name,
                        count,
                        color: colors[i % colors.length]
                    }))
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 5);

                setStats({
                    totalApps: projects.length,
                    totalVulnerabilities: totalVulns,
                    avgScore: activeApps > 0 ? Math.round(totalScore / activeApps) : 0,
                    categoryData
                });

            } catch (err) {
                console.error("Failed to load dashboard stats", err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    if (loading) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#0D0D0D] h-screen">
                <CircleNotchIcon size={48} className="animate-spin text-[#BDF34E]" />
                <p className="text-[11px] font-bold text-white/20 uppercase tracking-[0.5em] mt-8 animate-pulse">Syncing Intelligence</p>
            </div>
        );
    }

    return (
        <div className="flex-1 min-h-screen bg-[#0D0D0D] p-8 lg:p-12 overflow-y-auto">
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade { animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                .glass-card {
                    background: rgba(255, 255, 255, 0.015);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(20px);
                }
            `}</style>

            <div className="max-w-7xl mx-auto space-y-12 animate-fade">

                {/* Hero Section */}
                <div className="space-y-4">
                    <h1 className="text-5xl lg:text-7xl font-bold text-white tracking-tighter leading-tight">
                        Hey <span className="text-[#BDF34E]">{userName}</span>,<br />
                        detected <span className="text-white/40">{stats?.totalVulnerabilities}</span> vulnerabilities<br />
                        across <span className="text-white/40">{stats?.totalApps}</span> audit{stats?.totalApps !== 1 ? 's' : ''}.
                    </h1>
                    <p className="text-lg text-white/20 font-medium max-w-2xl">
                        Your security posture is currently rated at <span className="text-[#BDF34E]">{stats?.avgScore}%</span>.
                        Check the detailed reports to begin remediation.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard
                        label="Total Audits"
                        value={stats?.totalApps || 0}
                        icon={<PackageIcon size={24} className="text-[#BDF34E]" />}
                        trend="Active environments"
                    />
                    <StatCard
                        label="Total Findings"
                        value={stats?.totalVulnerabilities || 0}
                        icon={<BugIcon size={24} className="text-red-500" />}
                        trend="Security debt"
                    />
                    <StatCard
                        label="Aggregate Score"
                        value={`${stats?.avgScore}%`}
                        icon={<ShieldCheckIcon size={24} className="text-blue-500" />}
                        trend="Trust coefficient"
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Graph Section */}
                    <div className="lg:col-span-8 glass-card rounded-[40px] p-10 space-y-10 relative overflow-hidden group">
                        <div className="absolute inset-x-0 -top-24 -left-24 w-64 h-64 bg-[#BDF34E]/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-[#BDF34E]/10 transition-colors" />

                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-bold text-white tracking-tight">Vulnerability Spread</h3>
                                <p className="text-sm text-white/20 mt-1">Distribution across identified threat categories</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-xl border border-white/5">
                                <ChartBarIcon size={18} className="text-[#BDF34E]" />
                                <span className="text-[10px] font-black text-[#BDF34E] uppercase tracking-widest">Live Audit</span>
                            </div>
                        </div>

                        <div className="space-y-8 pt-6">
                            {(stats?.categoryData || []).map((cat, i) => (
                                <div key={cat.name} className="space-y-3">
                                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                                        <span className="text-white/40">{cat.name}</span>
                                        <span className="text-[#BDF34E]">{cat.count} threats</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-1000 ease-out"
                                            style={{
                                                width: stats ? `${(cat.count / Math.max(...stats.categoryData.map(c => c.count))) * 100}%` : '0%',
                                                backgroundColor: cat.color,
                                                boxShadow: `0 0 20px ${cat.color}40`
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}

                            {(!stats?.categoryData || stats.categoryData.length === 0) && (
                                <div className="py-20 flex flex-col items-center text-center space-y-4">
                                    <ShieldCheckIcon size={48} className="text-[#BDF34E] opacity-20" />
                                    <p className="text-white/20 text-sm font-medium">No vulnerabilities detected to visualize.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Actions / Tips */}
                    <div className="lg:col-span-4 flex flex-col gap-6">
                        <div className="flex-1 glass-card rounded-[40px] p-8 flex flex-col justify-between group overflow-hidden relative">
                            <div className="absolute inset-x-0 -bottom-24 -right-24 w-64 h-64 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                            <div className="space-y-6">
                                <div className="w-12 h-12 rounded-2xl bg-[#BDF34E]/10 flex items-center justify-center text-[#BDF34E]">
                                    <LightningIcon size={24} weight="fill" />
                                </div>
                                <h4 className="text-xl font-bold text-white leading-snug">Quick Security Scan</h4>
                                <p className="text-sm text-white/40 leading-relaxed">
                                    New updates detected in your repository. Start an automated audit now to maintain 100% compliance.
                                </p>
                            </div>

                            <Link href={`/dashboard/projects`} className="cursor-pointer w-full py-4 mt-8 bg-[#BDF34E] hover:bg-[#D4FF7E] text-black font-black text-[10px] uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-[#BDF34E]/10 flex items-center justify-center gap-3">
                                New Project <ArrowRightIcon size={16} weight="bold" />
                            </Link>
                        </div>

                        <div className="glass-card rounded-[40px] p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                    <TrendUpIcon size={20} weight="bold" />
                                </div>
                                <h5 className="font-bold text-white text-sm">Security Trend</h5>
                            </div>
                            <p className="text-xs text-white/30 leading-relaxed">
                                Your patch rate has increased by <span className="text-blue-500 font-bold">12%</span> this week. Keep up the momentum.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, trend }: { label: string; value: string | number; icon: React.ReactNode; trend: string }) {
    return (
        <div className="glass-card rounded-[40px] p-8 space-y-6 relative overflow-hidden group hover:border-[#BDF34E]/20 transition-all">
            <div className="flex items-start justify-between">
                <div className="p-3 bg-white/5 rounded-2xl">
                    {icon}
                </div>
                <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">{trend}</span>
            </div>
            <div className="space-y-1">
                <p className="text-4xl font-bold text-white tracking-tighter">{value}</p>
                <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{label}</p>
            </div>
        </div>
    );
}
