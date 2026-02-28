import React from 'react';
import { getSession } from "@/lib/sessions";

export default async function DashboardPage() {
    const session = await getSession();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            {session && (
                <p className="mt-4 text-gray-600">
                    Welcome back, {session.user?.name || session.user?.email}
                </p>
            )}
        </div>
    );
}
