
import React from 'react';
import { getSession } from "@/lib/sessions";
import {
    StatCard,
    LineChart,
    BarChart,
    DonutChart,
    ActivitiesList
} from './components';

export default async function DashboardPage() {
    return (
        <div className="p-8 space-y-8 max-w-7xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
        </div>
    );
}
