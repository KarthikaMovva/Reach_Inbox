import { useState } from "react";

interface RecipientInputProps {
    recipients: string[];
    onChange: (recipients: string[]) => void;
    error?: string;
}

export default function RecipientInput({
    recipients,
    onChange,
    error,
}: RecipientInputProps) {
    const [draft, setDraft] = useState("");

    function addRecipient() {
        const emails = draft
            .split(",")
            .map((email) => email.trim().toLowerCase())
            .filter((email) => email.length > 0);

        if (emails.length === 0) return;

        const unique = [
            ...new Set([...recipients, ...emails]),
        ];
        onChange(unique);
        setDraft("");
    }

    function handleKeyDown(
        e: React.KeyboardEvent<HTMLInputElement>
    ) {
        if (
            e.key === "Enter" ||
            e.key === "Tab" ||
            e.key === ","
        ) {
            e.preventDefault();
            addRecipient();
        } else if (
            e.key === "Backspace" &&
            draft === "" &&
            recipients.length > 0
        ) {
            onChange(recipients.slice(0, -1));
        }
    }

    function removeRecipient(email: string) {
        onChange(
            recipients.filter((recipient) => recipient !== email)
        );
    }

    return (
        <div>
            <label
                htmlFor="recipients"
                className="mb-1 block text-sm font-medium text-gray-700"
            >
                Recipients
            </label>
            <div
                className={`flex min-h-[42px] flex-wrap items-center gap-1.5 rounded-md border bg-white px-2 py-1.5 focus-within:ring-2 focus-within:ring-indigo-500 ${error
                        ? "border-red-400"
                        : "border-gray-300"
                    }`}
            >
                {recipients.map((recipient) => (
                    <span
                        key={recipient}
                        className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-0.5 text-sm text-indigo-800"
                    >
                        {recipient}
                        <button
                            type="button"
                            onClick={() =>
                                removeRecipient(recipient)
                            }
                            className="text-indigo-400 hover:text-indigo-700"
                            aria-label={`Remove ${recipient}`}
                        >
                            ✕
                        </button>
                    </span>
                ))}
                <input
                    id="recipients"
                    type="email"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={addRecipient}
                    placeholder={
                        recipients.length === 0
                            ? "Enter recipient emails, press Enter to add"
                            : "Add another recipient"
                    }
                    className="min-w-[180px] flex-1 border-none bg-transparent px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
                />
            </div>
            <p className="mt-1 text-xs text-gray-500">
                Press Enter or comma to add a recipient
            </p>
            {error && (
                <p className="mt-1 text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}