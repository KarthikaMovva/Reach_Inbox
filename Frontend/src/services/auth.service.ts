import { api } from "../lib/api";
import type {
    LoginResponse,
    Sender,
    User,
} from "../types";

export async function register(
    name: string,
    email: string,
    password: string
): Promise<User> {
    const { data } = await api.post<User>(
        "/auth/register",
        { name, email, password }
    );
    return data;
}

export async function login(
    email: string,
    password: string
): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>(
        "/auth/login",
        { email, password }
    );
    return data;
}

export async function getCurrentUser(): Promise<User> {
    const { data } = await api.get<User>("/auth/me");
    return data;
}

export async function getSenders(): Promise<Sender[]> {
    const { data } = await api.get<Sender[]>("/senders");
    return data;
}

export async function createSender(
    name: string,
    email: string
): Promise<Sender> {
    const { data } = await api.post<Sender>(
        "/senders",
        { name, email }
    );
    return data;
}
