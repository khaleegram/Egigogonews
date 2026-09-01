"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState, useTransition } from "react";
import { resetPassword } from "@/lib/password-actions";

function ResetForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [pending, start] = useTransition();

  if (!token) {
    return <p className="form-error">Missing reset token.</p>;
  }

  if (ok) {
    return (
      <p className="form-success">
        Password updated. <Link href="/login">Sign in</Link>
      </p>
    );
  }

  return (
    <form
      className="auth-form"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const result = await resetPassword({
            token,
            password: String(fd.get("password") ?? ""),
            confirm: String(fd.get("confirm") ?? ""),
          });
          if (!result.ok) setError(result.error);
          else setOk(true);
        });
      }}
    >
      <label>
        New password
        <input name="password" type="password" required minLength={8} />
      </label>
      <label>
        Confirm password
        <input name="confirm" type="password" required minLength={8} />
      </label>
      {error ? <p className="form-error">{error}</p> : null}
      <button type="submit" className="btn" disabled={pending}>
        Update password
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <h1>Reset password</h1>
        <p className="lead">Choose a new password for your staff account.</p>
        <Suspense fallback={<p>Loading…</p>}>
          <ResetForm />
        </Suspense>
        <p style={{ margin: "1rem 0 0", fontSize: "0.9rem" }}>
          <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
