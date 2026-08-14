import { useCallback, useEffect, useState } from "react";
import Sidebar from "./components/layout/Sidebar";
import type { View } from "./components/layout/Sidebar";
import LoginPage from "./components/auth/LoginPage";
import ComposeMail from "./components/email/ComposeMail";
import EmailList from "./components/email/EmailList";
import EmailDetail from "./components/email/EmailDetail";
import SendersPage from "./components/sender/SendersPage";
import Toast from "./components/ui/Toast";
import { getAllEmails, getScheduledEmails, getSentEmails, getEmailById } from "./services/email.service";
import { getErrorMessage } from "./lib/api";
import type { Email, User } from "./types";

interface ToastState {
  message: string;
  type: "success" | "error";
}

export default function App() {
  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("reachinbox_token")
  );
  const [user, setUser] = useState<User | null>(() => {
    const raw = localStorage.getItem("reachinbox_user");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  });
  const [view, setView] = useState<View>("inbox");
  const [emails, setEmails] = useState<Email[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;

    if (view === "compose" || view === "senders") {
      return;
    }

    async function load() {
      setLoading(true);
      setSelectedEmail(null);
      try {
        let data: Email[];
        if (view === "scheduled") {
          data = await getScheduledEmails();
        } else if (view === "sent") {
          data = await getSentEmails();
        } else {
          data = await getAllEmails();
        }
        if (!cancelled) setEmails(data);
      } catch (err) {
        if (!cancelled) {
          setToast({ message: getErrorMessage(err), type: "error" });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [token, view]);

  const handleLogin = useCallback(
    (newToken: string, newUser: User) => {
      setToken(newToken);
      setUser(newUser);
      setView("inbox");
    },
    []
  );

  const handleLogout = useCallback(() => {
    localStorage.removeItem("reachinbox_token");
    localStorage.removeItem("reachinbox_user");
    setToken(null);
    setUser(null);
    setEmails([]);
    setSelectedEmail(null);
  }, []);

  const handleSelectEmail = useCallback(
    async (id: string) => {
      try {
        const email = await getEmailById(id);
        setSelectedEmail(email);
      } catch (err) {
        setToast({ message: getErrorMessage(err), type: "error" });
      }
    },
    []
  );

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    []
  );

  const handleComposeSuccess = useCallback((message: string) => {
    setToast({ message, type: "success" });
    setView("sent");
  }, []);

  if (!token) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        view={view}
        onViewChange={setView}
        onCompose={() => setView("compose")}
        user={user ? { name: user.name, email: user.email } : null}
        onLogout={handleLogout}
      />

      <main className="flex h-full flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
          <h1 className="text-base font-semibold text-gray-900">
            {view === "inbox"
              ? "Inbox"
              : view === "scheduled"
                ? "Scheduled Emails"
                : view === "sent"
                  ? "Sent Emails"
                  : view === "senders"
                    ? "Senders"
                    : "Compose Mail"}
          </h1>
        </header>

        {view === "compose" ? (
          <div className="flex-1 overflow-hidden">
            <ComposeMail onSuccess={handleComposeSuccess} />
          </div>
        ) : view === "senders" ? (
          <div className="flex-1 overflow-hidden">
            <SendersPage onToast={showToast} />
          </div>
        ) : (
          <div className="flex flex-1 overflow-hidden">
            <div className="w-2/5 border-r border-gray-200 bg-white">
              <EmailList
                emails={emails}
                selectedId={selectedEmail?.id ?? null}
                onSelect={handleSelectEmail}
                loading={loading}
                emptyMessage={
                  view === "scheduled"
                    ? "No scheduled emails"
                    : view === "sent"
                      ? "No sent emails yet"
                      : "No emails yet"
                }
              />
            </div>
            <div className="flex-1 bg-white">
              <EmailDetail email={selectedEmail} />
            </div>
          </div>
        )}
      </main>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}