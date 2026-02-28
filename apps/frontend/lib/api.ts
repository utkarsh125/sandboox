import axios from "axios";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

const apiInstance = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
    //important: this shares cookies with backend
});

export const api = {
    async get<T>(path: string): Promise<T> {
        const res = await apiInstance.get<T>(path);
        return res.data;
    },

    async POST<T>(path: string, body: any): Promise<T> {
        const res = await apiInstance.post<T>(path, body);
        return res.data;
    }
}