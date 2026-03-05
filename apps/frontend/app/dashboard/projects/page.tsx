"use client"
import React, { useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { NewProjectModal, ProjectsTable } from '../components'
import type { Project } from '../components/ProjectsTable'

// Sample data – replace with real data from API later
const sampleProjects: Project[] = [
    {
        id: '1',
        name: 'My Banking App',
        description: 'Security audit for mobile banking application',
        testType: 'APK',
        outcome: 'Passed',
    },
    {
        id: '2',
        name: 'E-Commerce App',
        description: 'Vulnerability scan for shopping platform',
        testType: 'APK',
        outcome: 'Failed',
    },
    {
        id: '3',
        name: 'Health Tracker',
        description: 'Privacy and data leak analysis',
        testType: 'APK',
        outcome: 'Pending',
    },
]

const ProjectsPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your testing projects</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={16} weight="bold" />
                    New Project
                </button>
            </div>

            {/* Projects Table */}
            <ProjectsTable projects={sampleProjects} />

            {/* New Project Modal */}
            <NewProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    )
}

export default ProjectsPage