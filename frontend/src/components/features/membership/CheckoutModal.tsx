"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { Button, IconButton, Field, H2, Body, BodySm, Caption } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { transitions } from "@/lib/motion";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { membershipApi, formatVnd } from "@/lib/membershipApi";
import { usePlans } from "@/hooks/usePlans";
import { ApiError } from "@/lib/api";

type Step = "plan" | "card" | "processing" | "success" | "error";
type PlanId = "feast_monthly" | "feast_yearly";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPlan?: PlanId;
}

function luhnCheck(digits: string): boolean {
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (alt) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    alt = !alt;
  }
  return digits.length > 0 && sum % 10 === 0;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function backdropStyle(): React.CSSProperties {
  return {
    position: "fixed",
    inset: 0,
    zIndex: tokens.z.modal,
    backgroundColor: "rgba(0,0,0,0.4)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: tokens.space[4],
  };
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, initialPlan }) => {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const { byId: planById } = usePlans();

  const [step, setStep] = useState<Step>("plan");
  const [plan, setPlan] = useState<PlanId>(initialPlan ?? "feast_monthly");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState(""); // MM/YY
  const [cvc, setCvc] = useState("");
  const [name, setName] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [receiptNumber, setReceiptNumber] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string>("");

  useEffect(() => {
    if (isOpen) {
      setStep("plan");
      setPlan(initialPlan ?? "feast_monthly");
      setCardNumber("");
      setExpiry("");
      setCvc("");
      setName("");
      setFieldError(null);
      setErrorMessage(null);
      setReceiptNumber(null);
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    }
  }, [isOpen, initialPlan]);

  const cleanedNumber = cardNumber.replace(/\s/g, "");

  async function handlePay() {
    setFieldError(null);

    const [mmStr, yyStr] = expiry.split("/").map((s) => s.trim());
    const expMonth = parseInt(mmStr, 10);
    const expYear = yyStr ? 2000 + parseInt(yyStr, 10) : NaN;

    if (!/^\d{13,19}$/.test(cleanedNumber) || !luhnCheck(cleanedNumber)) {
      setFieldError(t("membership.checkout.invalidCard"));
      return;
    }
    if (!expMonth || expMonth < 1 || expMonth > 12 || !expYear) {
      setFieldError(t("membership.checkout.invalidExpiry"));
      return;
    }
    if (!/^\d{3,4}$/.test(cvc)) {
      setFieldError(t("membership.checkout.invalidCvc"));
      return;
    }

    setStep("processing");
    try {
      const result = await membershipApi.subscribe({
        plan,
        idempotencyKey: idempotencyKeyRef.current,
        card: { number: cleanedNumber, exp_month: expMonth, exp_year: expYear, cvc, name: name || undefined },
      });
      setReceiptNumber(result.transaction.receipt_number);
      await refreshUser();
      setStep("success");
    } catch (err) {
      if (err instanceof ApiError && err.errorCode === "VALIDATION_ERROR") {
        setFieldError(err.message);
        setStep("card");
        return;
      }
      setErrorMessage(err instanceof ApiError ? err.message : t("membership.checkout.declineGeneric"));
      setStep("error");
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transitions.snappy}
          onClick={step === "processing" ? undefined : onClose}
          style={backdropStyle()}
        >
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={transitions.spring}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 440,
              maxWidth: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              background: tokens.color.surface,
              border: `1px solid ${tokens.color.border}`,
              borderRadius: tokens.radius.xl,
              boxShadow: tokens.shadow.lg,
            }}
          >
            <Row
              horizontal="between"
              vertical="center"
              style={{ padding: `${tokens.space[5]} ${tokens.space[6]}`, borderBottom: `1px solid ${tokens.color.border}` }}
            >
              <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("membership.checkout.title")}</H2>
              {step !== "processing" && (
                <IconButton
                  variant="ghost"
                  size="sm"
                  aria-label={t("common.close")}
                  icon={<X size={16} />}
                  onClick={onClose}
                />
              )}
            </Row>

            <Column style={{ padding: tokens.space[6], gap: tokens.space[5] }}>
              <AnimatePresence mode="wait">
                {step === "plan" && (
                  <motion.div key="plan" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={transitions.smooth}>
                    <Column style={{ gap: tokens.space[4] }}>
                      {(["feast_monthly", "feast_yearly"] as PlanId[]).map((p) => {
                        const active = plan === p;
                        const planInfo = planById[p];
                        return (
                          <Row
                            key={p}
                            onClick={() => setPlan(p)}
                            horizontal="between"
                            vertical="center"
                            style={{
                              padding: tokens.space[4],
                              borderRadius: tokens.radius.md,
                              border: active ? `2px solid ${tokens.color.tierFeast}` : `1px solid ${tokens.color.border}`,
                              background: active ? "rgba(123,47,247,0.06)" : "transparent",
                              cursor: "pointer",
                            }}
                          >
                            <Column style={{ gap: 2 }}>
                              <Body style={{ fontWeight: tokens.type.weight.semibold }}>
                                {p === "feast_monthly" ? t("membership.monthly") : t("membership.yearly")}
                              </Body>
                              {p === "feast_yearly" && planById.feast_yearly?.savings_pct != null && (
                                <Caption tone="muted">
                                  {t("membership.savePct", { n: planById.feast_yearly.savings_pct })}
                                </Caption>
                              )}
                            </Column>
                            <Body style={{ fontWeight: tokens.type.weight.bold, color: tokens.color.tierFeast }}>
                              {planInfo ? formatVnd(planInfo.price_vnd) : "—"}
                              <span style={{ color: tokens.color.textMuted, fontWeight: 400 }}>
                                {p === "feast_monthly" ? t("membership.perMonth") : t("membership.perYear")}
                              </span>
                            </Body>
                          </Row>
                        );
                      })}
                      <Button
                        variant="primary"
                        fullWidth
                        disabled={!planById.feast_monthly || !planById.feast_yearly}
                        onClick={() => setStep("card")}
                      >
                        {t("common.confirm")}
                      </Button>
                    </Column>
                  </motion.div>
                )}

                {step === "card" && (
                  <motion.div key="card" initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -12 }} transition={transitions.smooth}>
                    <Column style={{ gap: tokens.space[4] }}>
                      <Row
                        style={{
                          padding: tokens.space[3],
                          borderRadius: tokens.radius.sm,
                          background: tokens.color.surfaceMuted,
                          border: `1px solid ${tokens.color.border}`,
                        }}
                      >
                        <BodySm tone="muted">{t("membership.checkout.testCardsHint")}</BodySm>
                      </Row>

                      <Field
                        label={t("membership.checkout.cardNumber")}
                        leading={<CreditCard size={14} />}
                        placeholder="4242 4242 4242 4242"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        inputMode="numeric"
                        autoComplete="cc-number"
                      />
                      <Row style={{ gap: tokens.space[3] }}>
                        <Column style={{ flex: 1 }}>
                          <Field
                            label={t("membership.checkout.expiry")}
                            placeholder="MM/YY"
                            value={expiry}
                            onChange={(e) => {
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
                            }}
                            inputMode="numeric"
                            autoComplete="cc-exp"
                          />
                        </Column>
                        <Column style={{ flex: 1 }}>
                          <Field
                            label={t("membership.checkout.cvc")}
                            placeholder="123"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                            inputMode="numeric"
                            autoComplete="cc-csc"
                          />
                        </Column>
                      </Row>
                      <Field
                        label={t("membership.checkout.cardholderName")}
                        placeholder="NGUYEN VAN A"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        autoComplete="cc-name"
                        error={fieldError ?? undefined}
                      />

                      <Button variant="primary" fullWidth onClick={handlePay}>
                        {t("membership.checkout.pay", {
                          amount: planById[plan] ? formatVnd(planById[plan]!.price_vnd) : "—",
                        })}
                      </Button>
                    </Column>
                  </motion.div>
                )}

                {step === "processing" && (
                  <motion.div key="processing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={transitions.smooth}>
                    <Column horizontal="center" style={{ gap: tokens.space[4], padding: `${tokens.space[8]} 0` }}>
                      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                        <Loader2 size={32} color={tokens.color.tierFeast} />
                      </motion.div>
                      <Body tone="muted">{t("membership.checkout.processingBody")}</Body>
                    </Column>
                  </motion.div>
                )}

                {step === "success" && (
                  <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={transitions.spring}>
                    <Column horizontal="center" style={{ gap: tokens.space[4], padding: `${tokens.space[6]} 0`, textAlign: "center" }}>
                      <CheckCircle2 size={48} color={tokens.color.success} />
                      <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("membership.checkout.successTitle")}</H2>
                      <Body tone="muted">
                        {t("membership.checkout.successBody", { receipt: receiptNumber ?? "" })}
                      </Body>
                      <Button variant="primary" fullWidth onClick={onClose}>
                        {t("membership.checkout.done")}
                      </Button>
                    </Column>
                  </motion.div>
                )}

                {step === "error" && (
                  <motion.div key="error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={transitions.spring}>
                    <Column horizontal="center" style={{ gap: tokens.space[4], padding: `${tokens.space[6]} 0`, textAlign: "center" }}>
                      <AlertCircle size={48} color={tokens.color.danger} />
                      <Body style={{ color: tokens.color.danger }}>{errorMessage}</Body>
                      <Button variant="primary" fullWidth onClick={() => setStep("card")}>
                        {t("membership.checkout.tryAgain")}
                      </Button>
                    </Column>
                  </motion.div>
                )}
              </AnimatePresence>
            </Column>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
