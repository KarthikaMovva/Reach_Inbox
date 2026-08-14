import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import RecipientInput from "./RecipientInput";
import { createEmail } from "../../services/email.service";
import { getSenders } from "../../services/auth.service";
import { getErrorMessage } from "../../lib/api";
import type { Sender } from "../../types";

type SendMode = "now" | "schedule";

interface ComposeMailProps {
    onSuccess: (message: string) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ComposeMail({ onSuccess }: ComposeMailProps) {
    const [recipients, setRecipients] = useState<string[]>([]);
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [senderId, setSenderId] = useState("");
    const [senders, setSenders] = useState<Sender[]>([]);
    const [sendMode, setSendMode] = useState<SendMode>("now");
    const [scheduleDate, setScheduleDate] = useState("");
    const [scheduleTime, setScheduleTime] = useState("");
    const [errors, setErrors] = useState<{
        recipients?: string;
        subject?: string;
        body?: string;
        sender?: string;
        schedule?: string;
    }>({});
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getSenders()
            .then((data) => {
                if (!cancelled) {
                    setSenders(data);
                    if (data.length > 0) setSenderId(data[0].id);
                }
            })
            .catch(() => { });
        return () => {
            cancelled = true;
        };
    }, []);

    function validate(): boolean {
        const nextErrors: typeof errors = {};

        if (recipients.length === 0) {
            nextErrors.recipients = "At least one recipient is required";
        } else if (recipients.some((email) => !EMAIL_REGEX.test(email))) {
            nextErrors.recipients = "One or more recipient emails are invalid";
        }

        if (!subject.trim()) nextErrors.subject = "Subject is required";
        if (!body.trim()) nextErrors.body = "Email body is required";
        if (!senderId) nextErrors.sender = "Please select a sender";

        if (sendMode === "schedule" && (!scheduleDate || !scheduleTime)) {
            nextErrors.schedule = "Please select both a date and a time";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    }

    function buildScheduledAt(): string {
        if (sendMode === "now") return new Date().toISOString();

        const [year, month, day] = scheduleDate.split("-").map(Number);
        const [hours, minutes] = scheduleTime.split(":").map(Number);
        return new Date(year, month - 1, day, hours, minutes).toISOString();
    }

    function clearForm() {
        setRecipients([]);
        setSubject("");
        setBody("");
        setScheduleDate("");
        setScheduleTime("");
        setSendMode("now");
        setErrors({});
        setFormError("");
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        setFormError("");

        if (!validate()) return;

        const scheduledAt = buildScheduledAt();

        setLoading(true);
        try {
            // Backend stores one recipient per email: create one email per recipient.
            for (const recipient of recipients) {
                await createEmail({
                    recipient,
                    subject: subject.trim(),
                    body: body.trim(),
                    scheduledAt,
                    senderId,
                });
            }

            const msg =
                recipients.length === 1
                    ? "Email sent successfully"
                    : `${recipients.length} emails sent successfully`;

            clearForm();
            onSuccess(msg);
        } catch (err) {
            setFormError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    const today = new Date().toISOString().split("T")[0];

    return (
        <form onSubmit={handleSend} className="flex h-full flex-col bg-white">
            <div className="border-b border-gray-200 px-6 py-4">
                <h2 className="text-base font-semibold text-gray-900">Compose Mail</h2>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto px-6 py-5">
                <RecipientInput recipients={recipients} onChange={setRecipients} error={errors.recipients} />

                <SenderSelect senders={senders} value={senderId} onChange={setSenderId} error={errors.sender} />

                <Input label="Subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject" error={errors.subject} />

                <div>
                    <label htmlFor="email-body" className="mb-1 block text-sm font-medium text-gray-700">Body</label>
                    <textarea
                        id="email-body"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write your email..."
                        rows={10}
                        className={`w-full resize-none rounded-md border bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${errors.body ? "border-red-400" : "border-gray-300"}`}
                    />
                    {errors.body && <p className="mt-1 text-xs text-red-600">{errors.body}</p>}
                </div>

                <div>
                    <span className="mb-1 block text-sm font-medium text-gray-700">When to send</span>
                    <div className="flex gap-3">
                        <SendModeButton
                            active={sendMode === "now"}
                            label="Send Now"
                            onClick={() => {
                                setSendMode("now");
                                setErrors((prev) => ({ ...prev, schedule: undefined }));
                            }}
                        />
                        <SendModeButton active={sendMode === "schedule"} label="Schedule" onClick={() => setSendMode("schedule")} />
                    </div>

                    {sendMode === "schedule" && (
                        <div className={`mt-3 grid grid-cols-1 gap-3 rounded-md border p-3 sm:grid-cols-2 ${errors.schedule ? "border-red-300" : "border-gray-200"}`}>
                            <Input label="Date" type="date" min={today} value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                            <Input label="Time" type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} />
                            {errors.schedule && <p className="col-span-full text-xs text-red-600">{errors.schedule}</p>}
                        </div>
                    )}
                </div>

                {formError && <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{formError}</div>}

                {senders.length === 0 && (
                    <div className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
                        No senders configured. Create a sender first before sending emails.
                    </div>
                )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">
                <Button type="button" variant="secondary" onClick={clearForm}>Clear</Button>
                <Button type="submit" loading={loading} disabled={!senderId}>
                    {sendMode === "now" ? "Send Now" : "Schedule Send"}
                </Button>
            </div>
        </form>
    );
}

interface SenderSelectProps {
    senders: Sender[];
    value: string;
    onChange: (id: string) => void;
    error?: string;
}

function SenderSelect({ senders, value, onChange, error }: SenderSelectProps) {
    return (
        <div>
            <label htmlFor="sender" className="mb-1 block text-sm font-medium text-gray-700">From (Sender)</label>
            <select
                id="sender"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full rounded-md border bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? "border-red-400" : "border-gray-300"}`}
            >
                <option value="">Select a sender</option>
                {senders.map((sender) => (
                    <option key={sender.id} value={sender.id}>
                        {`${sender.name} <${sender.email}>`}
                    </option>
                ))}
            </select>
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}

interface SendModeButtonProps {
    active: boolean;
    label: string;
    onClick: () => void;
}

function SendModeButton({ active, label, onClick }: SendModeButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${active ? "border-indigo-500 bg-indigo-50 text-indigo-700" : "border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
                }`}
        >
            <span className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${active ? "border-indigo-600" : "border-gray-300"}`}>
                {active && <span className="h-2 w-2 rounded-full bg-indigo-600" />}
            </span>
            {label}
        </button>
    );
}