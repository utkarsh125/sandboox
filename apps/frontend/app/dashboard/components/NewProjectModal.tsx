"use client"
import React, { useState } from 'react'
import {
    XIcon,
    AndroidLogoIcon,
    GlobeSimpleIcon,
    LockIcon,
    ArrowLeftIcon,
    TextTIcon,
    NotePencilIcon,
    RocketIcon,
    GithubLogoIcon,
    UploadSimpleIcon,
    LinkIcon,
    CheckCircleIcon,
    WarningCircleIcon,
    SpinnerIcon,
} from '@phosphor-icons/react'
import axios from 'axios'

interface NewProjectModalProps {
    isOpen: boolean
    onClose: () => void
}

type TestType = 'APK' | null
type Step = 'select' | 'details'

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose }) => {
    const [step, setStep] = useState<Step>('select')
    const [testType, setTestType] = useState<TestType>(null)
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [sourceUrl, setSourceUrl] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const isGithubUrl = sourceUrl.startsWith('https://github.com/')
    const githubPath = isGithubUrl ? sourceUrl.replace('https://github.com/', '') : ''

    const handleClose = () => {
        setStep('select')
        setTestType(null)
        setName('')
        setDescription('')
        setSourceUrl('')
        setError(null)
        setIsLoading(false)
        onClose()
    }

    const handleSelectApk = () => {
        setTestType('APK')
        setStep('details')
    }

    const handleBack = () => {
        setStep('select')
        setTestType(null)
        setError(null)
    }

    const handleCreate = async () => {
        setError(null)
        setIsLoading(true)
        try {
            const { data } = await axios.post(
                `/api/projects`,
                {
                    name,
                    description,
                    testType,
                    sourceUrl: sourceUrl || undefined,
                    fileName: isGithubUrl ? sourceUrl.split('/').pop() : undefined
                },
                { withCredentials: true }
            )
            console.log("Project created:", data)
            handleClose()
        } catch (err: any) {
            const message = err.response?.data?.error || "Failed to create project. Please try again."
            setError(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <style>{`
                @keyframes modalBackdropIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
                @keyframes modalSlideUp {
                    from { opacity: 0; transform: translateY(24px) scale(0.97); }
                    to   { opacity: 1; transform: translateY(0)   scale(1); }
                }
                .modal-backdrop { animation: modalBackdropIn 0.2s ease forwards; }
                .modal-panel    { animation: modalSlideUp 0.3s cubic-bezier(0.16,1,0.3,1) forwards; }
            `}</style>

            {/* Backdrop */}
            <div
                className="modal-backdrop absolute inset-0 bg-black/70 backdrop-blur-md"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="modal-panel relative bg-[#161616] border border-white/5 rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-white/5">
                    <div className="flex items-center gap-4">
                        {step === 'details' && (
                            <button
                                onClick={handleBack}
                                className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer"
                            >
                                <ArrowLeftIcon size={18} weight="bold" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">
                                {step === 'select' ? 'New Project' : 'Project Details'}
                            </h2>
                            <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] mt-1">
                                {step === 'select'
                                    ? 'Select Environment'
                                    : 'Define Workspace'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="w-10 h-10 flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 rounded-2xl transition-all cursor-pointer"
                    >
                        <XIcon size={20} weight="bold" />
                    </button>
                </div>

                {/* Step 1: Select test type */}
                {step === 'select' && (
                    <>
                        <div className="p-8 space-y-4">
                            {/* APK Testing */}
                            <button
                                onClick={handleSelectApk}
                                className="w-full group flex items-center gap-5 p-5 rounded-[24px] border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-[#BDF34E]/30 transition-all cursor-pointer"
                            >
                                <div className="w-14 h-14 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <AndroidLogoIcon size={28} weight="duotone" className="text-[#BDF34E]" />
                                </div>
                                <div className="text-left flex-1 min-w-0">
                                    <div className="font-bold text-white text-base tracking-tight">APK Scanning</div>
                                    <p className="text-sm text-white/40 mt-1 leading-relaxed">
                                        End-to-end security analysis for Android binaries
                                    </p>
                                </div>
                                <div className="text-[10px] font-black text-[#BDF34E] bg-[#BDF34E]/10 border border-[#BDF34E]/10 px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-[0_0_12px_rgba(189,243,78,0.1)]">
                                    LIVE
                                </div>
                            </button>

                            {/* Website Testing – Locked */}
                            <div className="relative group">
                                <button
                                    disabled
                                    className="w-full flex items-center gap-5 p-5 rounded-[24px] border border-white/[0.02] bg-black/20 opacity-40 cursor-not-allowed"
                                >
                                    <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                                        <GlobeSimpleIcon size={28} weight="duotone" className="text-white/20" />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="font-bold text-white/30 text-base tracking-tight">Web Audit</div>
                                        <p className="text-sm text-white/20 mt-1 leading-relaxed">
                                            Vulnerability scanning for URLs and web services
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                        <LockIcon size={12} weight="bold" />
                                        Locked
                                    </div>
                                </button>
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-2 bg-white text-black text-[10px] font-black uppercase tracking-widest rounded-xl opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-2xl">
                                    Coming Soon
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-white"></div>
                                </div>
                            </div>
                        </div>

                        <div className="px-8 py-5 border-t border-white/5 bg-white/[0.01]">
                            <p className="text-[10px] font-bold text-white/20 text-center uppercase tracking-[0.2em]">
                                More modules arriving in Q3 2026
                            </p>
                        </div>
                    </>
                )}

                {/* Step 2: Project details */}
                {step === 'details' && (
                    <>
                        <div className="p-8 space-y-6">
                            {/* Selected type indicator */}
                            <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#BDF34E]/10 border border-[#BDF34E]/10">
                                <AndroidLogoIcon size={20} weight="duotone" className="text-[#BDF34E]" />
                                <span className="text-[10px] font-extrabold text-[#BDF34E] uppercase tracking-widest">Selected Environment: APK Scanning</span>
                            </div>

                            {/* Global error banner */}
                            {error && (
                                <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-400/10 border border-red-400/20">
                                    <WarningCircleIcon size={18} weight="fill" className="text-red-400 shrink-0" />
                                    <p className="text-sm text-red-400 leading-relaxed font-medium">{error}</p>
                                </div>
                            )}

                            {/* Name field */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                                    <TextTIcon size={14} weight="bold" />
                                    Project Identifier
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Finance Core v2"
                                    className="w-full px-5 py-3.5 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-[#BDF34E]/40 focus:ring-4 focus:ring-[#BDF34E]/5 transition-all"
                                />
                            </div>

                            {/* Description field */}
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                                    <NotePencilIcon size={14} weight="bold" />
                                    Brief Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Outline the scope of this project..."
                                    rows={3}
                                    className="w-full px-5 py-3.5 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-[#BDF34E]/40 focus:ring-4 focus:ring-[#BDF34E]/5 transition-all resize-none"
                                />
                            </div>

                            {/* APK Source */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-[0.15em]">
                                    <LinkIcon size={14} weight="bold" />
                                    Build Artifact Source
                                </label>

                                <div className="space-y-3">
                                    {isGithubUrl ? (
                                        <div className="flex items-center gap-3 w-full px-5 py-3.5 border border-[#BDF34E]/20 bg-[#BDF34E]/5 rounded-2xl group">
                                            <GithubLogoIcon size={22} weight="fill" className="text-white shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[10px] font-bold text-[#BDF34E] uppercase tracking-widest mb-0.5">Verified Repository</p>
                                                <p className="text-xs text-white/60 truncate font-mono">{githubPath}</p>
                                            </div>
                                            <CheckCircleIcon size={22} weight="fill" className="text-[#BDF34E] shrink-0" />
                                            <button
                                                onClick={() => { setSourceUrl(''); setError(null); }}
                                                className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white rounded-xl transition-all cursor-pointer"
                                            >
                                                <XIcon size={14} weight="bold" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={sourceUrl}
                                                onChange={(e) => { setSourceUrl(e.target.value); setError(null); }}
                                                placeholder="https://github.com/org/repo/artifact.apk"
                                                className="w-full px-5 py-3.5 pr-12 text-sm bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/20 outline-none focus:border-[#BDF34E]/40 focus:ring-4 focus:ring-[#BDF34E]/5 transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20">
                                                <GithubLogoIcon size={20} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Inline URL hints */}
                                    {sourceUrl && !isGithubUrl && (
                                        <p className="flex items-center gap-2 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                                            <WarningCircleIcon size={14} weight="fill" />
                                            Requires valid GitHub URL
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-4 py-2">
                                    <div className="flex-1 h-px bg-white/5" />
                                    <span className="text-[10px] font-black text-white/20 tracking-tighter">OR</span>
                                    <div className="flex-1 h-px bg-white/5" />
                                </div>

                                {/* Upload APK — Disabled */}
                                <div className="relative group">
                                    <button
                                        disabled
                                        className="w-full flex items-center gap-4 px-5 py-4 border border-white/[0.02] bg-black/20 rounded-2xl opacity-40 cursor-not-allowed group-hover:opacity-60 transition-opacity"
                                    >
                                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                                            <UploadSimpleIcon size={20} weight="bold" className="text-white/40" />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Asset Upload</p>
                                            <p className="text-xs text-white/20 font-medium">Drop binary file directly</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[10px] font-black text-white/20 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl uppercase tracking-widest">
                                            <LockIcon size={12} weight="bold" />
                                            Locked
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-8 py-6 border-t border-white/5 bg-white/[0.02] flex items-center justify-end gap-5">
                            <button
                                onClick={handleClose}
                                className="h-14 px-6 text-sm font-bold text-white/40 hover:text-white transition-all cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name.trim() || !isGithubUrl || isLoading}
                                className="inline-flex items-center gap-3 px-8 h-14 text-sm font-bold text-black bg-[#BDF34E] hover:bg-[#D4FF7E] disabled:bg-white/5 disabled:text-white/10 disabled:grayscale disabled:cursor-not-allowed rounded-2xl transition-all cursor-pointer shadow-xl shadow-[#BDF34E]/5"
                            >
                                {isLoading ? (
                                    <>
                                        <SpinnerIcon size={20} className="animate-spin" />
                                        <span>Initialising...</span>
                                    </>
                                ) : (
                                    <>
                                        <RocketIcon size={20} weight="fill" />
                                        <span>Initialise Workspace</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default NewProjectModal
