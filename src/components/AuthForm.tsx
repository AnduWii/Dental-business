"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { env } from "@/lib/env";

type Mode = "signin" | "signup";

const NOT_CONFIGURED =
  "Sign-in isn't connected yet. Add your Supabase keys in Vercel (Settings → Environment Variables) and redeploy.";

const inputClass =
  "w-full rounded-[9px] border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-500 focus:ring-1 focus:ring-brand-500";
const labelClass = "mb-1.5 block text-[13px] font-semibold text-slate-700";

export function AuthForm({
  initialMode = "signin",
  initialError = "",
}: {
  initialMode?: Mode;
  initialError?: string;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(initialMode);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError);
  const [notice, setNotice] = useState("");

  const redirectTo =
    typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined;

  async function handlePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!env.isSupabaseConfigured()) return setError(NOT_CONFIGURED);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: redirectTo, data: { full_name: fullName } },
        });
        if (error) setError(error.message);
        else if (data.session) {
          router.push("/dashboard");
          router.refresh();
          return;
        } else {
          setNotice(`We sent a confirmation link to ${email}. Click it to finish creating your account.`);
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
        else {
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMagicLink() {
    if (!email) return setError("Enter your email first, then tap the magic-link button.");
    if (!env.isSupabaseConfigured()) return setError(NOT_CONFIGURED);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo, shouldCreateUser: true },
      });
      if (error) setError(error.message);
      else setNotice(`Check ${email} for a one-time sign-in link.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Link
          href="/"
          className="flex h-[46px] w-[46px] items-center justify-center rounded-[13px] bg-brand-600 text-[22px] font-bold text-white"
        >
          R
        </Link>
        <p className="text-sm text-slate-500">
          {mode === "signin" ? "Sign in to your clinic dashboard" : "Create your clinic account"}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_6px_24px_rgba(31,45,61,0.07)]">
        {/* tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-[10px] border border-slate-200 bg-slate-100 p-1 text-sm">
          {(["signin", "signup"] as Mode[]).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                setMode(m);
                setError("");
                setNotice("");
              }}
              className={`rounded-md py-2 font-medium transition ${
                mode === m ? "bg-white text-slate-900 shadow-card" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {m === "signin" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        {notice ? (
          <div
            role="status"
            className="mt-[18px] rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            {notice}
          </div>
        ) : (
          <form onSubmit={handlePassword} className="mt-[18px] flex flex-col gap-3.5">
            {mode === "signup" && (
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Your name
                </label>
                <input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Dr. Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@clinic.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className={labelClass}>
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="mt-0.5 w-full rounded-[9px] bg-brand-600 px-4 py-2.5 font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </button>

            {error && (
              <p role="alert" className="text-sm text-red-600">
                {error}
              </p>
            )}

            <div className="flex items-center gap-3 py-0.5 text-xs text-slate-400">
              <span className="h-px flex-1 bg-slate-200" />
              or
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <button
              type="button"
              onClick={handleMagicLink}
              disabled={busy}
              className="w-full rounded-[9px] border border-slate-300 bg-white px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
            >
              Email me a magic link instead
            </button>
          </form>
        )}
      </div>

      <p className="mt-5 text-center text-xs text-slate-400">
        Recall is for dental clinics recovering missed-call patients.
      </p>
    </div>
  );
}
