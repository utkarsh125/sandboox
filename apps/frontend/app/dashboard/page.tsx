"use client"
import React, { useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import {
    Header,
    StatCard,
    LineChart,
    BarChart,
    DonutChart,
    TrafficByWebsite,
    NotificationsList,
    ActivitiesList,
    ContactsList
} from './components'

// Sample data for charts
const lineChartData = [
    { label: 'Jan', value: 15000 },
    { label: 'Feb', value: 18000 },
    { label: 'Mar', value: 12000 },
    { label: 'Apr', value: 22000 },
    { label: 'May', value: 19000 },
    { label: 'Jun', value: 25000 },
    { label: 'Jul', value: 28000 },
]

const lineChartData2 = [
    { label: 'Jan', value: 12000 },
    { label: 'Feb', value: 14000 },
    { label: 'Mar', value: 10000 },
    { label: 'Apr', value: 16000 },
    { label: 'May', value: 15000 },
    { label: 'Jun', value: 20000 },
    { label: 'Jul', value: 22000 },
]

const trafficByDeviceData = [
    { label: 'Linux', values: [25000, 18000], colors: ['#1e293b', '#60a5fa'] },
    { label: 'Mac', values: [22000, 15000], colors: ['#1e293b', '#60a5fa'] },
    { label: 'iOS', values: [18000, 20000], colors: ['#1e293b', '#60a5fa'] },
    { label: 'Windows', values: [28000, 22000], colors: ['#1e293b', '#60a5fa'] },
    { label: 'Android', values: [20000, 16000], colors: ['#1e293b', '#60a5fa'] },
    { label: 'Other', values: [12000, 8000], colors: ['#1e293b', '#60a5fa'] },
]

const marketingSeoData = [
    { label: 'Jan', values: [20000], colors: ['#3b82f6'] },
    { label: 'Feb', values: [18000], colors: ['#3b82f6'] },
    { label: 'Mar', values: [22000], colors: ['#3b82f6'] },
    { label: 'Apr', values: [25000], colors: ['#3b82f6'] },
    { label: 'May', values: [19000], colors: ['#3b82f6'] },
]

const trafficByLocationData = [
    { label: 'United States', value: 52.1, color: '#1e293b' },
    { label: 'Canada', value: 22.8, color: '#3b82f6' },
    { label: 'Mexico', value: 13.9, color: '#60a5fa' },
    { label: 'Other', value: 11.2, color: '#c7d2fe' },
]

const trafficByWebsiteData = [
    { name: 'Google', progress: 80, color: '#1e293b' },
    { name: 'YouTube', progress: 65, color: '#1e293b' },
    { name: 'Instagram', progress: 55, color: '#1e293b' },
    { name: 'Pinterest', progress: 40, color: '#1e293b' },
    { name: 'Facebook', progress: 35, color: '#1e293b' },
    { name: 'Twitter', progress: 25, color: '#1e293b' },
]

const notificationsData = [
    { id: '1', icon: 'bug' as const, message: 'You fixed a bug.', time: 'Just now' },
    { id: '2', icon: 'user' as const, message: 'New user registered.', time: '59 minutes ago' },
    { id: '3', icon: 'bug' as const, message: 'You fixed a bug.', time: '12 hours ago' },
    { id: '4', icon: 'heart' as const, message: 'Andi Lane subscribed to you.', time: 'Today, 11:59 AM' },
]

const activitiesData = [
    { id: '1', icon: 'style' as const, iconColor: '#8b5cf6', message: 'Changed the style.', time: 'Just now' },
    { id: '2', icon: 'release' as const, iconColor: '#3b82f6', message: 'Released a new version.', time: '59 minutes ago' },
    { id: '3', icon: 'bug' as const, iconColor: '#ef4444', message: 'Submitted a bug.', time: '12 hours ago' },
    { id: '4', icon: 'edit' as const, iconColor: '#f59e0b', message: 'Modified A data in Page X.', time: 'Today, 11:59 AM' },
    { id: '5', icon: 'delete' as const, iconColor: '#6b7280', message: 'Deleted a page in Project X.', time: 'Feb 2, 2024' },
]

const contactsData = [
    { id: '1', name: 'Natali Craig', color: '#f472b6' },
    { id: '2', name: 'Drew Cano', color: '#60a5fa' },
    { id: '3', name: 'Andi Lane', color: '#a78bfa' },
    { id: '4', name: 'Koray Okumus', color: '#34d399' },
    { id: '5', name: 'Kate Morrison', color: '#fbbf24' },
    { id: '6', name: 'Melody Macy', color: '#f87171' },
]

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState('totalUsers')

    return (
        <div className="flex-1 flex overflow-hidden">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Header breadcrumb={['Dashboards', 'Default']} />

                <div className="p-6">
                    {/* Overview Section */}
                    <div className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Overview</h2>
                            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
                                Today
                                <CaretDown size={14} />
                            </button>
                        </div>

                        {/* Stat Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatCard
                                label="Views"
                                value={7265}
                                change={11.01}
                                variant="blue"
                            />
                            <StatCard
                                label="Visits"
                                value={3671}
                                change={-0.03}
                            />
                            <StatCard
                                label="New Users"
                                value={256}
                                change={15.03}
                            />
                            <StatCard
                                label="Active Users"
                                value={2318}
                                change={6.08}
                            />
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Total Users Chart */}
                        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5">
                            {/* Tabs */}
                            <div className="flex items-center gap-4 mb-6">
                                <button
                                    onClick={() => setActiveTab('totalUsers')}
                                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'totalUsers'
                                        ? 'text-gray-900 border-gray-900'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'
                                        }`}
                                >
                                    Total Users
                                </button>
                                <button
                                    onClick={() => setActiveTab('totalProjects')}
                                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'totalProjects'
                                        ? 'text-gray-900 border-gray-900'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'
                                        }`}
                                >
                                    Total Projects
                                </button>
                                <button
                                    onClick={() => setActiveTab('operatingStatus')}
                                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${activeTab === 'operatingStatus'
                                        ? 'text-gray-900 border-gray-900'
                                        : 'text-gray-400 border-transparent hover:text-gray-600'
                                        }`}
                                >
                                    Operating Status
                                </button>
                            </div>

                            <LineChart
                                data={lineChartData}
                                data2={lineChartData2}
                                height={220}
                                legend1="This year"
                                legend2="Last year"
                            />
                        </div>

                        {/* Traffic by Website */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Traffic by Website</h3>
                            <TrafficByWebsite data={trafficByWebsiteData} />
                        </div>
                    </div>

                    {/* Bottom Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                        {/* Traffic by Device */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Traffic by Device</h3>
                            <BarChart data={trafficByDeviceData} height={180} barWidth={32} />
                        </div>

                        {/* Traffic by Location */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Traffic by Location</h3>
                            <div className="flex justify-center">
                                <DonutChart data={trafficByLocationData} />
                            </div>
                        </div>

                        {/* Marketing & SEO */}
                        <div className="bg-white border border-gray-100 rounded-2xl p-5">
                            <h3 className="text-sm font-semibold text-gray-900 mb-4">Marketing & SEO</h3>
                            <BarChart data={marketingSeoData} height={180} barWidth={40} />
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Panel */}
            <aside className="w-72 bg-white border-l border-gray-100 overflow-y-auto hidden xl:block">
                <div className="p-5 space-y-6">
                    {/* Notifications */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Notifications</h3>
                        <NotificationsList notifications={notificationsData} />
                    </div>

                    {/* Activities */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Activities</h3>
                        <ActivitiesList activities={activitiesData} />
                    </div>

                    {/* Contacts */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-4">Contacts</h3>
                        <ContactsList contacts={contactsData} />
                    </div>
                </div>
            </aside>
        </div>
    )
}
