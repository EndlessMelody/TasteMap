"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { CreditCard, Trash2 } from "lucide-react";
import { Column, Row } from "@once-ui-system/core";
import { Button, IconButton, BodySm, Caption, H2 } from "@/components/ui";
import { tokens } from "@/styles/tokens";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { useUiStore } from "@/store/uiStore";
import { membershipApi, formatVnd } from "@/lib/membershipApi";
import { TierBadgePill } from "./TierBadgePill";
import type { MembershipStatus, PaymentMethodStub, Transaction, Receipt } from "@/types/membership";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString();
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const MembershipSettingsTab: React.FC = () => {
  const { t } = useLanguage();
  const { refreshUser } = useAuth();
  const openCheckout = useUiStore((s) => s.openCheckout);

  const [status, setStatus] = useState<MembershipStatus | null>(null);
  const [methods, setMethods] = useState<PaymentMethodStub[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [openReceiptId, setOpenReceiptId] = useState<number | null>(null);
  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const [s, m, txns] = await Promise.all([
      membershipApi.getStatus(),
      membershipApi.getPaymentMethods().catch(() => []),
      membershipApi.getTransactions(10, 0).catch(() => ({ items: [] as Transaction[], total: 0, limit: 10, offset: 0 })),
    ]);
    setStatus(s);
    setMethods(m);
    setTransactions(txns.items);
  }

  useEffect(() => {
    load().catch(() => {});
  }, []);

  async function handleCancel() {
    setBusy(true);
    try {
      await membershipApi.cancel();
      await load();
      await refreshUser();
      toast.success(t("membership.settingsTab.cancelSuccess"));
    } catch {
      toast.error(t("membership.settingsTab.genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleResume() {
    setBusy(true);
    try {
      await membershipApi.resume();
      await load();
      await refreshUser();
    } catch {
      toast.error(t("membership.settingsTab.genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function handleRemoveCard(id: number) {
    try {
      await membershipApi.deletePaymentMethod(id);
      setMethods(await membershipApi.getPaymentMethods());
    } catch {
      toast.error(t("membership.settingsTab.removeCardError"));
    }
  }

  async function toggleReceipt(txn: Transaction) {
    if (openReceiptId === txn.id) {
      setOpenReceiptId(null);
      setReceipt(null);
      return;
    }
    try {
      const r = await membershipApi.getReceipt(txn.id);
      setReceipt(r);
      setOpenReceiptId(txn.id);
    } catch {
      toast.error(t("membership.settingsTab.receiptError"));
    }
  }

  if (!status) return null;

  return (
    <Column style={{ gap: tokens.space[6] }}>
      {/* ─── Current plan ─── */}
      <Column style={{ gap: tokens.space[3] }}>
        <H2 style={{ fontSize: tokens.type.size.h3 }}>{t("membership.settingsTab.title")}</H2>
        <Row horizontal="between" vertical="center" style={{ gap: tokens.space[4], flexWrap: "wrap" }}>
          <Column style={{ gap: tokens.space[2] }}>
            <Caption tone="muted">{t("membership.settingsTab.currentTier")}</Caption>
            <TierBadgePill tier={status.tier} label={t(`membership.tier${capitalize(status.tier)}`)} size="md" />
          </Column>
          {status.subscription && (
            <Column style={{ gap: 2, textAlign: "right" }}>
              <BodySm tone="muted">
                {status.subscription.cancel_at_period_end
                  ? t("membership.settingsTab.expiresOn", { date: formatDate(status.subscription.current_period_end) })
                  : t("membership.settingsTab.renewsOn", { date: formatDate(status.subscription.current_period_end) })}
              </BodySm>
              {status.subscription.cancel_at_period_end && (
                <Caption style={{ color: tokens.color.warning }}>
                  {t("membership.settingsTab.cancelAtPeriodEnd")}
                </Caption>
              )}
            </Column>
          )}
        </Row>

        {status.subscription ? (
          <Row>
            {status.subscription.cancel_at_period_end ? (
              <Button variant="secondary" size="sm" loading={busy} onClick={handleResume}>
                {t("membership.settingsTab.resumePlan")}
              </Button>
            ) : (
              <Button variant="ghost" size="sm" loading={busy} onClick={handleCancel}>
                {t("membership.settingsTab.cancelPlan")}
              </Button>
            )}
          </Row>
        ) : (
          <Button variant="primary" size="sm" onClick={() => openCheckout("feast_monthly")}>
            {t("membership.upgradeToFeast")}
          </Button>
        )}
      </Column>

      {/* ─── Payment methods ─── */}
      <Column style={{ gap: tokens.space[3] }}>
        <Row horizontal="between" vertical="center">
          <Caption tone="muted">{t("membership.settingsTab.paymentMethods")}</Caption>
          <Button variant="ghost" size="sm" onClick={() => openCheckout("feast_monthly")}>
            {t("membership.settingsTab.addCard")}
          </Button>
        </Row>
        {methods.length === 0 ? (
          <BodySm tone="muted">{t("membership.settingsTab.noPaymentMethods")}</BodySm>
        ) : (
          <Column style={{ gap: tokens.space[2] }}>
            {methods.map((m) => (
              <Row
                key={m.id}
                horizontal="between"
                vertical="center"
                style={{
                  padding: tokens.space[3],
                  borderRadius: tokens.radius.sm,
                  border: `1px solid ${tokens.color.border}`,
                }}
              >
                <Row vertical="center" style={{ gap: tokens.space[2] }}>
                  <CreditCard size={16} color={tokens.color.textMuted} />
                  <BodySm>•••• {m.last4}</BodySm>
                  <Caption tone="muted">{m.exp_month}/{m.exp_year}</Caption>
                  {m.is_default && <Caption style={{ color: tokens.color.tierFeast }}>{t("membership.settingsTab.default")}</Caption>}
                </Row>
                <IconButton
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveCard(m.id)}
                  aria-label={t("membership.settingsTab.remove")}
                  icon={<Trash2 size={14} />}
                  style={{ color: tokens.color.textMuted }}
                />
              </Row>
            ))}
          </Column>
        )}
      </Column>

      {/* ─── Transactions ─── */}
      <Column style={{ gap: tokens.space[3] }}>
        <Caption tone="muted">{t("membership.settingsTab.transactionHistory")}</Caption>
        {transactions.length === 0 ? (
          <BodySm tone="muted">{t("membership.settingsTab.noTransactions")}</BodySm>
        ) : (
          <Column style={{ gap: tokens.space[2] }}>
            {transactions.map((txn) => (
              <Column key={txn.id} style={{ borderRadius: tokens.radius.sm, border: `1px solid ${tokens.color.border}` }}>
                <Row
                  horizontal="between"
                  vertical="center"
                  onClick={() => txn.status === "succeeded" && toggleReceipt(txn)}
                  style={{ padding: tokens.space[3], cursor: txn.status === "succeeded" ? "pointer" : "default" }}
                >
                  <Column style={{ gap: 2 }}>
                    <BodySm style={{ fontWeight: tokens.type.weight.semibold }}>
                      {formatVnd(txn.amount_vnd)}
                    </BodySm>
                    <Caption tone="muted">{formatDate(txn.created_at)}</Caption>
                  </Column>
                  <Caption
                    style={{
                      color:
                        txn.status === "succeeded"
                          ? tokens.color.success
                          : txn.status === "declined"
                            ? tokens.color.danger
                            : tokens.color.textMuted,
                      textTransform: "uppercase",
                    }}
                  >
                    {t(`membership.settingsTab.status.${txn.status}`)}
                  </Caption>
                </Row>
                {openReceiptId === txn.id && receipt && (
                  <Column style={{ padding: tokens.space[3], borderTop: `1px solid ${tokens.color.border}`, gap: tokens.space[1] }}>
                    <Caption tone="muted">{receipt.receipt_number}</Caption>
                    <BodySm tone="muted">
                      {receipt.card_last4 ? `•••• ${receipt.card_last4}` : ""} · {receipt.plan}
                    </BodySm>
                  </Column>
                )}
              </Column>
            ))}
          </Column>
        )}
      </Column>
    </Column>
  );
};

export default MembershipSettingsTab;
