import type { EmailStatus } from "../../types";

const statusStyles: Record<EmailStatus, string> = {
    SCHEDULED: "bg-amber-100 text-amber-800",
    PROCESSING: "bg-blue-100 text-blue-800",
    SENT: "bg-green-100 text-green-800",
    FAILED: "bg-red-100 text-red-800",
};

export default function Badge({ status }: { status: EmailStatus }) {
    return (
        <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusStyles[status]}`}
        >
            {status}
        </span>
    );
}