"use client"
import React, { useEffect, useState } from 'react'
import { Plus } from '@phosphor-icons/react'
import { NewProjectModal, ProjectsTable, ProjectDetailsModal } from '../components'
import type { Project } from '../components/ProjectsTable'
import axios from 'axios'

const ProjectsPage = () => {
    const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchProjects = async () => {
        try {
            const { data } = await axios.get(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects`,
                { withCredentials: true }
            )
            setProjects(data.projects)
        } catch (err) {
            console.error("Failed to fetch: ", err);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { fetchProjects() }, []);

    return (

        <div className="p-8 space-y-6 relative">

            {/* Portal anchor — dropdown teleports here, sits above everything */}
            <div id="dropdown-portal" className="fixed inset-0 pointer-events-none" style={{ zIndex: 9999 }} />

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Manage and monitor your testing projects</p>
                </div>
                <button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    className="inline-flex items-center gap-1.5 bg-gray-900 hover:bg-gray-800 text-white px-3.5 py-2 text-sm font-medium cursor-pointer rounded-lg transition-colors shadow-sm"
                >
                    <Plus size={16} weight="bold" />
                    New Project
                </button>
            </div>

            {/* Projects Table */}
            {loading ? (
                <div className="text-sm text-gray-400 text-center py-12">
                    Loading projects...
                </div>
            ) : (
                <ProjectsTable
                    projects={projects}
                    onRefresh={fetchProjects}
                    onProjectClick={(project) => setSelectedProject(project)}
                />
            )}

            {/* New Project Modal */}
            <NewProjectModal
                isOpen={isNewProjectModalOpen}
                onClose={() => {
                    setIsNewProjectModalOpen(false)
                    fetchProjects()
                }}
            />

            {/* Project Details Modal */}
            <ProjectDetailsModal
                isOpen={!!selectedProject}
                onClose={() => setSelectedProject(null)}
                project={selectedProject}
                onRefresh={() => {
                    fetchProjects();
                    setSelectedProject(null);
                }}
            />
        </div>
    )
}

export default ProjectsPage