'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  UserX, UserCheck, Pause, Ban, KeyRound, Trash2, DollarSign
} from 'lucide-react';
import { QuickActionModal } from './QuickActionModal';
import { changeUserPassword, deleteUser } from '@/actions/users';
import type { UserProfile } from '@/types';

interface Props {
  user: any;
}

export function UserDetailActions({ user }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modal, setModal] = useState<'suspend' | 'activate' | 'pause' | 'cancel' | 'payment' | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const profile: UserProfile = {
    id: user.id,
    authUid: user.auth_uid,
    name: user.name,
    email: user.email,
    role: user.role,
    plan: user.plan,
    accessStatus: user.access_status,
    paymentStatus: user.payment_status,
    monthlyAmount: user.monthly_amount ? parseFloat(user.monthly_amount) : null,
    paymentMethod: user.payment_method,
    expiresAt: user.expires_at,
    lastPaymentAt: user.last_payment_at,
    nextBillingAt: user.next_billing_at,
    internalNotes: user.internal_notes,
    suspensionReason: user.suspension_reason,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  };

  function handlePasswordChange() {
    if (!newPassword || newPassword.length < 6) {
      toast.error('A senha deve ter ao menos 6 caracteres.');
      return;
    }
    startTransition(async () => {
      const result = await changeUserPassword(user.auth_uid, user.email, newPassword);
      if (result.success) {
        toast.success('Senha alterada com sucesso!');
        setShowPasswordForm(false);
        setNewPassword('');
      } else {
        toast.error(result.error || 'Erro ao alterar senha.');
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteUser(user.id, user.auth_uid, user.email, deleteConfirmText);
      if (result.success) {
        toast.success('Usuário excluído.');
        router.push('/usuarios');
      } else {
        toast.error(result.error || 'Erro ao excluir.');
      }
    });
  }

  const isActive = ['ATIVO', 'EM_TESTE'].includes(user.access_status);

  return (
    <>
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-4">Ações</h3>
        <div className="flex flex-wrap gap-3">
          {isActive ? (
            <>
              <button onClick={() => setModal('suspend')}
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 rounded-xl text-sm font-medium transition-all">
                <UserX className="w-4 h-4" /> Suspender
              </button>
              <button onClick={() => setModal('pause')}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/20 rounded-xl text-sm font-medium transition-all">
                <Pause className="w-4 h-4" /> Pausar
              </button>
            </>
          ) : (
            <button onClick={() => setModal('activate')}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 text-green-400 hover:bg-green-500/20 rounded-xl text-sm font-medium transition-all">
              <UserCheck className="w-4 h-4" /> Reativar
            </button>
          )}

          <button onClick={() => setModal('payment')}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 rounded-xl text-sm font-medium transition-all">
            <DollarSign className="w-4 h-4" /> Registrar Pagamento
          </button>

          <button onClick={() => setShowPasswordForm(!showPasswordForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500/20 rounded-xl text-sm font-medium transition-all">
            <KeyRound className="w-4 h-4" /> Alterar Senha
          </button>

          <button onClick={() => setModal('cancel')}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500/10 border border-slate-500/20 text-slate-400 hover:bg-slate-500/20 rounded-xl text-sm font-medium transition-all">
            <Ban className="w-4 h-4" /> Cancelar Acesso
          </button>

          <button onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-900/20 border border-red-800/30 text-red-500 hover:bg-red-900/30 rounded-xl text-sm font-medium transition-all ml-auto">
            <Trash2 className="w-4 h-4" /> Excluir Definitivamente
          </button>
        </div>

        {/* Mudar senha inline */}
        {showPasswordForm && (
          <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/15 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-blue-300">Nova Senha</p>
            <div className="flex gap-3">
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
              <button onClick={handlePasswordChange} disabled={isPending}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                Salvar
              </button>
            </div>
          </div>
        )}

        {/* Confirmar exclusão */}
        {showDeleteConfirm && (
          <div className="mt-4 p-4 bg-red-900/10 border border-red-500/20 rounded-xl space-y-3">
            <p className="text-sm font-semibold text-red-400">⚠️ Exclusão Definitiva — Isso não pode ser desfeito</p>
            <p className="text-xs text-slate-400">Digite <strong className="text-white">EXCLUIR DEFINITIVAMENTE</strong> para confirmar:</p>
            <div className="flex gap-3">
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="EXCLUIR DEFINITIVAMENTE"
                className="flex-1 bg-white/5 border border-red-500/20 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none"
              />
              <button onClick={handleDelete} disabled={isPending}
                className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50">
                Excluir
              </button>
              <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(''); }}
                className="px-4 py-2.5 border border-white/10 text-slate-400 rounded-xl text-sm transition-all hover:border-white/20">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <QuickActionModal
          type={modal}
          user={profile}
          onClose={() => { setModal(null); router.refresh(); }}
        />
      )}
    </>
  );
}
