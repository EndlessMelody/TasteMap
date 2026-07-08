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
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabase";
import { apiPost } from "@/lib/api";
import { toast } from "sonner";
import { Column, Row } from "@once-ui-system/core";
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

const HEADER_KEYS: Record<string, { titleKey: string; subtitleKey: string }> = {
  login: { titleKey: "auth.welcomeBack", subtitleKey: "auth.signInSubtitle" },
  info: { titleKey: "auth.createAccount", subtitleKey: "auth.createSubtitle" },
  password: { titleKey: "auth.setPassword", subtitleKey: "auth.setPasswordSubtitle" },
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
  const { t } = useLanguage();
  if (!password) return null;

  const criteria = [
    { label: t("auth.crit8"), met: password.length >= 8 },
    { label: t("auth.critUpper"), met: /[A-Z]/.test(password) },
    { label: t("auth.critLower"), met: /[a-z]/.test(password) },
    { label: t("auth.critNumber"), met: /[0-9]/.test(password) },
    { label: t("auth.critSpecial"), met: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = criteria.filter((c) => c.met).length;
  const LEVELS = [
    { label: t("auth.veryWeak"), color: tokens.color.danger },
    { label: t("auth.weak"), color: tokens.color.warm },
    { label: t("auth.fair"), color: tokens.color.warning },
    { label: t("auth.good"), color: tokens.color.success },
    { label: t("auth.strong"), color: tokens.color.success },
  ];
  const level = LEVELS[Math.max(0, score - 1)];

  return (
    <Column
      style={{
        marginTop: tokens.space[2],
        gap: tokens.space[2],
      }}
    >
      <Row style={{ gap: tokens.space[1] }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Column
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
      </Row>
      <BodySm style={{ color: level.color, fontWeight: 600 }}>
        {level.label}
      </BodySm>
      <Row style={{ flexWrap: "wrap", gap: "4px 14px" }}>
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
      </Row>
    </Column>
  );
}

export function LoginForm() {
  const router = useRouter();
  const { login, error: authError, clearError } = useAuth();
  const { t } = useLanguage();

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
      setError(t("auth.errEnterEmailOrUsername"));
      return;
    }
    if (!password) {
      setError(t("auth.errEnterPassword"));
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
      setError(t("auth.errEnterUsername"));
      return;
    }
    if (!email.trim()) {
      setError(t("auth.errEnterEmail"));
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("auth.errValidEmail"));
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
          setError(t("auth.errBothExist"));
        } else if (result.email_exists) {
          setError(t("auth.errEmailExists"));
        } else if (result.username_exists) {
          setError(t("auth.errUsernameExists"));
        } else {
          setError(result.message);
        }
        return;
      }
      setSignupStep("password");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : t("auth.errCheckFailed");
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
      setError(t("auth.errPwdMin"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("auth.errPwdMismatch"));
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
      toast.success(t("auth.accountCreated"));
      router.push("/discover");
    } catch (err) {
      let msg = err instanceof Error ? err.message : t("auth.errCreateFailed");
      if (
        msg.toLowerCase().includes("user already registered") ||
        msg.toLowerCase().includes("already exists")
      ) {
        msg = t("auth.errEmailExistsSignin");
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
  const { titleKey, subtitleKey } = HEADER_KEYS[hKey];
  const title = t(titleKey);
  const subtitle = t(subtitleKey);
  const backLabel =
    view === "signup" && signupStep === "password"
      ? t("auth.back")
      : view === "signup"
      ? t("auth.backToSignIn")
      : t("auth.backToHome");

  return (
    <Column
      style={{
        width: "100%",
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
        <Row style={{ gap: tokens.space[2] }}>
          {(["info", "password"] as SignupStep[]).map((step) => {
            const order = ["info", "password"];
            const active = step === signupStep;
            const done = order.indexOf(step) < order.indexOf(signupStep);
            return (
              <Column
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
        </Row>
      )}

      {/* Header */}
      <Column style={{ gap: tokens.space[3] }}>
        <Column
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
      </Column>

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
            {t("auth.continueGoogle")}
          </Button>
          <Row
            vertical="center"
            style={{
              gap: tokens.space[3],
            }}
          >
            <Column
              style={{ flex: 1, height: 1, background: tokens.color.border }}
            />
            <Caption tone="subtle">
              {view === "login" ? t("auth.orSignInEmail") : t("auth.orSignUpEmail")}
            </Caption>
            <Column
              style={{ flex: 1, height: 1, background: tokens.color.border }}
            />
          </Row>
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
            label={t("auth.emailOrUsername")}
            type="text"
            placeholder={t("auth.emailOrUsernamePlaceholder")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leading={<Mail size={16} strokeWidth={1.75} />}
          />
          <Field
            label={t("auth.password")}
            type={showPwd ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leading={<Lock size={16} strokeWidth={1.75} />}
            trailing={
              <IconButton
                aria-label={showPwd ? t("auth.hidePassword") : t("auth.showPassword")}
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
            {loading ? t("auth.signingIn") : t("auth.signIn")}
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
            label={t("auth.username")}
            type="text"
            placeholder={t("auth.usernamePlaceholder")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            leading={<User size={16} strokeWidth={1.75} />}
          />
          <Field
            label={t("auth.email")}
            type="email"
            placeholder={t("auth.emailPlaceholder")}
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
            {loading ? t("auth.checking") : t("auth.continueBtn")}
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
          <Column>
            <Field
              label={t("auth.password")}
              type={showPwd ? "text" : "password"}
              placeholder={t("auth.atLeast8")}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              leading={<Lock size={16} strokeWidth={1.75} />}
              trailing={
                <IconButton
                  aria-label={showPwd ? t("auth.hidePassword") : t("auth.showPassword")}
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
          </Column>
          <Field
            label={t("auth.confirmPassword")}
            type={showConfirm ? "text" : "password"}
            placeholder={t("auth.reenterPassword")}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            leading={<Lock size={16} strokeWidth={1.75} />}
            trailing={
              <IconButton
                aria-label={showConfirm ? t("auth.hidePassword") : t("auth.showPassword")}
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
            {loading ? t("auth.creatingAccount") : t("auth.createAccountBtn")}
          </Button>
        </form>
      )}

      {/* Switch view */}
      <BodySm tone="muted" style={{ textAlign: "center" }}>
        {view === "login"
          ? t("auth.noAccount")
          : t("auth.haveAccount")}
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
          {view === "login" ? t("auth.signUp") : t("auth.signIn")}
        </button>
      </BodySm>

      <Caption tone="subtle" style={{ textAlign: "center", lineHeight: 1.6 }}>
        {t("auth.terms")}
      </Caption>
    </Column>
  );
}
