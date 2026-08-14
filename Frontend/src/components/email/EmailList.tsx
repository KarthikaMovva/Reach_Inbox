import type { Email } from "../../types";
import Badge from "../ui/Badge";

interface EmailListProps {
    emails: Email[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    loading: boolean;
    emptyMessage: string;
}

export default function EmailList({
    emails,
    selectedId,
    onSelect,
    loading,
    emptyMessage,
}: EmailListProps) {
    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Loading emails...
            </div>
        );
    }

    if (emails.length === 0) {
        return (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-gray-500">
                {emptyMessage}
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto">
            <ul className="divide-y divide-gray-200">
                {emails.map((email) => (
                    <li key={email.id}>
                        <button
                            type="button"
                            onClick={() => onSelect(email.id)}
                            className={`w-full px-5 py-4 text-left transition-colors ${selectedId === email.id
                                    ? "bg-indigo-50"
                                    : "hover:bg-gray-50"
                                }`}
                        >
                            <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-medium text-gray-900">
                                    {email.recipient}
                                </p>
                                <span className="shrink-0 text-xs text-gray-500">
                                    {formatDate(
                                        email.sentAt ?? email.scheduledAt
                                    )}
                                </span>
                            </div>
                            <p className="mt-0.5 truncate text-sm text-gray-700">
                                {email.subject}
                            </p>
                            <div className="mt-1.5 flex items-center justify-between gap-2">
                                <p className="truncate text-xs text-gray-500">
                                    {email.body}
                                </p>
                                <Badge status={email.status} />
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
}