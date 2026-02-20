
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

export const api = {
    async get<T>(path: string): Promise<T> {
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: "GET",
            credentials: "include", // Required for sharing sessions/cookies
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            throw new Error(`API GET failed: ${response.statusText}`);
        }

        return response.json();
    },

    async post<T>(path: string, body: any): Promise<T> {
        const response = await fetch(`${BACKEND_URL}${path}`, {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            throw new Error(`API POST failed: ${response.statusText}`);
        }

        return response.json();
    },
};
