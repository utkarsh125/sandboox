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
    Passed: { icon: CheckCircleIcon, className: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
    Failed: { icon: XCircleIcon, className: 'text-red-500    bg-red-50    border-red-200' },
    Pending: { icon: ClockIcon, className: 'text-amber-600  bg-amber-50  border-amber-200' },
    'Not Run': { icon: MinusCircleIcon, className: 'text-gray-500   bg-gray-50   border-gray-200' },
}

const apkStatusConfig: Record<string, { label: string; dot: string }> = {
    PENDING: { label: 'Pending', dot: 'bg-amber-400 animate-pulse' },
    READY: { label: 'Ready', dot: 'bg-blue-400' },
    UPLOADED: { label: 'Uploaded', dot: 'bg-blue-400' },
    PROCESSING: { label: 'Processing', dot: 'bg-purple-500 animate-pulse' },
    COMPLETED: { label: 'Completed', dot: 'bg-emerald-400' },
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
            <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FolderIcon size={30} weight="duotone" className="text-gray-300" />
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1">No projects yet</h3>
                <p className="text-xs text-gray-500">Create your first project to start testing</p>
            </div>
        )
    }

    return (
        <>
            <style>{`
                @keyframes rowIn {
                    from { opacity: 0; transform: translateY(6px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .project-row { animation: rowIn 0.2s ease both; }
                @keyframes spinSlow {
                    to { transform: rotate(360deg); }
                }
                .spin-slow { animation: spinSlow 1.2s linear infinite; }
            `}</style>

            {actionError && (
                <div className="flex items-center gap-2 px-4 py-2.5 mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
                    <WarningCircleIcon size={15} className="shrink-0" />
                    {actionError}
                </div>
            )}

            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/60">
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5 w-[30%]">Name</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5 w-[28%]">Description</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5">Type</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5">APK Status</th>
                                <th className="text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-5 py-3.5">Outcome</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
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
                                        className="project-row hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                        style={{ animationDelay: `${i * 40}ms` }}
                                    >
                                        <td className="px-5 py-3.5">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-xl bg-green-100 border-green-500 border-1 flex items-center justify-center shrink-0 transition-colors">
                                                    <AndroidLogoIcon size={15} weight="duotone" className="text-green-500" />
                                                </div>
                                                <span className="text-sm font-semibold text-gray-900 truncate max-w-[160px]">
                                                    {project.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`text-sm line-clamp-1 ${!project.description || project.description === 'null' ? 'text-gray-400 italic' : 'text-gray-500'}`}>
                                                {project.description && project.description !== 'null' ? project.description : 'No description'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                                {project.testType}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700">
                                                {isProcessing ? (
                                                    <SpinnerGapIcon size={12} className="spin-slow text-purple-500" />
                                                ) : (
                                                    <span className={`w-2 h-2 rounded-full ${statusCfg.dot}`} />
                                                )}
                                                {statusCfg.label}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${outcome.className}`}>
                                                <OutcomeIcon size={13} weight="bold" />
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
                <div className="sm:hidden divide-y divide-gray-50">
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
                                className="project-row flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 cursor-pointer group"
                                style={{ animationDelay: `${i * 40}ms` }}
                            >
                                <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-200 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                    <AndroidLogoIcon size={18} weight="duotone" className="text-green-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                                            {isProcessing ? (
                                                <SpinnerGapIcon size={10} className="spin-slow text-purple-500" />
                                            ) : (
                                                <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                                            )}
                                            {statusCfg.label}
                                        </span>
                                        <span className="text-gray-300">·</span>
                                        <span className={`inline-flex items-center gap-1 text-xs font-medium ${outcome.className.split(' ')[0]}`}>
                                            <OutcomeIcon size={11} weight="bold" />
                                            {project.outcome}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>

                {/* Footer count */}
                <div className="px-5 py-3 border-t border-gray-50 bg-gray-50/40">
                    <p className="text-xs text-gray-400">
                        {projects.length} project{projects.length !== 1 ? 's' : ''}
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