//this file will fetch session data on the server;

import { headers } from "next/headers";

export async function getSession() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    try {
        const res = await fetch(`${backendUrl}/api/auth/get-session`, {
            //forward users' cookies manually
            headers: Object.fromEntries(await headers()),
            credentials: "include",
        });

        if (!res.ok) return null;
        return res.json();
    } catch (error) {
        console.log(error);
        return null;
    }
}