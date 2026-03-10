"use client"
import React, { useState } from 'react';
import { WarningCircleIcon, XIcon, TrashIcon } from '@phosphor-icons/react';

interface DeleteProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    projectName: string;
}

const DeleteProjectModal: React.FC<DeleteProjectModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    projectName
}) => {
    const [confirmText, setConfirmText] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        if (confirmText !== 'delete') return;

        setIsDeleting(true);
        setError(null);
        try {
            await onConfirm();
            setConfirmText(''); // Reset on success to be safe, although it will unmount
            onClose();
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to delete project');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-red-50/50">
                    <div className="flex items-center gap-2 text-red-600">
                        <WarningCircleIcon size={24} weight="fill" />
                        <h2 className="text-lg font-semibold">Delete Project</h2>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-white rounded-lg transition-colors disabled:opacity-50"
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

                    <div className="text-sm text-gray-600 space-y-2">
                        <p>
                            You are about to permanently delete the project <span className="font-semibold text-gray-900">"{projectName}"</span>.
                        </p>
                        <p>
                            This action <strong>cannot be undone</strong>. All associated APK files and analysis data will be permanently removed.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-900">
                            To confirm, type <strong>delete</strong> below:
                        </label>
                        <input
                            type="text"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Type 'delete' to confirm"
                            disabled={isDeleting}
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-gray-900 disabled:bg-gray-50 disabled:text-gray-500"
                            autoComplete="off"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={confirmText !== 'delete' || isDeleting}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                    >
                        <TrashIcon size={16} />
                        {isDeleting ? 'Deleting...' : 'Delete Project'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteProjectModal;
