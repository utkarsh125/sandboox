"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
    FileTextIcon,
    ShieldCheckIcon,
    CalendarBlankIcon,
    ArrowRightIcon,
    SpinnerGapIcon,
    CaretRightIcon,
    ChartPieSliceIcon,
} from "@phosphor-icons/react";
import axios from "axios";
import Link from "next/link";
import type { Project as BaseProject } from "../components/ProjectsTable";

type Project = Omit<BaseProject, "apk"> & {
    apk: NonNullable<BaseProject["apk"]> & {
        versionName: string | null;
    };
};

const ReportsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`,
                { withCredentials: true }
            );
            const completedProjects = data.projects.filter(
                (p: Project) => p.apk?.status === "COMPLETED"
            );
            setProjects(completedProjects);
        } catch (err) {
            console.error("Failed to fetch projects for reports: ", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12">
            <style>{`
                @keyframes cardFadeIn {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .report-card { 
                    animation: cardFadeIn 0.4s ease backwards;
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                }
                .report-card:hover {
                    background: rgba(255, 255, 255, 0.04);
                    border-color: rgba(189, 243, 78, 0.3);
                    transform: translateY(-4px) scale(1.01);
                }
            `}</style>

            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center">
                            <ChartPieSliceIcon size={28} weight="duotone" className="text-[#BDF34E]" />
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Security Audits</h1>
                    </div>
                    <p className="text-white/40 max-w-lg text-lg leading-relaxed">
                        Access detailed audit logs and safety certification for your completed scans.
                    </p>
                </div>

                <div className="flex items-center gap-8 bg-white/[0.02] border border-white/5 px-8 py-5 rounded-[24px]">
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Total Reports</p>
                        <p className="text-2xl font-bold text-white">{projects.length}</p>
                    </div>
                    <div className="w-px h-8 bg-white/5" />
                    <div className="text-center">
                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Status</p>
                        <p className="text-sm font-black text-[#BDF34E] uppercase tracking-wider">LIVE DATA</p>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-64 rounded-[32px] bg-white/[0.02] border border-white/5 animate-pulse" />
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 px-8 bg-white/[0.02] border border-white/5 rounded-[40px] text-center">
                    <div className="w-20 h-20 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <FileTextIcon size={40} className="text-white/20" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3 tracking-tight">No Reports Yet</h3>
                    <p className="text-white/40 max-w-sm mb-8 leading-relaxed">
                        Security reports will appear here once your project analysis reaches 100% completion.
                    </p>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-[#BDF34E] text-black font-bold rounded-2xl hover:bg-[#D4FF7E] transition-all shadow-xl shadow-[#BDF34E]/10 text-sm"
                    >
                        Go to Projects
                        <ArrowRightIcon size={18} weight="bold" />
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project, idx) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}/report`}
                            className="report-card group relative overflow-hidden bg-white/[0.02] border border-white/5 rounded-[32px] p-8 flex flex-col"
                            style={{ animationDelay: `${idx * 0.05}s` }}
                        >
                            <div className="flex items-start justify-between mb-8">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">Deployment</p>
                                    <h3 className="text-xl font-bold text-white group-hover:text-[#BDF34E] transition-colors truncate">
                                        {project.name}
                                    </h3>
                                </div>
                                <div className="w-12 h-12 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center text-[#BDF34E] shadow-[0_0_15px_rgba(189,243,78,0.1)]">
                                    <ShieldCheckIcon size={24} weight="fill" />
                                </div>
                            </div>

                            <div className="flex-1">
                                <p className="text-sm text-white/40 line-clamp-2 leading-relaxed mb-8 group-hover:text-white/60 transition-colors">
                                    {project.description && project.description !== "null"
                                        ? project.description
                                        : "Automated security posture assessment and code analysis completed."}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-8">
                                <div className="bg-white/5 rounded-[20px] p-3 border border-white/[0.02]">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Module</p>
                                    <p className="text-xs font-bold text-white truncate">{project.testType}</p>
                                </div>
                                <div className="bg-white/5 rounded-[20px] p-3 border border-white/[0.02]">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-1">Version</p>
                                    <p className="text-xs font-bold text-white">v{project.apk?.versionName ?? "1.0.0"}</p>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-6 border-t border-white/[0.03]">
                                <div className="flex items-center gap-2 text-white/20">
                                    <CalendarBlankIcon size={14} />
                                    <span className="text-[10px] font-bold uppercase tracking-widest font-mono">
                                        SECURED
                                    </span>
                                </div>
                                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#BDF34E] uppercase tracking-widest group-hover:translate-x-1 transition-transform">
                                    Audit Details
                                    <CaretRightIcon size={12} weight="bold" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReportsPage;