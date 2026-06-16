'use server';

import { revalidatePath } from 'next/cache';
import { createAdminSupabase, createServerSupabase } from '@/lib/supabase/server';
import type { AccessStatus, PaymentStatus, UserPlan } from '@/types';
import { z } from 'zod';

const createUserSchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter ao menos 6 caracteres'),
  plan: z.enum(['STARTER', 'PROFISSIONAL', 'ENTERPRISE']),
  accessStatus: z.enum(['ATIVO', 'PAUSADO', 'SUSPENSO', 'CANCELADO', 'AGUARDANDO_PAGAMENTO', 'EM_TESTE']),
  paymentStatus: z.enum(['PAGO', 'PENDENTE', 'VENCIDO', 'EM_TESTE', 'ISENTO', 'CANCELADO']),
  monthlyAmount: z.string().optional(),
  paymentMethod: z.string().optional(),
  expiresAt: z.string().optional(),
  internalNotes: z.string().optional(),
});

export type ActionResult = {
  success: boolean;
  error?: string;
  message?: string;
};

async function getAdminEmail(): Promise<string> {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email || 'admin@system';
}

async function logAudit(
  adminEmail: string,
  action: string,
  targetEmail?: string,
  targetProfileId?: string,
  previousData?: Record<string, unknown>,
  newData?: Record<string, unknown>,
  reason?: string
) {
  const admin = createAdminSupabase();
  await admin.from('admin_audit_logs').insert({
    admin_email: adminEmail,
    action,
    target_email: targetEmail || null,
    target_profile_id: targetProfileId || null,
    previous_data: previousData || null,
    new_data: newData || null,
    reason: reason || null,
  });
}

// ─────────────────────────────────────────────
// Criar usuário
// ─────────────────────────────────────────────
export async function createUser(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData.entries());
  const parsed = createUserSchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const {
    name, email, password, plan, accessStatus, paymentStatus,
    monthlyAmount, paymentMethod, expiresAt, internalNotes,
  } = parsed.data;

  const admin = createAdminSupabase();
  const adminEmail = await getAdminEmail();

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (authError) {
    if (authError.message.includes('already registered') || authError.message.includes('already been registered')) {
      return { success: false, error: 'Este e-mail já está cadastrado no sistema.' };
    }
    return { success: false, error: `Erro ao criar usuário: ${authError.message}` };
  }

  const userId = authData.user.id;

  // 2. Criar perfil na tabela profiles
  const { data: profileData, error: profileError } = await admin
    .from('profiles')
    .insert({
      auth_uid: userId,
      name,
      email,
      role: 'USER',
      plan,
      access_status: accessStatus,
      payment_status: paymentStatus,
      monthly_amount: monthlyAmount ? parseFloat(monthlyAmount) : null,
      payment_method: paymentMethod || null,
      expires_at: expiresAt || null,
      internal_notes: internalNotes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (profileError) {
    // Rollback: remover usuário do auth se perfil falhar
    await admin.auth.admin.deleteUser(userId);
    return { success: false, error: `Erro ao criar perfil: ${profileError.message}` };
  }

  await logAudit(adminEmail, 'CREATE_USER', email, profileData.id, undefined, {
    name, plan, accessStatus, paymentStatus,
  });

  revalidatePath('/usuarios');
  return { success: true, message: `Usuário ${name} criado com sucesso!` };
}

// ─────────────────────────────────────────────
// Atualizar dados do usuário
// ─────────────────────────────────────────────
export async function updateUser(
  profileId: string,
  data: {
    name?: string;
    plan?: UserPlan;
    accessStatus?: AccessStatus;
    paymentStatus?: PaymentStatus;
    monthlyAmount?: number | null;
    paymentMethod?: string | null;
    expiresAt?: string | null;
    lastPaymentAt?: string | null;
    nextBillingAt?: string | null;
    internalNotes?: string | null;
    suspensionReason?: string | null;
  }
): Promise<ActionResult> {
  const admin = createAdminSupabase();
  const adminEmail = await getAdminEmail();

  // Buscar dados anteriores para audit log
  const { data: prev } = await admin
    .from('profiles')
    .select('*')
    .eq('id', profileId)
    .single();

  const updatePayload: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.plan !== undefined) updatePayload.plan = data.plan;
  if (data.accessStatus !== undefined) updatePayload.access_status = data.accessStatus;
  if (data.paymentStatus !== undefined) updatePayload.payment_status = data.paymentStatus;
  if (data.monthlyAmount !== undefined) updatePayload.monthly_amount = data.monthlyAmount;
  if (data.paymentMethod !== undefined) updatePayload.payment_method = data.paymentMethod;
  if (data.expiresAt !== undefined) updatePayload.expires_at = data.expiresAt;
  if (data.lastPaymentAt !== undefined) updatePayload.last_payment_at = data.lastPaymentAt;
  if (data.nextBillingAt !== undefined) updatePayload.next_billing_at = data.nextBillingAt;
  if (data.internalNotes !== undefined) updatePayload.internal_notes = data.internalNotes;
  if (data.suspensionReason !== undefined) updatePayload.suspension_reason = data.suspensionReason;

  const { error } = await admin
    .from('profiles')
    .update(updatePayload)
    .eq('id', profileId);

  if (error) {
    return { success: false, error: `Erro ao atualizar: ${error.message}` };
  }

  await logAudit(adminEmail, 'UPDATE_USER', prev?.email, profileId, prev as Record<string, unknown>, updatePayload);

  revalidatePath('/usuarios');
  return { success: true, message: 'Usuário atualizado com sucesso!' };
}

// ─────────────────────────────────────────────
// Alterar senha do usuário
// ─────────────────────────────────────────────
export async function changeUserPassword(
  authUid: string,
  profileEmail: string,
  newPassword: string
): Promise<ActionResult> {
  if (newPassword.length < 6) {
    return { success: false, error: 'A senha deve ter ao menos 6 caracteres.' };
  }

  const admin = createAdminSupabase();
  const adminEmail = await getAdminEmail();

  const { error } = await admin.auth.admin.updateUserById(authUid, {
    password: newPassword,
    email_confirm: true,
  });

  if (error) {
    return { success: false, error: `Erro ao alterar senha: ${error.message}` };
  }

  await logAudit(adminEmail, 'CHANGE_PASSWORD', profileEmail, undefined, undefined, undefined);

  return { success: true, message: 'Senha alterada com sucesso!' };
}

// ─────────────────────────────────────────────
// Suspender usuário
// ─────────────────────────────────────────────
export async function suspendUser(
  profileId: string,
  email: string,
  reason?: string
): Promise<ActionResult> {
  return updateUser(profileId, {
    accessStatus: 'SUSPENSO',
    paymentStatus: 'VENCIDO',
    suspensionReason: reason || 'Suspenso por inadimplência',
  });
}

// ─────────────────────────────────────────────
// Pausar usuário
// ─────────────────────────────────────────────
export async function pauseUser(profileId: string, reason?: string): Promise<ActionResult> {
  return updateUser(profileId, {
    accessStatus: 'PAUSADO',
    suspensionReason: reason || null,
  });
}

// ─────────────────────────────────────────────
// Reativar usuário
// ─────────────────────────────────────────────
export async function reactivateUser(
  profileId: string,
  email: string,
  newExpiresAt?: string
): Promise<ActionResult> {
  return updateUser(profileId, {
    accessStatus: 'ATIVO',
    paymentStatus: 'PAGO',
    suspensionReason: null,
    lastPaymentAt: new Date().toISOString(),
    expiresAt: newExpiresAt || null,
  });
}

// ─────────────────────────────────────────────
// Cancelar usuário (sem excluir)
// ─────────────────────────────────────────────
export async function cancelUser(profileId: string, reason?: string): Promise<ActionResult> {
  return updateUser(profileId, {
    accessStatus: 'CANCELADO',
    paymentStatus: 'CANCELADO',
    suspensionReason: reason || 'Cancelado pelo administrador',
  });
}

// ─────────────────────────────────────────────
// Registrar pagamento manual
// ─────────────────────────────────────────────
export async function registerPayment(
  profileId: string,
  email: string,
  data: {
    amount: number;
    paymentMethod?: string;
    referenceMonth?: string;
    dueAt?: string;
    notes?: string;
    newExpiresAt?: string;
  }
): Promise<ActionResult> {
  const admin = createAdminSupabase();
  const adminEmail = await getAdminEmail();

  const { error: billingError } = await admin.from('billing_records').insert({
    profile_id: profileId,
    amount: data.amount,
    payment_status: 'PAGO',
    payment_method: data.paymentMethod || null,
    reference_month: data.referenceMonth || null,
    paid_at: new Date().toISOString(),
    due_at: data.dueAt || null,
    notes: data.notes || null,
  });

  if (billingError) {
    return { success: false, error: `Erro ao registrar pagamento: ${billingError.message}` };
  }

  // Atualiza status do usuário para ATIVO e PAGO
  await admin.from('profiles').update({
    access_status: 'ATIVO',
    payment_status: 'PAGO',
    last_payment_at: new Date().toISOString(),
    expires_at: data.newExpiresAt || null,
    suspension_reason: null,
    updated_at: new Date().toISOString(),
  }).eq('id', profileId);

  await logAudit(adminEmail, 'REGISTER_PAYMENT', email, profileId, undefined, {
    amount: data.amount,
    paymentMethod: data.paymentMethod,
  });

  revalidatePath('/usuarios');
  return { success: true, message: 'Pagamento registrado com sucesso!' };
}

// ─────────────────────────────────────────────
// Excluir usuário DEFINITIVAMENTE (ação protegida)
// ─────────────────────────────────────────────
export async function deleteUser(
  profileId: string,
  authUid: string,
  email: string,
  confirmationText: string
): Promise<ActionResult> {
  if (confirmationText !== 'EXCLUIR DEFINITIVAMENTE') {
    return {
      success: false,
      error: 'Digite "EXCLUIR DEFINITIVAMENTE" para confirmar a exclusão.',
    };
  }

  const admin = createAdminSupabase();
  const adminEmail = await getAdminEmail();

  // Log antes de excluir
  const { data: prev } = await admin.from('profiles').select('*').eq('id', profileId).single();
  await logAudit(adminEmail, 'DELETE_USER', email, profileId, prev as Record<string, unknown>, undefined, 'Exclusão definitiva solicitada pelo admin');

  // Excluir do Auth
  const { error } = await admin.auth.admin.deleteUser(authUid);

  if (error) {
    return { success: false, error: `Erro ao excluir usuário do Auth: ${error.message}` };
  }

  // Excluir o perfil da tabela profiles explicitamente, já que não há cascade automático
  const { error: profileError } = await admin.from('profiles').delete().eq('id', profileId);

  if (profileError) {
    return { success: false, error: `Erro ao excluir perfil no banco de dados: ${profileError.message}` };
  }

  revalidatePath('/usuarios');
  return { success: true, message: `Usuário ${email} excluído definitivamente.` };
}

// ─────────────────────────────────────────────
// Buscar todos os usuários (para tabela)
// ─────────────────────────────────────────────
export async function getUsers() {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from('profiles')
    .select('*')
    .neq('role', 'SUPER_ADMIN')
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// Buscar usuário por ID
// ─────────────────────────────────────────────
export async function getUserById(id: string) {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from('profiles')
    .select('*, billing_records(*)')
    .eq('id', id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ─────────────────────────────────────────────
// Buscar estatísticas do dashboard
// ─────────────────────────────────────────────
export async function getDashboardStats() {
  const admin = createAdminSupabase();
  const { data: users, error } = await admin
    .from('profiles')
    .select('plan, access_status, payment_status, monthly_amount, expires_at')
    .neq('role', 'SUPER_ADMIN');

  if (error) throw new Error(error.message);

  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter((u) => u.access_status === 'ATIVO').length,
    suspendedUsers: users.filter((u) => ['SUSPENSO', 'CANCELADO'].includes(u.access_status)).length,
    pausedUsers: users.filter((u) => u.access_status === 'PAUSADO').length,
    defaulterUsers: users.filter((u) => u.payment_status === 'VENCIDO').length,
    expiringUsers: users.filter((u) => {
      if (!u.expires_at) return false;
      const exp = new Date(u.expires_at);
      return exp > now && exp <= sevenDaysFromNow;
    }).length,
    starterCount: users.filter((u) => u.plan === 'STARTER').length,
    profissionalCount: users.filter((u) => u.plan === 'PROFISSIONAL').length,
    enterpriseCount: users.filter((u) => u.plan === 'ENTERPRISE').length,
    monthlyRevenue: users
      .filter((u) => u.access_status === 'ATIVO' && u.monthly_amount)
      .reduce((acc, u) => acc + (parseFloat(u.monthly_amount) || 0), 0),
  };

  return stats;
}

// ─────────────────────────────────────────────
// Buscar logs de auditoria
// ─────────────────────────────────────────────
export async function getAuditLogs(limit = 100) {
  const admin = createAdminSupabase();
  const { data, error } = await admin
    .from('admin_audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);
  return data;
}
