import axios from "axios";

const API_BASE_URL =
    (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
    "http://localhost:5000/api";

export const api = axios.create({
    baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("reachinbox_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("reachinbox_token");
            localStorage.removeItem("reachinbox_user");
        }
        return Promise.reject(error);
    }
);

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as
            | { error?: string }
            | undefined;
        if (data?.error) {
            return data.error;
        }
        if (error.message) {
            return error.message;
        }
    }
    if (error instanceof Error) {
        return error.message;
    }
    return "Something went wrong";
}
