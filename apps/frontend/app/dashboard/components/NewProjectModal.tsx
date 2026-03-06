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
    CheckCircleIcon
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

    const isGithubUrl = sourceUrl.startsWith('https://github.com/')
    const githubPath = isGithubUrl ? sourceUrl.replace('https://github.com/', '') : ''

    const handleClose = () => {
        setStep('select')
        setTestType(null)
        setName('')
        setDescription('')
        setSourceUrl('')
        onClose()
    }

    const handleSelectApk = () => {
        setTestType('APK')
        setStep('details')
    }

    const handleBack = () => {
        setStep('select')
        setTestType(null)
    }

    const handleCreate = async () => {
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
                {
                    withCredentials: true
                }
            )
            console.log("Project created:", data)
            handleClose()
        } catch (err) {
            console.error("Failed to create project:", err)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={handleClose}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        {step === 'details' && (
                            <button
                                onClick={handleBack}
                                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                <ArrowLeftIcon size={18} className="text-gray-500" />
                            </button>
                        )}
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                {step === 'select' ? 'New Project' : 'Project Details'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {step === 'select'
                                    ? 'Choose a testing type to get started'
                                    : 'Give your project a name and description'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    >
                        <XIcon size={20} className="text-gray-400" />
                    </button>
                </div>

                {/* Step 1: Select test type */}
                {step === 'select' && (
                    <>
                        <div className="p-6 space-y-3">
                            {/* APK Testing – Active */}
                            <button
                                onClick={handleSelectApk}
                                className="w-full group flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all cursor-pointer"
                            >
                                <div className="w-12 h-12 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                                    <AndroidLogoIcon size={24} weight="duotone" className="text-green-600" />
                                </div>
                                <div className="text-left flex-1">
                                    <div className="font-medium text-gray-900 text-sm">APK Testing</div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        Upload and analyze Android APK files for security vulnerabilities
                                    </p>
                                </div>
                                <div className="text-xs font-medium text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                                    Available
                                </div>
                            </button>

                            {/* Website Testing – Blocked */}
                            <div className="relative group">
                                <button
                                    disabled
                                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 opacity-60 cursor-not-allowed"
                                >
                                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center shrink-0">
                                        <GlobeSimpleIcon size={24} weight="duotone" className="text-gray-400" />
                                    </div>
                                    <div className="text-left flex-1">
                                        <div className="font-medium text-gray-500 text-sm">Website Testing</div>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                            Scan websites and web apps for security issues and misconfigurations
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full">
                                        <LockIcon size={12} weight="bold" />
                                        Locked
                                    </div>
                                </button>

                                {/* Tooltip on hover */}
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                                    Coming Soon
                                    <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900"></div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50">
                            <p className="text-xs text-gray-400 text-center">
                                More testing options will be available soon
                            </p>
                        </div>
                    </>
                )}

                {/* Step 2: Project details */}
                {step === 'details' && (
                    <>
                        <div className="p-6 space-y-5">
                            {/* Selected type indicator */}
                            <div className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-green-50 border border-green-100">
                                <AndroidLogoIcon size={18} weight="duotone" className="text-green-600" />
                                <span className="text-xs font-medium text-green-700">APK Testing</span>
                            </div>

                            {/* Name field */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <TextTIcon size={16} className="text-gray-400" />
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. My Banking App"
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                                />
                            </div>

                            {/* Description field */}
                            <div className="space-y-1.5">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <NotePencilIcon size={16} className="text-gray-400" />
                                    Description
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Briefly describe what this project is about..."
                                    rows={3}
                                    className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all resize-none"
                                />
                            </div>

                            {/* APK Source */}
                            <div className="space-y-3">
                                <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                                    <LinkIcon size={16} className="text-gray-400" />
                                    APK Source
                                </label>

                                {/* GitHub URL Input */}
                                <div className="space-y-2">
                                    <div className="relative">
                                        {isGithubUrl ? (
                                            <div className="flex items-center gap-2 w-full px-3.5 py-2.5 text-sm border border-green-200 rounded-xl bg-green-50/50">
                                                <GithubLogoIcon size={18} weight="fill" className="text-gray-900 shrink-0" />
                                                <span className="text-gray-500">/</span>
                                                <span className="text-gray-700 truncate flex-1 font-mono text-xs">{githubPath}</span>
                                                <CheckCircleIcon size={18} weight="fill" className="text-green-500 shrink-0" />
                                                <button
                                                    onClick={() => setSourceUrl('')}
                                                    className="p-0.5 hover:bg-green-100 rounded transition-colors cursor-pointer"
                                                >
                                                    <XIcon size={14} className="text-gray-400" />
                                                </button>
                                            </div>
                                        ) : (
                                            <input
                                                type="text"
                                                value={sourceUrl}
                                                onChange={(e) => setSourceUrl(e.target.value)}
                                                placeholder="https://github.com/user/repo/tree/main/app.apk"
                                                className="w-full px-3.5 py-2.5 text-sm border border-gray-200 rounded-xl bg-white placeholder:text-gray-400 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-50 transition-all"
                                            />
                                        )}
                                    </div>
                                    {sourceUrl && !isGithubUrl && (
                                        <p className="text-xs text-amber-600 flex items-center gap-1">
                                            URL must start with https://github.com/
                                        </p>
                                    )}
                                    {isGithubUrl && (
                                        <p className="text-xs text-green-600 flex items-center gap-1">
                                            <CheckCircleIcon size={12} weight="bold" />
                                            GitHub URL detected — project will be created with status READY
                                        </p>
                                    )}
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-px bg-gray-200" />
                                    <span className="text-xs text-gray-400 font-medium">OR</span>
                                    <div className="flex-1 h-px bg-gray-200" />
                                </div>

                                {/* Upload APK — Disabled */}
                                <div className="relative group">
                                    <button
                                        disabled
                                        className="w-full flex items-center gap-3 px-3.5 py-2.5 text-sm border border-gray-100 rounded-xl bg-gray-50/50 opacity-60 cursor-not-allowed"
                                    >
                                        <UploadSimpleIcon size={18} className="text-gray-400" />
                                        <span className="text-gray-400">Upload APK file</span>
                                        <div className="ml-auto flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
                                            <LockIcon size={10} weight="bold" />
                                            Coming Soon
                                        </div>
                                    </button>
                                    <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                                        Direct file upload coming soon
                                        <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[5px] border-t-gray-900"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer with create button */}
                        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-3">
                            <button
                                onClick={handleClose}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!name.trim() || !isGithubUrl}
                                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors cursor-pointer shadow-sm"
                            >
                                <RocketIcon size={16} weight="bold" />
                                Create Project
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    )
}

export default NewProjectModal
