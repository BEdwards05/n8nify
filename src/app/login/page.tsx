"use client";

import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";

function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { error: err } = await authClient.signIn.email({
        email,
        password,
        callbackURL: next,
      });
      if (err) setError(err.message ?? "Sign in failed");
    } catch {
      setError(
        "Could not reach the auth server. Make sure you're on http://localhost:3001 (n8nify dev port).",
      );
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="input"
        autoComplete="email"
      />
      <input
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="input"
        autoComplete="current-password"
      />
      {error && <p className="text-sm text-accent">{error}</p>}
      <button type="submit" className="btn btn-primary w-full py-3">
        Sign in
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="page-shell flex min-h-[calc(100svh-12rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <BrandLogo className="inline-block" />
          <h1 className="mt-6 font-display text-2xl font-semibold">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            New here?{" "}
            <Link href="/register" className="text-accent hover:underline">
              Create account
            </Link>
          </p>
        </div>
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
