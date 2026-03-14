"use client"
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    XIcon,
    InfoIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    ClockIcon,
    FileArrowUpIcon,
    TrashIcon,
    PencilSimpleIcon,
    PlayIcon,
    AndroidLogoIcon,
    CalendarBlankIcon,
    LinkSimpleIcon,
    ArrowSquareOutIcon,
    SpinnerGapIcon,
} from '@phosphor-icons/react';
import { Project } from './ProjectsTable';
import axios from 'axios';
import DeleteProjectModal from './DeleteProjectModal';

interface ProjectDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onRefresh: () => void;
}

const statusConfig: Record<string, {
    label: string;
    detail: string;
    colorClass: string;
    pillClass: string;
    dotClass: string;
    icon: React.ElementType;
}> = {
    PENDING: {
        label: 'Pending',
        detail: 'Queued for processing',
        colorClass: 'text-amber-600',
        pillClass: 'bg-amber-50 border-amber-200 text-amber-700',
        dotClass: 'bg-amber-400 animate-pulse',
        icon: ClockIcon,
    },
    READY: {
        label: 'Ready',
        detail: 'GitHub URL verified, ready for analysis',
        colorClass: 'text-blue-600',
        pillClass: 'bg-blue-50 border-blue-200 text-blue-700',
        dotClass: 'bg-blue-400',
        icon: InfoIcon,
    },
    UPLOADED: {
        label: 'Uploaded',
        detail: 'File uploaded successfully',
        colorClass: 'text-blue-600',
        pillClass: 'bg-blue-50 border-blue-200 text-blue-700',
        dotClass: 'bg-blue-400',
        icon: FileArrowUpIcon,
    },
    PROCESSING: {
        label: 'Processing',
        detail: 'Analysis in progress',
        colorClass: 'text-purple-600',
        pillClass: 'bg-purple-50 border-purple-200 text-purple-700',
        dotClass: 'bg-purple-500 animate-pulse',
        icon: SpinnerGapIcon,
    },
    COMPLETED: {
        label: 'Completed',
        detail: 'Analysis finished successfully',
        colorClass: 'text-emerald-600',
        pillClass: 'bg-emerald-50 border-emerald-200 text-emerald-700',
        dotClass: 'bg-emerald-400',
        icon: CheckCircleIcon,
    },
    FAILED: {
        label: 'Failed',
        detail: 'Analysis encountered an error',
        colorClass: 'text-red-500',
        pillClass: 'bg-red-50 border-red-200 text-red-600',
        dotClass: 'bg-red-400',
        icon: WarningCircleIcon,
    },
};

const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
    isOpen,
    onClose,
    project,
    onRefresh,
}) => {
    const [isRenaming, setIsRenaming] = useState(false);
    const [newName, setNewName] = useState('');
    const router = useRouter();
    const [loadingAction, setLoadingAction] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Logic if needed on open
        }
    }, [isOpen]);

    if (!isOpen || !project) return null;

    const apkStatus = project.apk?.status || 'UPLOADED';
    const cfg = statusConfig[apkStatus] || statusConfig['UPLOADED'];
    const StatusIcon = cfg.icon;
    const isProcessDone = apkStatus === 'COMPLETED' || apkStatus === 'FAILED' || apkStatus === 'PROCESSING';

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric', month: 'short', day: 'numeric'
        });
    };

    const handleRename = async () => {
        if (!newName.trim() || newName === project.name) {
            setIsRenaming(false);
            return;
        }
        setLoadingAction('rename');
        setError(null);
        try {
            await axios.patch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`,
                { name: newName.trim() },
                { withCredentials: true }
            );
            setIsRenaming(false);
            onRefresh();
        } catch (err) {
            const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to rename project';
            setError(errorMsg || 'Failed to rename project');
        } finally {
            setLoadingAction(null);
        }
    };

    const confirmDelete = async () => {
        await axios.delete(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}`,
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
            await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${project.id}/start`,
                {},
                { withCredentials: true }
            );
            onRefresh();
        } catch (err) {
            const errorMsg = axios.isAxiosError(err) ? err.response?.data?.error : 'Failed to start analysis';
            setError(errorMsg || 'Failed to start analysis');
        } finally {
            setLoadingAction(null);
        }
    };

    return (
        <>
            <style>{`
                @keyframes modalBackdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
                @keyframes rowFadeIn {
                    from { opacity: 0; transform: translateX(-8px); }
                    to   { opacity: 1; transform: translateX(0); }
                }
                @keyframes spinSlow {
                    from { transform: rotate(0deg); }
                    to   { transform: rotate(360deg); }
                }
                .modal-backdrop { animation: modalBackdropIn 0.2s ease forwards; }
                .modal-panel    { animation: modalSlideUp 0.25s cubic-bezier(0.16,1,0.3,1) forwards; }
                .row-1 { animation: rowFadeIn 0.3s ease 0.05s both; }
                .row-2 { animation: rowFadeIn 0.3s ease 0.12s both; }
                .row-3 { animation: rowFadeIn 0.3s ease 0.19s both; }
                .row-4 { animation: rowFadeIn 0.3s ease 0.26s both; }
                .row-5 { animation: rowFadeIn 0.3s ease 0.33s both; }
                .spin-slow { animation: spinSlow 1.2s linear infinite; }
                .action-btn {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.15s ease, box-shadow 0.15s ease;
                }
                .action-btn:not(:disabled):hover {
                    transform: translateY(-1px);
                }
                .action-btn:not(:disabled):active {
                    transform: translateY(0px);
                }
                .action-btn::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: white;
                    opacity: 0;
                    transition: opacity 0.15s ease;
                }
                .action-btn:not(:disabled):hover::after { opacity: 0.08; }
                .action-btn:not(:disabled):active::after { opacity: 0.18; }
            `}</style>

            {/* Backdrop */}
            <div
                className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-gray-950/60 backdrop-blur-sm p-0 sm:p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Panel */}
                <div className="modal-panel bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-green-100 border-1 border-green-500 flex items-center justify-center">
                                <AndroidLogoIcon size={18} weight="duotone" className="text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">APK Project</p>
                                <h2 className="text-base font-semibold text-gray-900 leading-tight">Project Details</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <XIcon size={18} weight="bold" />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-5 space-y-1">

                            {/* Error */}
                            {error && (
                                <div className="flex items-start gap-2.5 p-3 mb-3 text-sm text-red-700 bg-red-50 rounded-xl border border-red-200">
                                    <WarningCircleIcon size={16} className="mt-0.5 shrink-0 text-red-500" />
                                    {error}
                                </div>
                            )}

                            {/* Project Name row */}
                            <div className="row-1 group flex items-start gap-3 py-3.5 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <PencilSimpleIcon size={15} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-400 mb-1">Project Name</p>
                                    {isRenaming ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                                autoFocus
                                                disabled={loadingAction === 'rename'}
                                                className="flex-1 min-w-0 px-2.5 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-gray-900"
                                            />
                                            <button
                                                onClick={handleRename}
                                                disabled={loadingAction === 'rename'}
                                                className="px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 disabled:opacity-50 transition-colors"
                                            >
                                                {loadingAction === 'rename' ? 'Saving…' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setIsRenaming(false)}
                                                className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-100 rounded-lg text-xs font-medium transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{project.name}</p>
                                            <button
                                                onClick={() => { setNewName(project.name); setIsRenaming(true); }}
                                                className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-all"
                                            >
                                                <PencilSimpleIcon size={13} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description row */}
                            <div className="row-2 flex items-start gap-3 py-3.5 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <InfoIcon size={15} className="text-gray-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-400 mb-1">Description</p>
                                    {project.description && project.description !== 'null' ? (
                                        <p className="text-sm text-gray-700 leading-relaxed">{project.description}</p>
                                    ) : (
                                        <p className="text-sm text-gray-400 italic">No description provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Status row */}
                            <div className="row-3 flex items-start gap-3 py-3.5 border-b border-gray-50">
                                <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dotClass}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-medium text-gray-400 mb-1.5">Status</p>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.pillClass}`}>
                                            <StatusIcon
                                                size={13}
                                                weight="bold"
                                                className={apkStatus === 'PROCESSING' ? 'spin-slow' : ''}
                                            />
                                            {cfg.label}
                                        </span>
                                        <span className="text-xs text-gray-400">{cfg.detail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* APK Source row */}
                            {project.apk?.sourceUrl && (
                                <div className="row-4 flex items-start gap-3 py-3.5 border-b border-gray-50">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <LinkSimpleIcon size={15} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-400 mb-1">Source URL</p>
                                        <a
                                            href={project.apk.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 font-mono bg-gray-50 border border-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors max-w-full truncate group/link"
                                        >
                                            <span className="truncate">{project.apk.sourceUrl.replace('https://github.com/', '')}</span>
                                            <ArrowSquareOutIcon size={11} className="shrink-0 opacity-50 group-hover/link:opacity-100 transition-opacity" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Created at row */}
                            {project.createdAt && (
                                <div className="row-5 flex items-start gap-3 py-3.5">
                                    <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 mt-0.5">
                                        <CalendarBlankIcon size={15} className="text-gray-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-gray-400 mb-1">Created</p>
                                        <p className="text-sm text-gray-700">{formatDate(project.createdAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 grid grid-cols-2 sm:flex sm:items-center gap-2.5">
                        {/* Start Analysis */}
                        <button
                            onClick={handleStart}
                            disabled={isProcessDone || loadingAction === 'start'}
                            className={`action-btn h-11 flex-1 flex items-center justify-center gap-2 px-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap
                                ${isProcessDone
                                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                    : 'bg-slate-900 text-white shadow-sm hover:bg-slate-800'
                                } ${loadingAction === 'start' ? 'opacity-70' : ''}`}
                        >
                            {loadingAction === 'start' ? (
                                <SpinnerGapIcon size={16} className="animate-spin" />
                            ) : (
                                <PlayIcon size={16} weight="fill" />
                            )}
                            <span>{loadingAction === 'start' ? 'Starting…' : 'Run Analysis'}</span>
                        </button>

                        {/* Rename */}
                        <button
                            onClick={() => { setNewName(project.name); setIsRenaming(true); }}
                            className="action-btn h-11 flex-1 flex items-center justify-center gap-2 px-3 border border-slate-200 bg-white text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all whitespace-nowrap"
                        >
                            <PencilSimpleIcon size={16} />
                            <span>Rename</span>
                        </button>

                        {/* View Report */}
                        {apkStatus === 'COMPLETED' && (
                            <button
                                onClick={() => router.push(`/dashboard/projects/${project.id}/report`)}
                                className="action-btn h-11 flex-1 flex items-center justify-center gap-2 px-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm whitespace-nowrap"
                            >
                                <ArrowSquareOutIcon size={16} weight="bold" />
                                <span>View Report</span>
                            </button>
                        )}

                        {/* Delete */}
                        <button
                            onClick={() => setIsDeleteDialogOpen(true)}
                            disabled={loadingAction === 'delete'}
                            className={`action-btn h-11 flex-1 flex items-center justify-center gap-2 px-3 border border-red-200 bg-white text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-all whitespace-nowrap ${loadingAction === 'delete' ? 'opacity-70' : ''}`}
                        >
                            <TrashIcon size={16} />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>

            <DeleteProjectModal
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={confirmDelete}
                projectName={project.name}
            />
        </>
    );
};

export default ProjectDetailsModal;