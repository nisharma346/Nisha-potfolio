"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ── Client-side validation ────────────────────────────────────────────────
  function validate() {
    if (!email.trim()) return "Email address is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim()))
      return "Please enter a valid email address.";
    if (!password) return "Password is required.";
    if (password.length < 8) return "Password must be at least 8 characters.";
    return null;
  }

  // ── Form submission ───────────────────────────────────────────────────────
  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || "Login failed. Please try again.");
        return;
      }

      setSuccess("Login successful! Redirecting to dashboard…");
      // Small delay so user sees the success message
      setTimeout(() => router.push("/admin/dashboard"), 1000);
    } catch {
      setError("Unable to reach the server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }

  // ── UI ────────────────────────────────────────────────────────────────────
  return (
    <div className="admin-login-root">
      {/* Background decorative elements */}
      <div className="admin-login-bg-top" />
      <div className="admin-login-bg-bottom" />

      <div className="admin-login-wrapper">
        {/* Card */}
        <div className="admin-login-card">

          {/* Header */}
          <div className="admin-login-header">
            <Link href="/" className="admin-login-logo" aria-label="Back to portfolio">
              N<span>.</span>
            </Link>
            <span className="admin-login-eyebrow">ADMIN PORTAL</span>
            <h1 className="admin-login-title">
              Welcome <span>back.</span>
            </h1>
            <p className="admin-login-subtitle">
              Sign in to manage your portfolio content.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="admin-login-form" noValidate>

            {/* Email field */}
            <div className="admin-field-group">
              <label htmlFor="admin-email" className="admin-field-label">
                Email Address
              </label>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                placeholder="you@example.com"
                className="admin-field-input"
                disabled={loading}
                required
              />
            </div>

            {/* Password field */}
            <div className="admin-field-group">
              <label htmlFor="admin-password" className="admin-field-label">
                Password
              </label>
              <div className="admin-password-wrapper">
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="Enter your password"
                  className="admin-field-input admin-field-input--password"
                  disabled={loading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="admin-toggle-password"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  tabIndex={0}
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="admin-alert admin-alert--error" role="alert">
                <span className="admin-alert-icon">✕</span>
                {error}
              </div>
            )}

            {/* Success message */}
            {success && (
              <div className="admin-alert admin-alert--success" role="status">
                <span className="admin-alert-icon">✓</span>
                {success}
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="admin-login-btn"
            >
              {loading ? (
                <>
                  <span className="admin-spinner" />
                  Signing in…
                </>
              ) : (
                <>
                  Sign In
                  <span className="admin-btn-arrow">↗</span>
                </>
              )}
            </button>
          </form>

          {/* Footer link */}
          <div className="admin-login-back">
            <Link href="/" className="admin-login-back-link">
              ← Back to portfolio
            </Link>
          </div>
        </div>

        {/* Decorative side info */}
        <div className="admin-login-side">
          <div className="admin-login-side-inner">
            <div className="admin-login-monogram">N.</div>
            <p className="admin-login-side-label">PORTFOLIO ADMIN</p>
            <ul className="admin-login-side-features">
              <li>Manage Projects</li>
              <li>Update Skills</li>
              <li>Edit About Info</li>
              <li>View Messages</li>
            </ul>
            <p className="admin-login-side-note">
              Secure access · JWT protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
