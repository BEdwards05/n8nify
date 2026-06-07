"use client";

import Link from "next/link";
import { useState } from "react";
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
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="mb-2 text-2xl font-semibold">Create account</h1>
      <p className="mb-8 text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent hover:underline">
          Sign in
        </Link>
      </p>
      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="w-full rounded-md border border-border px-3 py-2"
        />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="w-full rounded-md border border-border px-3 py-2"
        />
        <input
          type="password"
          required
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 chars)"
          className="w-full rounded-md border border-border px-3 py-2"
        />
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={asCreator}
            onChange={(e) => setAsCreator(e.target.checked)}
          />
          I want to sell workflows
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-accent py-2.5 text-white hover:bg-accent-hover"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
