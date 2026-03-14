"use client"

import React, { useEffect, useState, useCallback } from 'react'
import { ChartPieSliceIcon, FileTextIcon, ArrowRightIcon, SpinnerIcon, ShieldCheckIcon } from '@phosphor-icons/react'
import axios from 'axios'
import Link from 'next/link'
import type { Project as BaseProject } from '../components/ProjectsTable'


type Project = Omit<BaseProject, 'apk'> & {
    apk: NonNullable<BaseProject['apk']> & {
        versionName: string | null
    }
}

const ReportsPage = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = useCallback(async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`,
                { withCredentials: true }
            )
            const completedProjects = data.projects.filter(
                (p: Project) => p.apk?.status === 'COMPLETED'
            );
            setProjects(completedProjects)
        } catch (err) {
            console.error("Failed to fetch projects for reports: ", err);
        } finally {
            setLoading(false);
        }
    }, [])

    useEffect(() => { fetchProjects() }, [fetchProjects]);

    return (
        <div className="p-8 space-y-8 max-w-[1200px] mx-auto min-h-screen bg-slate-50/30">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-xl text-blue-600">
                            <ChartPieSliceIcon size={24} weight="duotone" />
                        </div>
                        Security Reports
                    </h1>
                    <p className="text-sm text-gray-500 mt-1.5 ml-11">
                        View and manage generated security analysis for your projects.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 bg-white border border-slate-100 rounded-3xl shadow-sm gap-4">
                    <SpinnerIcon size={32} className="animate-spin text-blue-500" />
                    <p className="text-sm font-medium text-gray-400">Loading analysis reports...</p>
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-24 text-center shadow-sm">
                    <div className="w-20 h-20 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto mb-6">
                        <FileTextIcon size={40} weight="thin" className="text-slate-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">No reports available</h3>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto mb-8">
                        Once a project analysis is completed, the security report will appear here.
                    </p>
                    <Link
                        href="/dashboard/projects"
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors shadow-sm"
                    >
                        Go to Projects
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}/report`}
                            className="group relative bg-white border border-slate-200/60 rounded-3xl p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 flex flex-col"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-500 group-hover:text-blue-600 transition-all duration-300">
                                    <ShieldCheckIcon size={26} weight="duotone" />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-[10px] font-black text-emerald-700 rounded-full uppercase tracking-widest">
                                    Ready
                                </div>
                            </div>

                            <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                    {project.name}
                                </h3>
                                <p className="text-sm text-gray-500 mt-2 line-clamp-2 leading-relaxed">
                                    {project.description && project.description !== 'null'
                                        ? project.description
                                        : 'Standard security scan conducted to identify potential vulnerabilities and risks.'}
                                </p>
                            </div>

                            <div className="mt-8 pt-5 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                        {project.testType}
                                    </span>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                                        v{project.apk?.versionName ?? '1.0.0'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-1 text-sm font-bold text-blue-600 group-hover:translate-x-1 transition-transform">
                                    View Report
                                    <ArrowRightIcon size={16} weight="bold" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}

export default ReportsPage