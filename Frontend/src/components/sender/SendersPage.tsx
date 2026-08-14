import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { createSender, getSenders } from "../../services/auth.service";
import { getErrorMessage } from "../../lib/api";
import type { Sender } from "../../types";

interface SendersPageProps {
    onToast: (message: string, type: "success" | "error") => void;
}

export default function SendersPage({ onToast }: SendersPageProps) {
    const [senders, setSenders] = useState<Sender[]>([]);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        let cancelled = false;
        getSenders()
            .then((data) => {
                if (!cancelled) setSenders(data);
            })
            .catch((err) => {
                if (!cancelled) onToast(getErrorMessage(err), "error");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [onToast]);

    async function handleCreate(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Sender name is required");
            return;
        }
        if (!email.trim()) {
            setError("Sender email is required");
            return;
        }

        setCreating(true);
        try {
            const sender = await createSender(name.trim(), email.trim());
            setSenders((prev) => [...prev, sender]);
            setName("");
            setEmail("");
            onToast("Sender created", "success");
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setCreating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                Loading senders...
            </div>
        );
    }

    return (
        <div className="h-full overflow-y-auto bg-white px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900">
                Senders
            </h2>
            <p className="mt-1 text-sm text-gray-500">
                Senders are the email identities used as the "From"
                address when you compose emails.
            </p>

            <form
                onSubmit={handleCreate}
                className="mt-6 max-w-lg space-y-4 rounded-md border border-gray-200 p-4"
            >
                <Input
                    label="Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sender display name"
                />
                <Input
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sender@example.com"
                />
                {error && (
                    <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                        {error}
                    </div>
                )}
                <Button type="submit" loading={creating}>
                    Add Sender
                </Button>
            </form>

            <div className="mt-8">
                <h3 className="text-sm font-semibold text-gray-900">
                    Your senders
                </h3>
                {senders.length === 0 ? (
                    <p className="mt-2 text-sm text-gray-500">
                        No senders yet. Add one above.
                    </p>
                ) : (
                    <ul className="mt-3 divide-y divide-gray-200 border-t border-gray-200">
                        {senders.map((sender) => (
                            <li
                                key={sender.id}
                                className="flex items-center justify-between py-3"
                            >
                                <div>
                                    <p className="text-sm font-medium text-gray-900">
                                        {sender.name}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                        {sender.email}
                                    </p>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}