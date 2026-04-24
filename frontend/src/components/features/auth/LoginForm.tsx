"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";

type View = "login" | "signup";
type SignupStep = "info" | "password";

// ── Module-level constants (prevents re-creation on every render) ─────────────
const inputBase: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "11px 14px 11px 42px",
  borderRadius: 11,
  fontSize: 14,
  outline: "none",
  transition: "border-color 0.2s, background 0.2s",
  background: "rgba(255,255,255,0.08)",
  border: "1.5px solid rgba(255,255,255,0.13)",
  color: "white",
};

const onFocusGlass = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "rgba(255,255,255,0.36)";
  e.target.style.background = "rgba(255,255,255,0.12)";
};
const onBlurGlass = (e: React.FocusEvent<HTMLInputElement>) => {
  e.target.style.borderColor = "rgba(255,255,255,0.13)";
  e.target.style.background = "rgba(255,255,255,0.08)";
};

// ── Sub-components (defined outside to prevent remount on parent re-render) ───
function Spinner() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="rgba(255,255,255,0.25)"
        strokeWidth="3"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

function GlassInput({
  icon,
  type,
  placeholder,
  value,
  onChange,
  right,
  center,
  autoFocus,
}: {
  icon?: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  right?: React.ReactNode;
  center?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <div
          style={{
            position: "absolute",
            left: 13,
            top: "50%",
            transform: "translateY(-50%)",
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            pointerEvents: "none",
          }}
        >
          {icon}
        </div>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocusGlass}
        onBlur={onBlurGlass}
        style={{
          ...inputBase,
          paddingLeft: icon ? 42 : 14,
          paddingRight: right ? 42 : 14,
          textAlign: center ? "center" : "left",
          letterSpacing: center ? "8px" : "normal",
          fontSize: center ? 22 : 14,
          fontWeight: center ? 700 : 400,
        }}
      />
      {right && (
        <div
          style={{
            position: "absolute",
            right: 12,
            top: "50%",
            transform: "translateY(-50%)",
          }}
        >
          {right}
        </div>
      )}
    </div>
  );
}

function PrimaryBtn({
  label,
  loadingLabel,
  loading,
  disabled,
}: {
  label: React.ReactNode;
  loadingLabel: string;
  loading: boolean;
  disabled?: boolean;
}) {
  const off = loading || disabled;
  return (
    <button
      type="submit"
      disabled={off}
      style={{
        marginTop: 4,
        width: "100%",
        padding: "12px 0",
        borderRadius: 11,
        background: off
          ? "rgba(26,122,255,0.38)"
          : "linear-gradient(135deg,#1A7AFF,#5856D6)",
        border: "none",
        cursor: off ? "not-allowed" : "pointer",
        color: "white",
        fontSize: 14,
        fontWeight: 700,
        letterSpacing: "-0.2px",
        boxShadow: off ? "none" : "0 4px 20px rgba(26,122,255,0.38)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        transition: "box-shadow 0.2s",
      }}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}

function ErrorBox({ error }: { error: string }) {
  if (!error) return null;
  return (
    <div
      style={{
        padding: "9px 13px",
        borderRadius: 9,
        background: "rgba(255,65,65,0.12)",
        border: "1px solid rgba(255,75,75,0.25)",
      }}
    >
      <span style={{ fontSize: 13, color: "#FF8080" }}>{error}</span>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        display: "block",
        fontSize: 12,
        fontWeight: 600,
        color: "rgba(255,255,255,0.6)",
        marginBottom: 6,
        letterSpacing: "0.2px",
      }}
    >
      {children}
    </label>
  );
}

function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const criteria = [
    { label: "8+ characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
    { label: "Special character", met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = criteria.filter((c) => c.met).length;
  const LEVELS = [
    { label: "Very weak", color: "#FF3B30" },
    { label: "Weak", color: "#FF6B35" },
    { label: "Fair", color: "#FFCC00" },
    { label: "Good", color: "#34C759" },
    { label: "Strong", color: "#30D158" },
  ];
  const level = LEVELS[Math.max(0, score - 1)];

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: n <= score ? level.color : "rgba(255,255,255,0.1)",
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 5,
        }}
      >
        <span style={{ fontSize: 11, fontWeight: 700, color: level.color }}>
          {level.label}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 14px" }}>
        {criteria.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: 11,
              color: c.met ? "rgba(52,199,89,0.9)" : "rgba(255,255,255,0.28)",
              display: "flex",
              alignItems: "center",
              gap: 4,
              transition: "color 0.25s",
            }}
          >
            <span>{c.met ? "✓" : "○"}</span>
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export function LoginForm() {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuth();

  const [view, setView] = useState<View>("login");
  const [signupStep, setSignupStep] = useState<SignupStep>("info");

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const clearErrors = () => {
    setError("");
    clearError();
  };

  const switchView = (next: View) => {
    setView(next);
    setSignupStep("info");
    setPassword("");
    setConfirmPassword("");
    clearErrors();
  };

  const handleBack = () => {
    clearErrors();
    if (signupStep === "password") {
      setSignupStep("info");
      setPassword("");
      setConfirmPassword("");
    } else switchView("login");
  };

  // ── LOGIN ──────────────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!email.trim()) {
      setError("Please enter your email or username.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    setLoading(true);
    try {
      await login({ emailOrUsername: email, password });
      router.push("/discover");
    } catch {
      /* error handled by context */
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP STEP 1: validate info, check uniqueness, advance ─────────────
  const handleNextInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email.");
      return;
    }
    setLoading(true);
    try {
      const result = (await apiPost("/api/v1/auth/register/check", {
        email,
        username,
      })) as {
        available: boolean;
        email_exists: boolean;
        username_exists: boolean;
        message: string;
      };
      if (!result.available) {
        if (result.email_exists && result.username_exists) {
          setError("Both email and username are already registered.");
        } else if (result.email_exists) {
          setError("This email is already registered.");
        } else if (result.username_exists) {
          setError("This username is already taken.");
        } else {
          setError(result.message);
        }
        return;
      }
      setSignupStep("password");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to check availability";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── SIGNUP STEP 2: create account ────────────────────────────────────────
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
      });
      if (err) throw err;
      toast.success("Account created!");
      router.push("/discover");
    } catch (err) {
      let msg = err instanceof Error ? err.message : "Failed to create account";
      // Detect Supabase "User already registered" error and show friendlier message
      if (
        msg.toLowerCase().includes("user already registered") ||
        msg.toLowerCase().includes("already exists")
      ) {
        msg = "This email is already registered. Please sign in instead.";
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        }
      },
    });
    if (error) toast.error(error.message);
  };

  // ── Header per step ────────────────────────────────────────────────────────
  const HEADERS: Record<string, { title: string; subtitle: string }> = {
    login: {
      title: "Welcome back",
      subtitle: "Sign in to continue to TasteMap",
    },
    info: {
      title: "Create account",
      subtitle: "Start your food journey today",
    },
    password: {
      title: "Set your password",
      subtitle: "Almost done — choose a strong password",
    },
  };
  const hKey = view === "login" ? "login" : signupStep;
  const { title, subtitle } = HEADERS[hKey];

  const EyeBtn = ({ show, toggle }: { show: boolean; toggle: () => void }) => (
    <button
      type="button"
      onClick={toggle}
      style={{
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "rgba(255,255,255,0.35)",
        display: "flex",
        padding: 2,
      }}
    >
      {show ? <EyeOff size={15} /> : <Eye size={15} />}
    </button>
  );

  return (
    <div style={{ width: "100%" }}>
      {/* Back button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.05 }}
        onClick={handleBack}
        type="button"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 5,
          background: "none",
          border: "none",
          cursor: "pointer",
          color: "rgba(255,255,255,0.35)",
          fontSize: 13,
          fontWeight: 500,
          marginBottom: 24,
          padding: 0,
          transition: "color 0.15s",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.8)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.color = "rgba(255,255,255,0.35)")
        }
      >
        <ChevronLeft size={15} />
        {view === "signup" && signupStep !== "info" ? "Back" : "Back to home"}
      </motion.button>

      {/* Progress bar */}
      {view === "signup" && (
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {(["info", "password"] as SignupStep[]).map((step) => {
            const order = ["info", "password"];
            const active = step === signupStep;
            const done = order.indexOf(step) < order.indexOf(signupStep);
            return (
              <div
                key={step}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background:
                    active || done ? "#4F8EF7" : "rgba(255,255,255,0.1)",
                  transition: "background 0.35s",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Header */}
      <motion.div
        key={hKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        style={{ marginBottom: 22 }}
      >
        <h2
          style={{
            margin: "0 0 5px",
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.6px",
            lineHeight: 1.15,
          }}
        >
          {title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: "rgba(255,255,255,0.4)",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      </motion.div>

      {/* Google + divider (login & signup step 1) */}
      {(view === "login" || (view === "signup" && signupStep === "info")) && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Google button */}
          <button
            type="button"
            onClick={handleGoogle}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              padding: "11px",
              borderRadius: 11,
              marginBottom: 14,
              background: "rgba(255,255,255,0.07)",
              border: "1.5px solid rgba(255,255,255,0.13)",
              cursor: "pointer",
              fontSize: 14,
              fontWeight: 600,
              color: "rgba(255,255,255,0.88)",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.12)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.22)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.07)";
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.13)";
            }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18">
              <path
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>
          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 14,
            }}
          >
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.09)",
              }}
            />
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.26)" }}>
              or {view === "login" ? "sign in" : "sign up"} with email
            </span>
            <div
              style={{
                flex: 1,
                height: 1,
                background: "rgba(255,255,255,0.09)",
              }}
            />
          </div>
        </motion.div>
      )}

      {/* ── LOGIN ─────────────────────────────────────────────────────── */}
      {view === "login" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          onSubmit={handleLogin}
          style={{ display: "flex", flexDirection: "column", gap: 11 }}
        >
          <div>
            <FieldLabel>Email or Username</FieldLabel>
            <GlassInput
              icon={<Mail size={15} />}
              type="text"
              placeholder="you@example.com or username"
              value={email}
              onChange={setEmail}
            />
          </div>
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <label
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.6)",
                }}
              >
                Password
              </label>
              <button
                type="button"
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: "#4F8EF7",
                  fontWeight: 600,
                  padding: 0,
                }}
              >
                Forgot?
              </button>
            </div>
            <GlassInput
              icon={<Lock size={15} />}
              type={showPwd ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={setPassword}
              right={
                <EyeBtn show={showPwd} toggle={() => setShowPwd((p) => !p)} />
              }
            />
          </div>
          <ErrorBox error={error} />
          <PrimaryBtn
            loading={loading}
            loadingLabel="Signing in…"
            label={
              <>
                Sign in <ArrowRight size={14} />
              </>
            }
          />
        </motion.form>
      )}

      {/* ── SIGNUP STEP 1: info ───────────────────────────────────────── */}
      {view === "signup" && signupStep === "info" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
          onSubmit={handleNextInfo}
          style={{ display: "flex", flexDirection: "column", gap: 11 }}
        >
          <div>
            <FieldLabel>Username</FieldLabel>
            <GlassInput
              icon={<User size={15} />}
              type="text"
              placeholder="your username"
              value={username}
              onChange={setUsername}
            />
          </div>
          <div>
            <FieldLabel>Email</FieldLabel>
            <GlassInput
              icon={<Mail size={15} />}
              type="email"
              placeholder="youremail@example.com"
              value={email}
              onChange={setEmail}
            />
          </div>
          <ErrorBox error={error} />
          <PrimaryBtn
            loading={loading}
            loadingLabel="Checking…"
            label={
              <>
                Continue <ArrowRight size={14} />
              </>
            }
          />
        </motion.form>
      )}

      {/* ── SIGNUP STEP 2: password ─────────────────────────────────────────────── */}
      {view === "signup" && signupStep === "password" && (
        <motion.form
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          onSubmit={handleSignup}
          style={{ display: "flex", flexDirection: "column", gap: 11 }}
        >
          <div>
            <FieldLabel>Password</FieldLabel>
            <GlassInput
              icon={<Lock size={15} />}
              type={showPwd ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={setPassword}
              autoFocus
              right={
                <EyeBtn show={showPwd} toggle={() => setShowPwd((p) => !p)} />
              }
            />
            <PasswordStrengthMeter password={password} />
          </div>
          <div>
            <FieldLabel>Confirm Password</FieldLabel>
            <GlassInput
              icon={<Lock size={15} />}
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              right={
                <EyeBtn
                  show={showConfirm}
                  toggle={() => setShowConfirm((p) => !p)}
                />
              }
            />
          </div>
          <ErrorBox error={error} />
          <PrimaryBtn
            loading={loading}
            loadingLabel="Creating account…"
            label={
              <>
                Create account <ArrowRight size={14} />
              </>
            }
          />
        </motion.form>
      )}

      {/* Switch view */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        style={{
          margin: "20px 0 0",
          textAlign: "center",
          fontSize: 13,
          color: "rgba(255,255,255,0.32)",
        }}
      >
        {view === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          onClick={() => switchView(view === "login" ? "signup" : "login")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            color: "#4F8EF7",
            padding: 0,
          }}
        >
          {view === "login" ? "Sign up" : "Sign in"}
        </button>
      </motion.p>

      <p
        style={{
          margin: "16px 0 0",
          textAlign: "center",
          fontSize: 11,
          color: "rgba(255,255,255,0.16)",
          lineHeight: 1.6,
        }}
      >
        By continuing you agree to TasteMap&apos;s Terms of Service and Privacy
        Policy.
      </p>

      <style>{`
        input::placeholder { color: rgba(255,255,255,0.25); }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
