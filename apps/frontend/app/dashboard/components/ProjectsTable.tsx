"use client"
import React, { useState, useEffect } from 'react'
import {
    FolderIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MinusCircleIcon,
    AndroidLogoIcon,
    SpinnerGapIcon,
    WarningCircleIcon,
} from '@phosphor-icons/react'
import axios from 'axios'
import DeleteProjectModal from './DeleteProjectModal'

export interface Project {
    id: string
    name: string
    description: string | null
    testType: string
    outcome: string
    apk?: {
        id: string
        status: string
        sourceUrl: string | null
        fileName: string | null
    } | null
    createdAt?: string
}

interface ProjectsTableProps {
    projects: Project[]
    onRefresh?: () => void
    onProjectClick?: (project: Project) => void
}

const outcomeConfig = {
    Passed: { icon: CheckCircleIcon, className: 'text-[#BDF34E] bg-[#BDF34E]/10 border-[#BDF34E]/20' },
    Failed: { icon: XCircleIcon, className: 'text-red-400    bg-red-400/10    border-red-400/20' },
    Pending: { icon: ClockIcon, className: 'text-amber-400  bg-amber-400/10  border-amber-400/20' },
    'Not Run': { icon: MinusCircleIcon, className: 'text-white/30   bg-white/5   border-white/10' },
}

const apkStatusConfig: Record<string, { label: string; dot: string }> = {
    PENDING: { label: 'Pending', dot: 'bg-amber-400 animate-pulse' },
    READY: { label: 'Ready', dot: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]' },
    UPLOADED: { label: 'Uploaded', dot: 'bg-blue-400' },
    PROCESSING: { label: 'Processing', dot: 'bg-[#BDF34E] animate-pulse shadow-[0_0_12px_#BDF34E]' },
    COMPLETED: { label: 'Completed', dot: 'bg-[#BDF34E] shadow-[0_0_8px_#BDF34E]' },
    FAILED: { label: 'Failed', dot: 'bg-red-400' },
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onRefresh, onProjectClick }) => {
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const confirmDelete = async () => {
        if (!projectToDelete) return
        try {
            await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectToDelete.id}`, { withCredentials: true })
            onRefresh?.()
            setProjectToDelete(null)
        } catch (err) {
            console.error('Failed to delete project:', err)
            setActionError('Failed to delete project.')
        }
    }

    if (projects.length === 0) {
        return (
            <div className="bg-[#161616] border border-white/5 rounded-[32px] p-24 text-center">
                <div className="w-20 h-20 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6">
                    <FolderIcon size={40} weight="thin" className="text-white/20" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">No projects found</h3>
                <p className="text-sm text-white/40">Drop an APK to start your first analysis</p>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @keyframes rowIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .project-row { animation: rowIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) both; }
                @keyframes spinSlow {
                    to { transform: rotate(360deg); }
                }
                .spin-slow { animation: spinSlow 1.2s linear infinite; }
            `}</style>

            {actionError && (
                <div className="flex items-center gap-3 px-6 py-4 mb-4 text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-2xl">
                    <WarningCircleIcon size={18} className="shrink-0" />
                    {actionError}
                </div>
            )}

            <div className="bg-[#161616] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.02]">
                                <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-8 py-5 w-[30%]">Projects</th>
                                <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-8 py-5 w-[28%]">Description</th>
                                <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-8 py-5">Type</th>
                                <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-8 py-5">Status</th>
                                <th className="text-left text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] px-8 py-5">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                            {projects.map((project, i) => {
                                const outcome = outcomeConfig[project.outcome as keyof typeof outcomeConfig] ?? outcomeConfig['Not Run']
                                const OutcomeIcon = outcome.icon
                                const apkStatus = project.apk?.status || 'UPLOADED'
                                const statusCfg = apkStatusConfig[apkStatus] ?? apkStatusConfig['UPLOADED']
                                const isProcessing = apkStatus === 'PROCESSING'

                                return (
                                    <tr
                                        key={project.id}
                                        onClick={() => onProjectClick?.(project)}
                                        className="project-row hover:bg-white/[0.04] transition-all cursor-pointer group"
                                        style={{ animationDelay: `${i * 50}ms` }}
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                    <AndroidLogoIcon size={18} weight="duotone" className="text-[#BDF34E]" />
                                                </div>
                                                <span className="text-sm font-bold text-white tracking-tight truncate max-w-[200px]">
                                                    {project.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`text-sm line-clamp-1 ${!project.description || project.description === 'null' ? 'text-white/20 italic' : 'text-white/40'}`}>
                                                {project.description && project.description !== 'null' ? project.description : 'No description provided'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center text-[10px] font-bold text-white/60 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-wider">
                                                {project.testType}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="inline-flex items-center gap-2.5 text-sm font-semibold text-white/80">
                                                {isProcessing ? (
                                                    <SpinnerGapIcon size={14} className="spin-slow text-[#BDF34E]" />
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                                                )}
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.1em] px-4 py-2 rounded-xl border ${outcome.className}`}>
                                                <OutcomeIcon size={14} weight="bold" />
                                                {project.outcome}
                                            </span>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-white/[0.02]">
                    {projects.map((project, i) => {
                        const apkStatus = project.apk?.status || 'UPLOADED'
                        const statusCfg = apkStatusConfig[apkStatus] ?? apkStatusConfig['UPLOADED']
                        const outcome = outcomeConfig[project.outcome as keyof typeof outcomeConfig] ?? outcomeConfig['Not Run']
                        const OutcomeIcon = outcome.icon
                        const isProcessing = apkStatus === 'PROCESSING'

                        return (
                            <div
                                key={project.id}
                                onClick={() => onProjectClick?.(project)}
                                className="project-row flex items-center gap-4 px-6 py-5 hover:bg-white/[0.04] cursor-pointer group"
                                style={{ animationDelay: `${i * 50}ms` }}
                            >
                                <div className="w-12 h-12 rounded-[20px] bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center shrink-0 group-hover:bg-[#BDF34E]/20 transition-colors">
                                    <AndroidLogoIcon size={22} weight="duotone" className="text-[#BDF34E]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{project.name}</p>
                                    <div className="flex items-center gap-3 mt-1.5">
                                        <span className="inline-flex items-center gap-2 text-xs font-semibold text-white/40">
                                            {isProcessing ? (
                                                <SpinnerGapIcon size={12} className="spin-slow text-[#BDF34E]" />
                                            ) : (
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            )}
                                            {statusCfg.label}
                                        </span>
                                        <span className="text-white/10 uppercase tracking-tighter">|</span>
                                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${outcome.className.split(' ')[0]}`}>
                                            <OutcomeIcon size={12} weight="bold" />
                                            {project.outcome}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer count */}
                <div className="px-8 py-5 border-t border-white/[0.02] bg-white/[0.01]">
                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em]">
                        {projects.length} Total Project{projects.length !== 1 ? 's' : ''}
                    </p>
                </div>
            </div>

            <DeleteProjectModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                projectName={projectToDelete?.name || ''}
            />
        </>
    )
}

export default ProjectsTable
