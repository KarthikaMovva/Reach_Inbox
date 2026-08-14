import { useState } from "react";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { login, register } from "../../services/auth.service";
import { getErrorMessage } from "../../lib/api";

interface LoginPageProps {
    onLogin: (token: string, user: { id: string; name: string; email: string }) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
    const [mode, setMode] = useState<"login" | "register">("login");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setError("");

        if (mode === "register" && !name.trim()) {
            setError("Name is required");
            return;
        }
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        if (password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setLoading(true);
        try {
            if (mode === "login") {
                const res = await login(email.trim(), password);
                localStorage.setItem("reachinbox_token", res.token);
                localStorage.setItem("reachinbox_user", JSON.stringify(res.user));
                onLogin(res.token, res.user);
            } else {
                const user = await register(name.trim(), email.trim(), password);
                // After register, log in automatically to get a token
                const res = await login(email.trim(), password);
                localStorage.setItem("reachinbox_token", res.token);
                localStorage.setItem("reachinbox_user", JSON.stringify(user));
                onLogin(res.token, user);
            }
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <div className="w-full max-w-md">
                <div className="mb-8 flex flex-col items-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">
                        RI
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        ReachInbox
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        {mode === "login"
                            ? "Sign in to your account"
                            : "Create your account"}
                    </p>
                </div>

                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                    <div className="mb-5 flex rounded-md bg-gray-100 p-1">
                        <button
                            type="button"
                            onClick={() => {
                                setMode("login");
                                setError("");
                            }}
                            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === "login"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode("register");
                                setError("");
                            }}
                            className={`flex-1 rounded px-3 py-1.5 text-sm font-medium transition-colors ${mode === "register"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {mode === "register" && (
                            <Input
                                label="Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                autoComplete="name"
                            />
                        )}
                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            autoComplete="email"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            autoComplete={
                                mode === "login"
                                    ? "current-password"
                                    : "new-password"
                            }
                        />

                        {error && (
                            <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            className="w-full"
                            loading={loading}
                        >
                            {mode === "login" ? "Sign In" : "Create Account"}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}