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
        colorClass: 'text-amber-400',
        pillClass: 'bg-amber-400/10 border-amber-400/20 text-amber-400',
        dotClass: 'bg-amber-400 animate-pulse',
        icon: ClockIcon,
    },
    READY: {
        label: 'Ready',
        detail: 'URL verified, ready for analysis',
        colorClass: 'text-blue-400',
        pillClass: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
        dotClass: 'bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.5)]',
        icon: InfoIcon,
    },
    UPLOADED: {
        label: 'Uploaded',
        detail: 'File uploaded successfully',
        colorClass: 'text-blue-400',
        pillClass: 'bg-blue-400/10 border-blue-400/20 text-blue-400',
        dotClass: 'bg-blue-400',
        icon: FileArrowUpIcon,
    },
    PROCESSING: {
        label: 'Processing',
        detail: 'Analysis in progress',
        colorClass: 'text-[#BDF34E]',
        pillClass: 'bg-[#BDF34E]/10 border-[#BDF34E]/20 text-[#BDF34E]',
        dotClass: 'bg-[#BDF34E] animate-pulse shadow-[0_0_12px_#BDF34E]',
        icon: SpinnerGapIcon,
    },
    COMPLETED: {
        label: 'Completed',
        detail: 'Analysis finished successfully',
        colorClass: 'text-[#BDF34E]',
        pillClass: 'bg-[#BDF34E]/10 border-[#BDF34E]/20 text-[#BDF34E]',
        dotClass: 'bg-[#BDF34E] shadow-[0_0_8px_#BDF34E]',
        icon: CheckCircleIcon,
    },
    FAILED: {
        label: 'Failed',
        detail: 'Analysis encountered an error',
        colorClass: 'text-red-400',
        pillClass: 'bg-red-400/10 border-red-400/20 text-red-400',
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
                .modal-panel    { animation: modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
                .row-1 { animation: rowFadeIn 0.3s ease 0.05s both; }
                .row-2 { animation: rowFadeIn 0.3s ease 0.12s both; }
                .row-3 { animation: rowFadeIn 0.3s ease 0.19s both; }
                .row-4 { animation: rowFadeIn 0.3s ease 0.26s both; }
                .row-5 { animation: rowFadeIn 0.3s ease 0.33s both; }
                .spin-slow { animation: spinSlow 1.2s linear infinite; }
                .action-btn {
                    position: relative;
                    overflow: hidden;
                    transition: transform 0.15s ease, box-shadow 0.15s ease, background-color 0.15s ease;
                }
                .action-btn:not(:disabled):hover {
                    transform: translateY(-1px);
                }
                .action-btn:not(:disabled):active {
                    transform: translateY(0px);
                }
            `}</style>

            {/* Backdrop */}
            <div
                className="modal-backdrop fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/70 backdrop-blur-md p-0 sm:p-4"
                onClick={(e) => e.target === e.currentTarget && onClose()}
            >
                {/* Panel */}
                <div className="modal-panel bg-[#161616] border border-white/5 w-full sm:max-w-lg sm:rounded-[40px] rounded-t-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92dvh]">

                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center">
                                <AndroidLogoIcon size={24} weight="duotone" className="text-[#BDF34E]" />
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mb-0.5">Project Profile</p>
                                <h2 className="text-xl font-bold text-white tracking-tight">Project Details</h2>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                        >
                            <XIcon size={20} weight="bold" />
                        </button>
                    </div>

                    {/* Scrollable body */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-8 space-y-2">

                            {/* Error */}
                            {error && (
                                <div className="flex items-center gap-3 p-4 mb-4 text-sm text-red-400 bg-red-400/10 rounded-2xl border border-red-400/20">
                                    <WarningCircleIcon size={18} className="shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Project Name row */}
                            <div className="row-1 group flex items-start gap-5 py-5 border-b border-white/[0.03]">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <PencilSimpleIcon size={18} weight="duotone" className="text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Project Name</p>
                                    {isRenaming ? (
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="text"
                                                value={newName}
                                                onChange={(e) => setNewName(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                                                autoFocus
                                                disabled={loadingAction === 'rename'}
                                                className="flex-1 min-w-0 px-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#BDF34E]/50 focus:border-[#BDF34E]/50 text-white transition-all"
                                            />
                                            <button
                                                onClick={handleRename}
                                                disabled={loadingAction === 'rename'}
                                                className="px-4 py-2 bg-[#BDF34E] text-black rounded-xl text-xs font-bold hover:bg-[#D4FF7E] disabled:opacity-50 transition-colors"
                                            >
                                                {loadingAction === 'rename' ? 'Saving…' : 'Save'}
                                            </button>
                                            <button
                                                onClick={() => setIsRenaming(false)}
                                                className="px-3 py-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl text-xs font-bold transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-3">
                                            <p className="text-sm font-bold text-white tracking-tight truncate">{project.name}</p>
                                            <button
                                                onClick={() => { setNewName(project.name); setIsRenaming(true); }}
                                                className="opacity-0 group-hover:opacity-100 p-2 text-white/30 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                            >
                                                <PencilSimpleIcon size={14} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Description row */}
                            <div className="row-2 flex items-start gap-5 py-5 border-b border-white/[0.03]">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <InfoIcon size={18} weight="duotone" className="text-white/40" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Description</p>
                                    {project.description && project.description !== 'null' ? (
                                        <p className="text-sm text-white/70 leading-relaxed">{project.description}</p>
                                    ) : (
                                        <p className="text-sm text-white/20 italic">No description provided</p>
                                    )}
                                </div>
                            </div>

                            {/* Status row */}
                            <div className="row-3 flex items-start gap-5 py-5 border-b border-white/[0.03]">
                                <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                    <span className={`w-3 h-3 rounded-full ${cfg.dotClass}`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-3">Analysis Status</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className={`inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] px-4 py-2 rounded-xl border ${cfg.pillClass}`}>
                                            <StatusIcon
                                                size={14}
                                                weight="bold"
                                                className={apkStatus === 'PROCESSING' || apkStatus === 'PENDING' ? 'spin-slow' : ''}
                                            />
                                            {cfg.label}
                                        </span>
                                        <span className="text-xs font-medium text-white/40">{cfg.detail}</span>
                                    </div>
                                </div>
                            </div>

                            {/* APK Source row */}
                            {project.apk?.sourceUrl && (
                                <div className="row-4 flex items-start gap-5 py-5 border-b border-white/[0.03]">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <LinkSimpleIcon size={18} weight="duotone" className="text-white/40" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Build Source</p>
                                        <a
                                            href={project.apk.sourceUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-2 group/link"
                                        >
                                            <span className="text-xs font-bold text-white/60 hover:text-[#BDF34E] font-mono bg-white/5 border border-white/10 px-4 py-2 rounded-xl transition-all truncate hover:border-[#BDF34E]/40">
                                                {project.apk.sourceUrl.replace('https://github.com/', '')}
                                                <ArrowSquareOutIcon size={14} className="inline ml-2 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Created at row */}
                            {project.createdAt && (
                                <div className="row-5 flex items-start gap-5 py-5">
                                    <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <CalendarBlankIcon size={18} weight="duotone" className="text-white/40" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-white/20 uppercase tracking-[0.2em] mb-2">Created Date</p>
                                        <p className="text-sm font-bold text-white tracking-tight">{formatDate(project.createdAt)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="px-8 py-6 bg-white/[0.02] border-t border-white/5 grid grid-cols-2 sm:flex sm:items-center gap-4">
                        {/* Start Analysis */}
                        <button
                            onClick={handleStart}
                            disabled={isProcessDone || loadingAction === 'start'}
                            className={`action-btn h-14 flex-1 flex items-center justify-center gap-3 px-6 rounded-2xl text-sm font-bold transition-all whitespace-nowrap shadow-xl
                                ${isProcessDone
                                    ? 'bg-white/5 text-white/20 cursor-not-allowed grayscale'
                                    : 'bg-[#BDF34E] text-black hover:bg-[#D4FF7E] shadow-[#BDF34E]/10'
                                } ${loadingAction === 'start' ? 'opacity-70' : ''}`}
                        >
                            {loadingAction === 'start' ? (
                                <SpinnerGapIcon size={18} className="animate-spin" />
                            ) : (
                                <PlayIcon size={18} weight="fill" />
                            )}
                            <span>{loadingAction === 'start' ? 'Starting…' : 'Run Scan'}</span>
                        </button>

                        {/* View Report */}
                        {apkStatus === 'COMPLETED' && (
                            <button
                                onClick={() => router.push(`/dashboard/projects/${project.id}/report`)}
                                className="action-btn h-14 flex-1 flex items-center justify-center gap-3 px-6 bg-white text-black rounded-2xl text-sm font-bold hover:bg-white/90 transition-all shadow-xl whitespace-nowrap"
                            >
                                <ArrowSquareOutIcon size={18} weight="bold" />
                                <span>Report</span>
                            </button>
                        )}

                        {/* Rename & Delete for secondary actions */}
                        <div className="flex gap-4 sm:ml-auto">
                            <button
                                onClick={() => { setNewName(project.name); setIsRenaming(true); }}
                                className="action-btn w-14 h-14 flex items-center justify-center border border-white/10 bg-white/5 text-white rounded-2xl hover:bg-white/10 transition-all shrink-0"
                                title="Rename Project"
                            >
                                <PencilSimpleIcon size={20} />
                            </button>

                            <button
                                onClick={() => setIsDeleteDialogOpen(true)}
                                disabled={loadingAction === 'delete'}
                                className={`action-btn w-14 h-14 flex items-center justify-center border border-red-400/20 bg-red-400/10 text-red-400 rounded-2xl hover:bg-red-400/20 transition-all shrink-0 ${loadingAction === 'delete' ? 'opacity-70' : ''}`}
                                title="Delete Project"
                            >
                                <TrashIcon size={20} />
                            </button>
                        </div>
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
