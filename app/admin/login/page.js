"use client";

import { useActionState } from "react";
import Logo from "@/components/Logo";
import Button from "@/components/Button";
import { loginAdmin } from "@/lib/actions/auth";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, null);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper">
      <div className="w-full max-w-sm flex flex-col gap-6">
        <div className="text-center">
          <Logo size="md" />
          <p className="text-sm text-muted mt-2">Admin sign in</p>
        </div>

        <form action={formAction} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="username"
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium">Password</span>
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:border-ink"
            />
          </label>

          {state?.error ? (
            <p className="text-sm text-red-700">{state.error}</p>
          ) : null}

          <Button type="submit" variant="primary" disabled={pending} className="w-full justify-center">
            {pending ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </div>
    </div>
  );
}
