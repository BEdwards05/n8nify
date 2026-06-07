"use client";

import Link from "next/link";
import { useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { authClient } from "@/lib/auth-client";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [asCreator, setAsCreator] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const { error: err } = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: asCreator ? "/dashboard/seller/onboard" : "/dashboard",
      });
      if (err) {
        setError(err.message ?? "Registration failed");
        return;
      }
      if (asCreator) {
        await fetch("/api/creator/onboard", { method: "POST" });
      }
    } catch {
      setError(
        "Could not reach the auth server. Make sure you're on http://localhost:3001.",
      );
    }
  }

  return (
    <div className="page-shell flex min-h-[calc(100svh-12rem)] items-center justify-center py-16">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <BrandLogo className="inline-block" />
          <h1 className="mt-6 font-display text-2xl font-semibold">Create account</h1>
          <p className="mt-2 text-sm text-muted">
            Already have one?{" "}
            <Link href="/login" className="text-accent hover:underline">
              Sign in
            </Link>
          </p>
        </div>
        <form onSubmit={onSubmit} className="space-y-4">
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="input"
          />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input"
          />
          <input
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password (min 8 characters)"
            className="input"
          />
          <label className="flex cursor-pointer items-center gap-3 text-sm text-muted">
            <input
              type="checkbox"
              checked={asCreator}
              onChange={(e) => setAsCreator(e.target.checked)}
              className="accent-accent"
            />
            I want to sell workflows
          </label>
          {error && <p className="text-sm text-accent">{error}</p>}
          <button type="submit" className="btn btn-primary w-full py-3">
            Create account
          </button>
        </form>
      </div>
    </div>
  );
}
