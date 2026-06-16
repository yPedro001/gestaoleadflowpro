'use server';

import { redirect } from 'next/navigation';
import { createServerSupabase } from '@/lib/supabase/server';

export type AuthResult = {
  success: boolean;
  error?: string;
};

export async function adminLogin(
  _prevState: AuthResult | null,
  formData: FormData
): Promise<AuthResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Preencha e-mail e senha.' };
  }

  // Verifica se o e-mail está na lista de admins autorizados
  const adminEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase());

  if (!adminEmails.includes(email.toLowerCase())) {
    return {
      success: false,
      error: 'Acesso negado. Este painel é restrito a administradores autorizados.',
    };
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: 'E-mail ou senha incorretos.' };
  }

  // Verifica role no banco
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('email', email)
    .single();

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    await supabase.auth.signOut();
    return {
      success: false,
      error: 'Acesso negado. Você não possui permissão de administrador.',
    };
  }

  redirect('/dashboard');
}

export async function adminLogout() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect('/login');
}

export async function checkAdminAccess() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { isAuthorized: false, user: null };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('auth_uid', user.id)
    .single();

  if (!profile || profile.role !== 'SUPER_ADMIN') {
    return { isAuthorized: false, user: null };
  }

  return { isAuthorized: true, user };
}
