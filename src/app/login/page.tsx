"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type LoginState } from "@/lib/auth-actions";

const initial: LoginState = {};

export default function LoginPage() {
  const [state, action, pending] = useActionState(loginAction, initial);

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="site-logo" style={{ marginBottom: "1rem" }}>
          <span className="site-logo__name">Egigogo</span>
          <span className="site-logo__mark">Newspaper</span>
        </p>
        <h1>Staff login</h1>
        <p className="lead">Editors and reporters only.</p>
        <form className="auth-form" action={action}>
          <label>
            Email
            <input name="email" type="email" required autoComplete="username" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          {state.error ? (
            <p style={{ margin: 0, color: "var(--danger)", fontSize: "0.9rem" }}>
              {state.error}
            </p>
          ) : null}
          <button type="submit" className="btn" disabled={pending}>
            {pending ? "Signing in…" : "Log in"}
          </button>
        </form>
        <p style={{ margin: "1rem 0 0", fontSize: "0.9rem" }}>
          <Link href="/forgot-password">Forgot password</Link>
        </p>
      </div>
    </div>
  );
}
