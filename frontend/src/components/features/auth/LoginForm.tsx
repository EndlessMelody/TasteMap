"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ChevronLeft,
  Mail,
  Lock,
  User,
  Check,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import {
  Button,
  IconButton,
  Field,
  H2,
  Body,
  BodySm,
  Caption,
} from "@/components/ui";
import { tokens } from "@/styles/tokens";

type View = "login" | "signup";
type SignupStep = "info" | "password";

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

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
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
    { label: "Very weak", color: tokens.color.danger },
    { label: "Weak", color: tokens.color.warm },
    { label: "Fair", color: tokens.color.warning },
    { label: "Good", color: tokens.color.success },
    { label: "Strong", color: tokens.color.success },
  ];
  const level = LEVELS[Math.max(0, score - 1)];

  return (
    <div
      style={{
        marginTop: tokens.space[2],
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[2],
      }}
    >
      <div style={{ display: "flex", gap: tokens.space[1] }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <div
            key={n}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              background: n <= score ? level.color : tokens.color.surfaceInset,
              transition: "background 0.3s",
            }}
          />
        ))}
      </div>
      <BodySm style={{ color: level.color, fontWeight: 600 }}>
        {level.label}
      </BodySm>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 14px" }}>
        {criteria.map((c) => (
          <span
            key={c.label}
            style={{
              fontSize: tokens.type.size.caption,
              fontWeight: 600,
              letterSpacing: tokens.type.tracking.normal,
              color: c.met ? tokens.color.success : tokens.color.textSubtle,
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Check
              size={12}
              strokeWidth={2.5}
              style={{ opacity: c.met ? 1 : 0.4 }}
            />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

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
    } else if (view === "signup") {
      switchView("login");
    } else {
      router.push("/");
    }
  };

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
        queryParams: { prompt: "select_account" },
      },
    });
    if (error) toast.error(error.message);
  };

  const hKey = view === "login" ? "login" : signupStep;
  const { title, subtitle } = HEADERS[hKey];
  const backLabel =
    view === "signup" && signupStep === "password"
      ? "Back"
      : view === "signup"
      ? "Back to sign in"
      : "Back to home";

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: tokens.space[4],
      }}
    >
      {/* Back link */}
      <button
        type="button"
        onClick={handleBack}
        style={{
          alignSelf: "flex-start",
          display: "inline-flex",
          alignItems: "center",
          gap: tokens.space[1],
          background: "transparent",
          border: "none",
          padding: 0,
          cursor: "pointer",
          color: tokens.color.textMuted,
          fontSize: tokens.type.size.bodySm,
          fontWeight: tokens.type.weight.medium,
        }}
      >
        <ChevronLeft size={16} strokeWidth={1.75} />
        {backLabel}
      </button>

      {/* Progress (signup only) */}
      {view === "signup" && (
        <div style={{ display: "flex", gap: tokens.space[2] }}>
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
                    active || done
                      ? tokens.color.warm
                      : tokens.color.surfaceInset,
                  transition: "background 0.35s",
                }}
              />
            );
          })}
        </div>
      )}

      {/* Header */}
      <div style={{ display: "flex", flexDirection: "column", gap: tokens.space[3] }}>
        <div
          style={{
            width: 36,
            height: 4,
            borderRadius: 2,
            background: "linear-gradient(90deg, #ff6b35, #ff4757)",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: 800,
            letterSpacing: "-1px",
            lineHeight: 1.15,
            color: tokens.color.text,
          }}
        >
          {title}
        </h2>
        <Body tone="muted" style={{ marginTop: -2 }}>{subtitle}</Body>
      </div>

      {/* Google + divider (login & signup info only) */}
      {(view === "login" || (view === "signup" && signupStep === "info")) && (
        <>
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            leftIcon={<GoogleIcon />}
            onClick={handleGoogle}
          >
            Continue with Google
          </Button>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: tokens.space[3],
            }}
          >
            <div
              style={{ flex: 1, height: 1, background: tokens.color.border }}
            />
            <Caption tone="subtle">
              or {view === "login" ? "sign in" : "sign up"} with email
            </Caption>
            <div
              style={{ flex: 1, height: 1, background: tokens.color.border }}
            />
          </div>
        </>
      )}

      {/* LOGIN form */}
      {view === "login" && (
        <form
          onSubmit={handleLogin}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[4],
          }}
        >
          <Field
            label="Email or username"
            type="text"
            placeholder="you@example.com or username"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leading={<Mail size={16} strokeWidth={1.75} />}
          />
          <Field
            label="Password"
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leading={<Lock size={16} strokeWidth={1.75} />}
            trailing={
              <IconButton
                aria-label={showPwd ? "Hide password" : "Show password"}
                variant="ghost"
                size="sm"
                onClick={() => setShowPwd((p) => !p)}
                icon={
                  showPwd ? (
                    <EyeOff size={16} strokeWidth={1.75} />
                  ) : (
                    <Eye size={16} strokeWidth={1.75} />
                  )
                }
              />
            }
          />
          {error && <BodySm style={{ color: tokens.color.danger }}>{error}</BodySm>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            rightIcon={!loading && <ArrowRight size={16} strokeWidth={2} />}
          >
            {loading ? "Signing in…" : "Sign in"}
          </Button>
        </form>
      )}

      {/* SIGNUP step 1: info */}
      {view === "signup" && signupStep === "info" && (
        <form
          onSubmit={handleNextInfo}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[4],
          }}
        >
          <Field
            label="Username"
            type="text"
            placeholder="your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leading={<User size={16} strokeWidth={1.75} />}
          />
          <Field
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leading={<Mail size={16} strokeWidth={1.75} />}
          />
          {error && <BodySm style={{ color: tokens.color.danger }}>{error}</BodySm>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            rightIcon={!loading && <ArrowRight size={16} strokeWidth={2} />}
          >
            {loading ? "Checking…" : "Continue"}
          </Button>
        </form>
      )}

      {/* SIGNUP step 2: password */}
      {view === "signup" && signupStep === "password" && (
        <form
          onSubmit={handleSignup}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: tokens.space[4],
          }}
        >
          <div>
            <Field
              label="Password"
              type={showPwd ? "text" : "password"}
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              leading={<Lock size={16} strokeWidth={1.75} />}
              trailing={
                <IconButton
                  aria-label={showPwd ? "Hide password" : "Show password"}
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPwd((p) => !p)}
                  icon={
                    showPwd ? (
                      <EyeOff size={16} strokeWidth={1.75} />
                    ) : (
                      <Eye size={16} strokeWidth={1.75} />
                    )
                  }
                />
              }
            />
            <PasswordStrengthMeter password={password} />
          </div>
          <Field
            label="Confirm password"
            type={showConfirm ? "text" : "password"}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leading={<Lock size={16} strokeWidth={1.75} />}
            trailing={
              <IconButton
                aria-label={showConfirm ? "Hide password" : "Show password"}
                variant="ghost"
                size="sm"
                onClick={() => setShowConfirm((p) => !p)}
                icon={
                  showConfirm ? (
                    <EyeOff size={16} strokeWidth={1.75} />
                  ) : (
                    <Eye size={16} strokeWidth={1.75} />
                  )
                }
              />
            }
          />
          {error && <BodySm style={{ color: tokens.color.danger }}>{error}</BodySm>}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
            rightIcon={!loading && <ArrowRight size={16} strokeWidth={2} />}
          >
            {loading ? "Creating account…" : "Create account"}
          </Button>
        </form>
      )}

      {/* Switch view */}
      <BodySm tone="muted" style={{ textAlign: "center" }}>
        {view === "login"
          ? "Don't have an account? "
          : "Already have an account? "}
        <button
          type="button"
          onClick={() => switchView(view === "login" ? "signup" : "login")}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "inherit",
            fontWeight: tokens.type.weight.semibold,
            color: tokens.color.warm,
            padding: 0,
          }}
        >
          {view === "login" ? "Sign up" : "Sign in"}
        </button>
      </BodySm>

      <Caption tone="subtle" style={{ textAlign: "center", lineHeight: 1.6 }}>
        By continuing you agree to TasteMap&apos;s Terms of Service and Privacy
        Policy.
      </Caption>
    </div>
  );
}
