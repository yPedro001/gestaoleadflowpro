import type { UserProfile } from '@/types';

export function normalizeUserProfile(row: any): UserProfile {
  return {
    ...row,
    authUid: row.authUid ?? row.auth_uid,
    auth_uid: row.auth_uid ?? row.authUid,
    accessStatus: row.accessStatus ?? row.access_status,
    access_status: row.access_status ?? row.accessStatus,
    paymentStatus: row.paymentStatus ?? row.payment_status,
    payment_status: row.payment_status ?? row.paymentStatus,
    monthlyAmount: row.monthlyAmount ?? (row.monthly_amount !== undefined && row.monthly_amount !== null ? Number(row.monthly_amount) : null),
    monthly_amount: row.monthly_amount ?? row.monthlyAmount ?? null,
    paymentMethod: row.paymentMethod ?? row.payment_method ?? null,
    payment_method: row.payment_method ?? row.paymentMethod ?? null,
    expiresAt: row.expiresAt ?? row.expires_at ?? null,
    expires_at: row.expires_at ?? row.expiresAt ?? null,
    lastPaymentAt: row.lastPaymentAt ?? row.last_payment_at ?? null,
    last_payment_at: row.last_payment_at ?? row.lastPaymentAt ?? null,
    nextBillingAt: row.nextBillingAt ?? row.next_billing_at ?? null,
    next_billing_at: row.next_billing_at ?? row.nextBillingAt ?? null,
    internalNotes: row.internalNotes ?? row.internal_notes ?? null,
    internal_notes: row.internal_notes ?? row.internalNotes ?? null,
    suspensionReason: row.suspensionReason ?? row.suspension_reason ?? null,
    suspension_reason: row.suspension_reason ?? row.suspensionReason ?? null,
    createdAt: row.createdAt ?? row.created_at,
    created_at: row.created_at ?? row.createdAt,
    updatedAt: row.updatedAt ?? row.updated_at,
    updated_at: row.updated_at ?? row.updatedAt,
  };
}

export function normalizeUserProfiles(rows: any[]): UserProfile[] {
  return rows.map(normalizeUserProfile);
}
