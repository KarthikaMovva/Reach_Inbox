import type { ReactNode } from "react";

export type View =
    | "inbox"
    | "scheduled"
    | "sent"
    | "compose"
    | "senders";

interface SidebarProps {
    view: View;
    onViewChange: (view: View) => void;
    onCompose: () => void;
    user: { name: string; email: string } | null;
    onLogout: () => void;
}

interface NavItem {
    id: View;
    label: string;
    icon: ReactNode;
}

const navItems: NavItem[] = [
    {
        id: "inbox",
        label: "Inbox",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
            </svg>
        ),
    },
    {
        id: "scheduled",
        label: "Scheduled",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
            </svg>
        ),
    },
    {
        id: "sent",
        label: "Sent",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
            </svg>
        ),
    },
    {
        id: "senders",
        label: "Senders",
        icon: (
            <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m6-1.13a4 4 0 10-4-4 4 4 0 004 4zm6 0a4 4 0 10-4-4 4 4 0 004 4z"
                />
            </svg>
        ),
    },
];

export default function Sidebar({
    view,
    onViewChange,
    onCompose,
    user,
    onLogout,
}: SidebarProps) {
    return (
        <aside className="flex h-full w-60 flex-col border-r border-gray-200 bg-white">
            <div className="flex items-center gap-2 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                    RI
                </div>
                <span className="text-base font-semibold text-gray-900">
                    ReachInbox
                </span>
            </div>

            <div className="px-3 pb-3">
                <button
                    type="button"
                    onClick={onCompose}
                    className="flex w-full items-center justify-center gap-2 rounded-md bg-indigo-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                    <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4v16m8-8H4"
                        />
                    </svg>
                    Compose
                </button>
            </div>

            <nav className="flex-1 space-y-0.5 px-3">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onViewChange(item.id)}
                        className={`flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${view === item.id
                            ? "bg-indigo-50 text-indigo-700"
                            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            }`}
                    >
                        {item.icon}
                        {item.label}
                    </button>
                ))}
            </nav>

            {user && (
                <div className="border-t border-gray-200 px-5 py-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-gray-900">
                                {user.name}
                            </p>
                            <p className="truncate text-xs text-gray-500">
                                {user.email}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={onLogout}
                            className="rounded-md p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Logout"
                        >
                            <svg
                                className="h-4 w-4"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2}
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </aside>
    );
}