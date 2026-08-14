import { api } from "../lib/api";
import type {
    CreateEmailInput,
    Email,
    UpdateEmailInput,
} from "../types";

export async function createEmail(
    input: CreateEmailInput
): Promise<Email> {
    const { data } = await api.post<Email>(
        "/emails",
        input
    );
    return data;
}

export async function getAllEmails(): Promise<Email[]> {
    const { data } = await api.get<Email[]>("/emails");
    return data;
}

export async function getScheduledEmails(): Promise<Email[]> {
    const { data } = await api.get<Email[]>("/emails/scheduled");
    return data;
}

export async function getSentEmails(): Promise<Email[]> {
    const { data } = await api.get<Email[]>("/emails/sent");
    return data;
}

export async function getEmailById(id: string): Promise<Email> {
    const { data } = await api.get<Email>(`/emails/${id}`);
    return data;
}

export async function updateEmail(
    id: string,
    input: UpdateEmailInput
): Promise<Email> {
    const { data } = await api.patch<Email>(
        `/emails/${id}`,
        input
    );
    return data;
}

export async function deleteEmail(id: string): Promise<Email> {
    const { data } = await api.delete<Email>(`/emails/${id}`);
    return data;
}