"use client"
import React, { useState, useRef, useEffect } from 'react'
import { FolderIcon, CheckCircleIcon, XCircleIcon, ClockIcon, MinusCircleIcon, DotsThreeVerticalIcon, PlayIcon, PencilSimpleIcon, TrashIcon } from '@phosphor-icons/react'
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
    Passed: {
        icon: CheckCircleIcon,
        className: 'text-green-600 bg-green-50 border-green-200',
    },
    Failed: {
        icon: XCircleIcon,
        className: 'text-red-500 bg-red-50 border-red-200',
    },
    Pending: {
        icon: ClockIcon,
        className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    'Not Run': {
        icon: MinusCircleIcon,
        className: 'text-gray-500 bg-gray-50 border-gray-200',
    },
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onRefresh, onProjectClick }) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
    const menuRef = useRef<HTMLDivElement | null>(null);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = async (e: React.MouseEvent, action: 'start' | 'rename' | 'delete', project: Project) => {
        e.stopPropagation();
        setOpenMenuId(null);

        try {
            if (action === 'start') {
                await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}/start`, {}, { withCredentials: true });
                onRefresh?.();
            } else if (action === 'rename') {
                const newName = window.prompt("Enter new project name:", project.name);
                if (newName && newName.trim() !== project.name && newName.trim() !== "") {
                    await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`, { name: newName.trim() }, { withCredentials: true });
                    onRefresh?.();
                }
            } else if (action === 'delete') {
                setProjectToDelete(project);
            }
        } catch (error) {
            console.error(`Failed to ${action} project:`, error);
            alert(`Failed to ${action} project. See console for details.`);
        }
    };

    const confirmDelete = async () => {
        if (!projectToDelete) return;
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectToDelete.id}`, { withCredentials: true });
        onRefresh?.();
        setProjectToDelete(null);
    };

    if (projects.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <FolderIcon size={28} weight="duotone" className="text-gray-300" />
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">No projects yet</h3>
                <p className="text-xs text-gray-500">
                    Create your first project to start testing
                </p>
            </div>
        )
    }

    return (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden">
            <table className="w-full">
                <thead>
                    <tr className="border-b border-gray-100">
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                            Name
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                            Description
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                            Test Type
                        </th>
                        <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-5 py-3">
                            Outcome
                        </th>
                        <th className="relative px-5 py-3">
                            <span className="sr-only">Actions</span>
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {projects.map((project) => {
                        const outcome = outcomeConfig[project.outcome as keyof typeof outcomeConfig] ?? outcomeConfig['Not Run']
                        const OutcomeIcon = outcome.icon

                        const apkStatus = project.apk?.status || 'UPLOADED';
                        const isProcessDone = apkStatus === 'COMPLETED' || apkStatus === 'FAILED' || apkStatus === 'PROCESSING';

                        return (
                            <tr
                                key={project.id}
                                onClick={() => onProjectClick?.(project)}
                                className="hover:bg-gray-50/60 transition-colors cursor-pointer relative"
                            >
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                            <FolderIcon size={16} weight="duotone" className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors">
                                            {project.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`text-sm line-clamp-1 ${!project.description || project.description === "null" ? "text-gray-400 italic" : "text-gray-500"}`}>
                                        {project.description && project.description !== "null" ? project.description : "No description provided"}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="inline-flex items-center text-xs font-medium text-gray-700 bg-gray-100 px-2.5 py-1 rounded-full">
                                        {project.testType}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${outcome.className}`}>
                                        <OutcomeIcon size={14} weight="bold" />
                                        {project.outcome}
                                    </span>
                                </td>
                                <td className="px-5 py-3.5 text-right relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setOpenMenuId(openMenuId === project.id ? null : project.id);
                                        }}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
                                    >
                                        <DotsThreeVerticalIcon size={20} weight="bold" />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {openMenuId === project.id && (
                                        <div
                                            ref={menuRef}
                                            className="absolute right-8 top-10 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
                                        >
                                            <div className="py-1">
                                                <button
                                                    onClick={(e) => handleAction(e, 'start', project)}
                                                    disabled={isProcessDone}
                                                    className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 transition-colors ${isProcessDone
                                                        ? 'text-gray-400 cursor-not-allowed bg-gray-50'
                                                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <PlayIcon size={16} />
                                                    Start Analysis
                                                </button>
                                                <button
                                                    onClick={(e) => handleAction(e, 'rename', project)}
                                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition-colors"
                                                >
                                                    <PencilSimpleIcon size={16} />
                                                    Rename
                                                </button>
                                                <div className="h-px bg-gray-100 my-1"></div>
                                                <button
                                                    onClick={(e) => handleAction(e, 'delete', project)}
                                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                >
                                                    <TrashIcon size={16} />
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>

            {/* Delete Confirmation Modal */}
            <DeleteProjectModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={confirmDelete}
                projectName={projectToDelete?.name || ''}
            />
        </div>
    )
}

export default ProjectsTable
