'use client';

import { useActionState, useEffect } from 'react';
import { createUser, type ActionResult } from '@/actions/users';
import { Loader2, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export function CreateUserForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState<ActionResult | null, FormData>(
    createUser,
    null
  );

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || 'Usuário criado!');
      router.push('/usuarios');
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-slate-300 mb-2";
  const selectClass = "w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm";

  return (
    <form action={formAction} className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome Completo *</label>
          <input name="name" type="text" required placeholder="João Silva" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail *</label>
          <input name="email" type="email" required placeholder="joao@empresa.com" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Senha Inicial *</label>
        <input name="password" type="password" required minLength={6} placeholder="Mínimo 6 caracteres" className={inputClass} />
        <p className="text-xs text-slate-500 mt-1">O cliente usará essa senha para acessar o LeadFlowPro.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Plano *</label>
          <select name="plan" required className={selectClass}>
            <option value="STARTER">Starter</option>
            <option value="PROFISSIONAL">Profissional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status de Acesso *</label>
          <select name="accessStatus" required className={selectClass}>
            <option value="EM_TESTE">Em Teste</option>
            <option value="ATIVO">Ativo</option>
            <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status de Pagamento *</label>
          <select name="paymentStatus" required className={selectClass}>
            <option value="EM_TESTE">Em Teste</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="ISENTO">Isento</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Valor Mensal (R$)</label>
          <input name="monthlyAmount" type="number" step="0.01" min="0" placeholder="0,00" className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Forma de Pagamento</label>
          <select name="paymentMethod" className={selectClass}>
            <option value="">Selecione...</option>
            <option value="PIX">PIX</option>
            <option value="Cartão de Crédito">Cartão de Crédito</option>
            <option value="Boleto">Boleto</option>
            <option value="Transferência">Transferência</option>
            <option value="Outro">Outro</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Vencimento</label>
          <input name="expiresAt" type="date" className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Notas Internas</label>
        <textarea
          name="internalNotes"
          rows={3}
          placeholder="Observações internas sobre este cliente..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {state?.error && !state.success && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm">
          {state.error}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
        {isPending ? 'Criando usuário...' : 'Criar Usuário no LeadFlowPro'}
      </button>
    </form>
  );
}
