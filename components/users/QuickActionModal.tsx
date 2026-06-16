'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { X, AlertTriangle, Loader2 } from 'lucide-react';
import type { UserProfile } from '@/types';
import {
  suspendUser,
  pauseUser,
  reactivateUser,
  cancelUser,
  registerPayment,
} from '@/actions/users';
import { useRouter } from 'next/navigation';

interface Props {
  type: 'suspend' | 'activate' | 'pause' | 'cancel' | 'payment';
  user: UserProfile;
  onClose: () => void;
}

const titles: Record<Props['type'], string> = {
  suspend: 'Suspender Acesso',
  activate: 'Reativar Acesso',
  pause: 'Pausar Acesso',
  cancel: 'Cancelar Acesso',
  payment: 'Registrar Pagamento',
};

const descriptions: Record<Props['type'], string> = {
  suspend: 'O usuário não conseguirá mais acessar o LeadFlowPro. Esta ação fica registrada no log.',
  activate: 'O acesso do usuário será restaurado com o status do plano ativo.',
  pause: 'O acesso será temporariamente pausado. O usuário não conseguirá fazer login.',
  cancel: 'O acesso será cancelado. O histórico financeiro será preservado.',
  payment: 'Registre um pagamento manual. O acesso será reativado automaticamente.',
};

export function QuickActionModal({ type, user, onClose }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [reason, setReason] = useState('');
  const [newExpiresAt, setNewExpiresAt] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  async function handleConfirm() {
    startTransition(async () => {
      let result;

      if (type === 'suspend') {
        result = await suspendUser(user.id, user.email, reason || undefined);
      } else if (type === 'activate') {
        result = await reactivateUser(user.id, user.email, newExpiresAt || undefined);
      } else if (type === 'pause') {
        result = await pauseUser(user.id, reason || undefined);
      } else if (type === 'cancel') {
        result = await cancelUser(user.id, reason || undefined);
      } else if (type === 'payment') {
        if (!amount || parseFloat(amount) <= 0) {
          toast.error('Informe o valor do pagamento.');
          return;
        }
        result = await registerPayment(user.id, user.email, {
          amount: parseFloat(amount),
          paymentMethod: paymentMethod || undefined,
          newExpiresAt: newExpiresAt || undefined,
        });
      }

      if (result?.success) {
        toast.success(result.message || 'Ação realizada com sucesso!');
        onClose();
        router.refresh();
      } else {
        toast.error(result?.error || 'Erro ao realizar ação.');
      }
    });
  }

  const isDangerous = ['suspend', 'cancel'].includes(type);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#2d3148]">
          <div className="flex items-center gap-3">
            {isDangerous && (
              <div className="p-2 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-4 h-4 text-red-400" />
              </div>
            )}
            <div>
              <h3 className="text-white font-semibold">{titles[type]}</h3>
              <p className="text-slate-400 text-xs mt-0.5">{user.name} — {user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-slate-400 text-sm">{descriptions[type]}</p>

          {(type === 'suspend' || type === 'pause' || type === 'cancel') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Motivo (opcional)
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
                rows={3}
                placeholder="Ex: Inadimplência desde março/2026"
              />
            </div>
          )}

          {(type === 'activate' || type === 'payment') && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Novo vencimento (opcional)
              </label>
              <input
                type="date"
                value={newExpiresAt}
                onChange={(e) => setNewExpiresAt(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>
          )}

          {type === 'payment' && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Valor pago (R$) *
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                  placeholder="0,00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Forma de pagamento (opcional)
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full bg-[#0f1117] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                >
                  <option value="">Selecione...</option>
                  <option value="PIX">PIX</option>
                  <option value="Cartão de Crédito">Cartão de Crédito</option>
                  <option value="Boleto">Boleto</option>
                  <option value="Transferência">Transferência</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            disabled={isPending}
            className="flex-1 px-4 py-2.5 border border-white/10 text-slate-300 hover:text-white rounded-xl text-sm font-medium transition-all hover:border-white/20"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending}
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/20'
                : type === 'payment'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20'
                : 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {titles[type]}
          </button>
        </div>
      </div>
    </div>
  );
}
