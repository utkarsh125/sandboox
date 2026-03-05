"use client"
import React from 'react'
import { Folder, CheckCircle, XCircle, Clock, MinusCircle } from '@phosphor-icons/react'

export interface Project {
    id: string
    name: string
    description: string
    testType: 'APK' | 'Website'
    outcome: 'Passed' | 'Failed' | 'Pending' | 'Not Run'
}

interface ProjectsTableProps {
    projects: Project[]
}

const outcomeConfig = {
    Passed: {
        icon: CheckCircle,
        className: 'text-green-600 bg-green-50 border-green-200',
    },
    Failed: {
        icon: XCircle,
        className: 'text-red-500 bg-red-50 border-red-200',
    },
    Pending: {
        icon: Clock,
        className: 'text-amber-600 bg-amber-50 border-amber-200',
    },
    'Not Run': {
        icon: MinusCircle,
        className: 'text-gray-500 bg-gray-50 border-gray-200',
    },
}

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects }) => {
    if (projects.length === 0) {
        return (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Folder size={28} weight="duotone" className="text-gray-300" />
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                    {projects.map((project) => {
                        const outcome = outcomeConfig[project.outcome]
                        const OutcomeIcon = outcome.icon

                        return (
                            <tr
                                key={project.id}
                                className="hover:bg-gray-50/60 transition-colors"
                            >
                                <td className="px-5 py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center shrink-0">
                                            <Folder size={16} weight="duotone" className="text-blue-500" />
                                        </div>
                                        <span className="text-sm font-medium text-gray-900">
                                            {project.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-5 py-3.5">
                                    <span className="text-sm text-gray-500 line-clamp-1">
                                        {project.description}
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
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}

export default ProjectsTable
