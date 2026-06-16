'use client';

import { useActionState } from 'react';
import { adminLogin, type AuthResult } from '@/actions/auth';
import { Loader2, Lock } from 'lucide-react';

export function LoginForm() {
  const [state, formAction, isPending] = useActionState<AuthResult | null, FormData>(
    adminLogin,
    null
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
          E-mail Administrativo
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          placeholder="admin@suaempresa.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
          Senha
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
          placeholder="••••••••"
        />
      </div>

      {state?.error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm font-medium">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <Lock className="w-4 h-4" />
            Acessar Painel
          </>
        )}
      </button>
    </form>
  );
}
