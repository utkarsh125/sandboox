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
    RocketIcon
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

    const handleClose = () => {
        setStep('select')
        setTestType(null)
        setName('')
        setDescription('')
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
                    testType
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
                                disabled={!name.trim()}
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
