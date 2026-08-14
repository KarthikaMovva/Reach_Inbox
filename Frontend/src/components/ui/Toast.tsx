import { useEffect } from "react";

interface ToastProps {
    message: string;
    type: "success" | "error";
    onDismiss: () => void;
}

export default function Toast({
    message,
    type,
    onDismiss,
}: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 4000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
            <div
                className={`pointer-events-auto flex items-center gap-2 rounded-md px-4 py-3 text-sm font-medium text-white shadow-lg ${type === "success" ? "bg-green-600" : "bg-red-600"
                    }`}
            >
                {type === "success" ? "✓" : "✕"}
                {message}
                <button
                    type="button"
                    onClick={onDismiss}
                    className="ml-2 text-white/80 hover:text-white"
                    aria-label="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}