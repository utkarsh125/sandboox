//this file will fetch session data on the server;

import { headers } from "next/headers";
import axios from "axios";

export async function getSession() {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    try {


        const res = await axios.get(`${backendUrl}/api/auth/get-session`, {
            //forward users' cookies manually
            headers: Object.fromEntries(await headers()),
            withCredentials: true,
        });

        return res.data;
    } catch (error) {
        axios.isAxiosError(error) && console.log(error.response?.data);
        return null;
    }
}