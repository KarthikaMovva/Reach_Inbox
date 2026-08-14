import type { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    loading?: boolean;
}

const variants: Record<
    NonNullable<ButtonProps["variant"]>,
    string
> = {
    primary:
        "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300",
    secondary:
        "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 disabled:text-gray-400",
    danger:
        "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-300",
    ghost:
        "bg-transparent text-gray-600 hover:bg-gray-100 disabled:text-gray-400",
};

export default function Button({
    children,
    variant = "primary",
    loading = false,
    disabled,
    className = "",
    ...rest
}: ButtonProps) {
    return (
        <button
            className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            disabled={disabled || loading}
            {...rest}
        >
            {loading && (
                <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                    aria-hidden="true"
                />
            )}
            {children}
        </button>
    );
}