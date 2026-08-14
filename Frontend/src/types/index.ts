export type EmailStatus =
    | "SCHEDULED"
    | "PROCESSING"
    | "SENT"
    | "FAILED";

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface Sender {
    id: string;
    name: string;
    email: string;
    userId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Email {
    id: string;
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
    sentAt: string | null;
    status: EmailStatus;
    senderId: string;
    sender: Sender;
    createdAt: string;
    updatedAt: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}

export interface CreateEmailInput {
    recipient: string;
    subject: string;
    body: string;
    scheduledAt: string;
    senderId: string;
}

export interface UpdateEmailInput {
    recipient?: string;
    subject?: string;
    body?: string;
    scheduledAt?: string;
    senderId?: string;
}