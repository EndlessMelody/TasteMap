/**
 * Membership API client — typed wrappers over /api/v1/membership/*.
 * All membership endpoints wrap their payload in {success, data}; these
 * helpers unwrap it so callers just get the typed data.
 */
import { apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import type {
  Plan,
  EntitlementMatrix,
  MembershipStatus,
  Quotas,
  SubscribeCardInput,
  SubscribeResult,
  PaymentMethodStub,
  Transaction,
  Receipt,
  Frame,
} from "@/types/membership";

interface Envelope<T> {
  success: boolean;
  data: T;
  message?: string;
}

export function formatVnd(n: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);
}

export const membershipApi = {
  getPlans: async () => (await apiGet<Envelope<Plan[]>>("/api/v1/membership/plans")).data,

  getEntitlements: async () =>
    (await apiGet<Envelope<EntitlementMatrix>>("/api/v1/membership/entitlements")).data,

  getStatus: async () =>
    (await apiGet<Envelope<MembershipStatus>>("/api/v1/membership/me")).data,

  getQuotas: async () => (await apiGet<Envelope<Quotas>>("/api/v1/membership/quotas")).data,

  subscribe: async (params: {
    plan: "feast_monthly" | "feast_yearly";
    idempotencyKey: string;
    card?: SubscribeCardInput;
    paymentMethodId?: number;
  }) =>
    (
      await apiPost<Envelope<SubscribeResult>>("/api/v1/membership/subscribe", {
        plan: params.plan,
        idempotency_key: params.idempotencyKey,
        card: params.card,
        payment_method_id: params.paymentMethodId,
      })
    ).data,

  cancel: async () =>
    (await apiPost<Envelope<{ status: string; cancel_at_period_end: boolean; current_period_end: string }>>(
      "/api/v1/membership/cancel",
    )).data,

  resume: async () =>
    (await apiPost<Envelope<{ status: string; cancel_at_period_end: boolean }>>(
      "/api/v1/membership/resume",
    )).data,

  getPaymentMethods: async () =>
    (await apiGet<Envelope<PaymentMethodStub[]>>("/api/v1/membership/payment-methods")).data,

  addPaymentMethod: async (card: SubscribeCardInput & { setDefault?: boolean }) =>
    (
      await apiPost<Envelope<PaymentMethodStub>>("/api/v1/membership/payment-methods", {
        number: card.number,
        exp_month: card.exp_month,
        exp_year: card.exp_year,
        cvc: card.cvc,
        name: card.name,
        set_default: card.setDefault ?? false,
      })
    ).data,

  deletePaymentMethod: async (id: number) =>
    (await apiDelete<Envelope<null>>(`/api/v1/membership/payment-methods/${id}`)).data,

  getTransactions: async (limit = 10, offset = 0) =>
    (
      await apiGet<Envelope<{ items: Transaction[]; total: number; limit: number; offset: number }>>(
        `/api/v1/membership/transactions?limit=${limit}&offset=${offset}`,
      )
    ).data,

  getReceipt: async (transactionId: number) =>
    (await apiGet<Envelope<Receipt>>(`/api/v1/membership/transactions/${transactionId}/receipt`)).data,

  getFrames: async () => (await apiGet<Envelope<Frame[]>>("/api/v1/membership/frames")).data,

  equipFrame: async (frameId: number | null) =>
    (
      await apiPut<Envelope<{ equipped_frame_id: number | null }>>("/api/v1/membership/frames/equip", {
        frame_id: frameId,
      })
    ).data,
};
