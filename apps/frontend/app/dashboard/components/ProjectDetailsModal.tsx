"use client"
import React, { useState } from 'react';
import { XIcon, InfoIcon, CheckCircleIcon, WarningCircleIcon, ClockIcon, FileArrowUpIcon, TrashIcon, PencilSimpleIcon, PlayIcon } from '@phosphor-icons/react';
import { Project } from './ProjectsTable';
import axios from 'axios';
import DeleteProjectModal from './DeleteProjectModal';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onRefresh: () => void;
}

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({ isOpen, onClose, project, onRefresh }) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    if (!isOpen || !project) return null;

    const apkStatus = project.apk?.status || 'UPLOADED'; // default if missing somehow

    const statusConfig: Record<string, { label: string, detail: string, colorClass: string, icon: React.ElementType }> = {
        PENDING: { label: 'Pending', detail: 'Queued for processing', colorClass: 'text-amber-600 bg-amber-50 border-amber-200', icon: ClockIcon },
        READY: { label: 'Ready', detail: 'GitHub URL provided, ready for worker to fetch', colorClass: 'text-blue-600 bg-blue-50 border-blue-200', icon: InfoIcon },
        UPLOADED: { label: 'Uploaded', detail: 'File uploaded successfully', colorClass: 'text-blue-600 bg-blue-50 border-blue-200', icon: FileArrowUpIcon },
        PROCESSING: { label: 'Processing', detail: 'Analysis in progress', colorClass: 'text-purple-600 bg-purple-50 border-purple-200', icon: ClockIcon },
        COMPLETED: { label: 'Completed', detail: 'Analysis done', colorClass: 'text-green-600 bg-green-50 border-green-200', icon: CheckCircleIcon },
        FAILED: { label: 'Failed', detail: 'Analysis failed', colorClass: 'text-red-500 bg-red-50 border-red-200', icon: WarningCircleIcon },
    };

    const currentStatusConfig = statusConfig[apkStatus] || statusConfig['UPLOADED'];
    const StatusIcon = currentStatusConfig.icon;

    const isProcessDone = apkStatus === 'COMPLETED' || apkStatus === 'FAILED' || apkStatus === 'PROCESSING';

    const handleRename = async () => {
        if (!newName.trim() || newName === project.name) {
            setIsRenaming(false);
            return;
        }

        setLoadingAction('rename');
        setError(null);
        try {
            await axios.patch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`, {
                name: newName.trim()
            }, { withCredentials: true });

            setIsRenaming(false);
            onRefresh();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to rename project');
        } finally {
            setLoadingAction(null);
        }
    };

    const handleDeleteClick = () => {
        setIsDeleteDialogOpen(true);
    };

    const confirmDelete = async () => {
        await axios.delete(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`,
            { withCredentials: true }
        );
        onClose();
        onRefresh();
    };

    const handleStart = async () => {
        if (isProcessDone) return;

        setLoadingAction('start');
        setError(null);
        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}/start`,
                {}, { withCredentials: true }
            );

            onRefresh();
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to start analysis');
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-900">Project Details</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <XIcon size={20} weight="bold" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 flex items-center gap-2">
                            <WarningCircleIcon size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Name */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Project Name</label>
                            {isRenaming ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                                        autoFocus
                                        disabled={loadingAction === 'rename'}
                                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                    />
                                    <button
                                        onClick={handleRename}
                                        disabled={loadingAction === 'rename'}
                                        className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
                                    >
                                        Save
                                    </button>
                                    <button
                                        onClick={() => setIsRenaming(false)}
                                        disabled={loadingAction === 'rename'}
                                        className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-medium disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 group">
                                    <p className="text-lg font-medium text-gray-900">{project.name}</p>
                                    <button
                                        onClick={() => {
                                            setNewName(project.name);
                                            setIsRenaming(true);
                                        }}
                                        className="p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-all rounded hover:bg-gray-100"
                                    >
                                        <PencilSimpleIcon size={16} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Description</label>
                            {project.description && project.description !== "null" ? (
                                <p className="text-gray-900">{project.description}</p>
                            ) : (
                                <p className="text-gray-500 italic">No description provided</p>
                            )}
                        </div>

                        {/* Status with hover */}
                        <div>
                            <label className="text-sm font-medium text-gray-500 mb-1 block">Status</label>
                            <div className="relative inline-flex items-center group">
                                <span className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border ${currentStatusConfig.colorClass}`}>
                                    <StatusIcon size={16} weight="bold" />
                                    {currentStatusConfig.label}
                                </span>

                                {/* Tooltip */}
                                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-max max-w-xs z-10 pointer-events-none animate-in fade-in slide-in-from-bottom-1 border border-gray-200 shadow-lg bg-gray-900 text-white text-xs rounded-lg py-2 px-3">
                                    {currentStatusConfig.detail}
                                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer / Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center gap-3">
                    <button
                        onClick={handleStart}
                        disabled={isProcessDone || loadingAction === 'start'}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${isProcessDone
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-gray-900 text-white hover:bg-gray-800 shadow-sm'
                            } ${loadingAction === 'start' ? 'opacity-70' : ''}`}
                    >
                        <PlayIcon size={16} weight="bold" />
                        {loadingAction === 'start' ? 'Starting...' : 'Start'}
                    </button>

                    <button
                        onClick={() => {
                            setNewName(project.name);
                            setIsRenaming(true);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 bg-white text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                        <PencilSimpleIcon size={16} />
                        Rename
                    </button>

                    <button
                        onClick={handleDeleteClick}
                        disabled={loadingAction === 'delete'}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 bg-white text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors ${loadingAction === 'delete' ? 'opacity-70' : ''}`}
                    >
                        <TrashIcon size={16} />
                        {loadingAction === 'delete' ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>

            <DeleteProjectModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                projectName={project.name}
            />
        </div>
    );
};

export default ProjectDetailsModal;
