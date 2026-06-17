'use client';

import { useTransition, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { updateUser } from '@/actions/users';
import { Save, Loader2 } from 'lucide-react';

interface Props {
  user: any;
}

export function EditUserForm({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [form, setForm] = useState({
    name: user.name || '',
    plan: user.plan || 'STARTER',
    accessStatus: user.access_status || 'EM_TESTE',
    paymentStatus: user.payment_status || 'EM_TESTE',
    monthlyAmount: user.monthly_amount ? String(user.monthly_amount) : '',
    paymentMethod: user.payment_method || '',
    expiresAt: user.expires_at ? user.expires_at.split('T')[0] : '',
    lastPaymentAt: user.last_payment_at ? user.last_payment_at.split('T')[0] : '',
    nextBillingAt: user.next_billing_at ? user.next_billing_at.split('T')[0] : '',
    internalNotes: user.internal_notes || '',
    suspensionReason: user.suspension_reason || '',
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateUser(user.id, {
        name: form.name,
        plan: form.plan as any,
        accessStatus: form.accessStatus as any,
        paymentStatus: form.paymentStatus as any,
        monthlyAmount: form.monthlyAmount ? parseFloat(form.monthlyAmount) : null,
        paymentMethod: form.paymentMethod || null,
        expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
        lastPaymentAt: form.lastPaymentAt ? new Date(form.lastPaymentAt).toISOString() : null,
        nextBillingAt: form.nextBillingAt ? new Date(form.nextBillingAt).toISOString() : null,
        internalNotes: form.internalNotes || null,
        suspensionReason: form.suspensionReason || null,
      });

      if (result.success) {
        toast.success('Dados atualizados com sucesso!');
        router.refresh();
      } else {
        toast.error(result.error || 'Erro ao salvar.');
      }
    });
  }

  const inputClass = "w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm";
  const labelClass = "block text-sm font-semibold text-slate-300 mb-2";
  const selectClass = "w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all text-sm";

  return (
    <form onSubmit={handleSubmit} className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6 space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Nome Completo *</label>
          <input name="name" type="text" required value={form.name} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>E-mail</label>
          <input type="email" value={user.email} disabled className={`${inputClass} opacity-50 cursor-not-allowed`} />
          <p className="text-xs text-slate-600 mt-1">E-mail não pode ser alterado por aqui</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Plano</label>
          <select name="plan" value={form.plan} onChange={handleChange} className={selectClass}>
            <option value="STARTER">Starter</option>
            <option value="PROFISSIONAL">Profissional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status de Acesso</label>
          <select name="accessStatus" value={form.accessStatus} onChange={handleChange} className={selectClass}>
            <option value="ATIVO">Ativo</option>
            <option value="PAUSADO">Pausado</option>
            <option value="SUSPENSO">Suspenso</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="AGUARDANDO_PAGAMENTO">Aguardando Pagamento</option>
            <option value="EM_TESTE">Em Teste</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Status de Pagamento</label>
          <select name="paymentStatus" value={form.paymentStatus} onChange={handleChange} className={selectClass}>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
            <option value="VENCIDO">Vencido</option>
            <option value="EM_TESTE">Em Teste</option>
            <option value="ISENTO">Isento</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Valor Mensal (R$)</label>
          <input name="monthlyAmount" type="number" step="0.01" min="0" value={form.monthlyAmount} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Forma de Pagamento</label>
          <select name="paymentMethod" value={form.paymentMethod} onChange={handleChange} className={selectClass}>
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
          <input name="expiresAt" type="date" value={form.expiresAt} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Último Pagamento</label>
          <input name="lastPaymentAt" type="date" value={form.lastPaymentAt} onChange={handleChange} className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Próxima Cobrança</label>
          <input name="nextBillingAt" type="date" value={form.nextBillingAt} onChange={handleChange} className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>Motivo de Suspensão</label>
        <input name="suspensionReason" type="text" value={form.suspensionReason} onChange={handleChange} placeholder="Preenchido automaticamente ao suspender" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Notas Internas</label>
        <textarea name="internalNotes" rows={3} value={form.internalNotes} onChange={handleChange} className={`${inputClass} resize-none`} />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-amber-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
        {isPending ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </form>
  );
}
