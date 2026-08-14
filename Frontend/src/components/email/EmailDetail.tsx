import type { Email } from "../../types";

interface EmailDetailProps {
    email: Email | null;
}

export default function EmailDetail({ email }: EmailDetailProps) {
    if (!email) {
        return (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-gray-500">
                Select an email to view its details
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900">
                {email.subject}
            </h2>

            <div className="mt-4 space-y-2 rounded-md border border-gray-200 bg-gray-50 px-4 py-3 text-sm">
                <div>
                    <span className="font-medium text-gray-500">From: </span>
                    <span className="text-gray-900">
                        {`${email.sender.name} <${email.sender.email}>`}
                    </span>
                </div>
                <div>
                    <span className="font-medium text-gray-500">To: </span>
                    <span className="text-gray-900">{email.recipient}</span>
                </div>
                <div>
                    <span className="font-medium text-gray-500">
                        {email.status === "SENT" ? "Sent: " : "Scheduled: "}
                    </span>
                    <span className="text-gray-900">
                        {formatFullDate(
                            email.sentAt ?? email.scheduledAt
                        )}
                    </span>
                </div>
                <div>
                    <span className="font-medium text-gray-500">Status: </span>
                    <span
                        className={`font-medium ${email.status === "FAILED"
                            ? "text-red-600"
                            : email.status === "SENT"
                                ? "text-green-600"
                                : email.status === "PROCESSING"
                                    ? "text-blue-600"
                                    : "text-amber-600"
                            }`}
                    >
                        {email.status}
                    </span>
                </div>
            </div>

            <div className="mt-5 whitespace-pre-wrap text-sm leading-6 text-gray-800">
                {email.body}
            </div>
        </div>
    );
}

function formatFullDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
    });
}