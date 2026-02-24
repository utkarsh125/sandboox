import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({

    //point to hono backend
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001"
});

export const {
    signIn,
    signOut,
    signUp,
    useSession
} = authClient;