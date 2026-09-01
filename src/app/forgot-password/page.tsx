"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset } from "@/lib/password-actions";

export default function ForgotPasswordPage() {
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Forgot password</h1>
        {done ? (
          <p className="lead">If that account exists, we sent a link.</p>
        ) : (
          <>
            <p className="lead">Enter your staff email to receive a reset link.</p>
            <form
              className="auth-form"
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                start(async () => {
                  await requestPasswordReset(String(fd.get("email") ?? ""));
                  setDone(true);
                });
              }}
            >
              <label>
                Email
                <input name="email" type="email" required />
              </label>
              <button type="submit" className="btn" disabled={pending}>
                Send reset link
              </button>
            </form>
          </>
        )}
        <p style={{ margin: "1rem 0 0", fontSize: "0.9rem" }}>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
