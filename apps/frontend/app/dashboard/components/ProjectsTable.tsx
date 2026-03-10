"use client"
import React, { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import {
    FolderIcon,
    CheckCircleIcon,
    XCircleIcon,
    ClockIcon,
    MinusCircleIcon,
    DotsThreeVerticalIcon,
    PlayIcon,
    PencilSimpleIcon,
    TrashIcon,
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

// Portal-based dropdown rendered at document body level — eliminates all clipping issues
const DropdownMenu: React.FC<{
    project: Project
    anchor: HTMLElement | null
    onClose: () => void
    onAction: (action: 'start' | 'rename' | 'delete') => void
    isProcessDone: boolean
}> = ({ project, anchor, onClose, onAction, isProcessDone }) => {
    const menuRef = useRef<HTMLDivElement>(null)
    const [pos, setPos] = useState({ top: 0, left: 0 })

    React.useLayoutEffect(() => {
        if (!anchor) return

        const rect = anchor.getBoundingClientRect()
        const menuWidth = 192 // w-48
        const menuHeight = 130

        let top = rect.bottom + 6
        let left = rect.right - menuWidth

        // Flip up if would go off screen bottom
        if (rect.bottom + menuHeight > window.innerHeight) {
            top = rect.top - menuHeight - 6
        }
        // Clamp to left edge
        if (left < 8) left = 8

        setPos({ top, left })
    }, [anchor])

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node) &&
                anchor && !anchor.contains(e.target as Node)) {
                onClose()
            }
        }
        const handleScroll = () => onClose()
        document.addEventListener('mousedown', handleClick)
        document.addEventListener('scroll', handleScroll, true)
        return () => {
            document.removeEventListener('mousedown', handleClick)
            document.removeEventListener('scroll', handleScroll, true)
        }
    }, [onClose, anchor])

    const portal = typeof document !== 'undefined'
        ? document.getElementById('dropdown-portal') ?? document.body
        : null

    if (!portal) return null

    return createPortal(
        <div
            ref={menuRef}
            style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 9999, width: 192, pointerEvents: 'auto' }}
            className="bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
        >
            <style>{`
                @keyframes dropIn {
                    from { opacity: 0; transform: translateY(-6px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)     scale(1);    }
                }
                .drop-in { animation: dropIn 0.15s cubic-bezier(0.16,1,0.3,1) forwards; }
            `}</style>
            <div className="drop-in py-1">
                <button
                    onClick={() => { onAction('start'); onClose(); }}
                    disabled={isProcessDone}
                    className={`w-full text-left px-3.5 py-2.5 text-sm flex items-center gap-2.5 transition-colors ${isProcessDone
                        ? 'text-gray-400 cursor-not-allowed bg-gray-50/50'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    <PlayIcon size={15} weight={isProcessDone ? 'regular' : 'fill'} />
                    <span>Run Analysis</span>
                </button>
                <button
                    onClick={() => { onAction('rename'); onClose(); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2.5 transition-colors"
                >
                    <PencilSimpleIcon size={15} />
                    <span>Rename</span>
                </button>
                <div className="h-px bg-gray-100 mx-2 my-1" />
                <button
                    onClick={() => { onAction('delete'); onClose(); }}
                    className="w-full text-left px-3.5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2.5 transition-colors"
                >
                    <TrashIcon size={15} />
                    <span>Delete</span>
                </button>
            </div>
        </div>,
        portal
    )
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onRefresh, onProjectClick }) => {
    const [openMenu, setOpenMenu] = useState<{ id: string, anchor: HTMLElement } | null>(null)
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null)
    const [actionError, setActionError] = useState<string | null>(null)

    const handleAction = useCallback(async (action: 'start' | 'rename' | 'delete', project: Project) => {
        setActionError(null)
        try {
            if (action === 'start') {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}/start`, {}, { withCredentials: true })
                onRefresh?.()
            } else if (action === 'rename') {
                const newName = window.prompt('Enter new project name:', project.name)
                if (newName && newName.trim() !== project.name && newName.trim() !== '') {
                    await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`, { name: newName.trim() }, { withCredentials: true })
                    onRefresh?.()
                }
            } else if (action === 'delete') {
                setProjectToDelete(project)
            }
        } catch (err) {
            console.error(`Failed to ${action} project:`, err)
            setActionError(`Failed to ${action} project.`)
        }
    }, [onRefresh])

    const confirmDelete = async () => {
        if (!projectToDelete) return
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectToDelete.id}`, { withCredentials: true })
        onRefresh?.()
        setProjectToDelete(null)
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
                                <th className="px-5 py-3.5 w-10"><span className="sr-only">Actions</span></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {projects.map((project, i) => {
                                const outcome = outcomeConfig[project.outcome as keyof typeof outcomeConfig] ?? outcomeConfig['Not Run']
                                const OutcomeIcon = outcome.icon
                                const apkStatus = project.apk?.status || 'UPLOADED'
                                const statusCfg = apkStatusConfig[apkStatus] ?? apkStatusConfig['UPLOADED']
                                const isProcessDone = ['COMPLETED', 'FAILED', 'PROCESSING'].includes(apkStatus)
                                const isProcessing = apkStatus === 'PROCESSING'

                                return (
                                    <tr
                                        key={project.id}
                                        onClick={() => onProjectClick?.(project)}
                                        className="project-row hover:bg-blue-50/30 transition-colors cursor-pointer group"
                                        style={{ animationDelay: `${i * 40}ms` }}
                                    >
                                        {/* Name */}
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

                                        {/* Description */}
                                        <td className="px-5 py-3.5">
                                            <span className={`text-sm line-clamp-1 ${!project.description || project.description === 'null' ? 'text-gray-400 italic' : 'text-gray-500'}`}>
                                                {project.description && project.description !== 'null' ? project.description : 'No description'}
                                            </span>
                                        </td>

                                        {/* Test type */}
                                        <td className="px-5 py-3.5">
                                            <span className="inline-flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                                                {project.testType}
                                            </span>
                                        </td>

                                        {/* APK Status */}
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

                                        {/* Outcome */}
                                        <td className="px-5 py-3.5">
                                            <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${outcome.className}`}>
                                                <OutcomeIcon size={13} weight="bold" />
                                                {project.outcome}
                                            </span>
                                        </td>

                                        {/* Actions */}
                                        <td className="px-5 py-3.5 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setOpenMenu(
                                                        openMenu?.id === project.id 
                                                            ? null 
                                                            : { id: project.id, anchor: e.currentTarget }
                                                    )
                                                }}
                                                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                            >
                                                <DotsThreeVerticalIcon size={18} weight="bold" />
                                            </button>

                                            {openMenu?.id === project.id && (
                                                <DropdownMenu
                                                    project={project}
                                                    anchor={openMenu.anchor}
                                                    onClose={() => setOpenMenu(null)}
                                                    onAction={(action) => handleAction(action, project)}
                                                    isProcessDone={isProcessDone}
                                                />
                                            )}
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
                        const isProcessDone = ['COMPLETED', 'FAILED', 'PROCESSING'].includes(apkStatus)
                        const isProcessing = apkStatus === 'PROCESSING'

                        return (
                            <div
                                key={project.id}
                                onClick={() => onProjectClick?.(project)}
                                className="project-row flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50/60 cursor-pointer group"
                                style={{ animationDelay: `${i * 40}ms` }}
                            >
                                <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center shrink-0">
                                    <AndroidLogoIcon size={16} weight="duotone" className="text-white" />
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
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenMenu(
                                            openMenu?.id === project.id 
                                                ? null 
                                                : { id: project.id, anchor: e.currentTarget }
                                        )
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <DotsThreeVerticalIcon size={18} weight="bold" />
                                </button>

                                {openMenu?.id === project.id && (
                                    <DropdownMenu
                                        project={project}
                                        anchor={openMenu.anchor}
                                        onClose={() => setOpenMenu(null)}
                                        onAction={(action) => handleAction(action, project)}
                                        isProcessDone={isProcessDone}
                                    />
                                )}
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