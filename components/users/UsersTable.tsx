'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Settings2, UserX, UserCheck, DollarSign } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { UserProfile } from '@/types';
import { QuickActionModal } from './QuickActionModal';

interface Props {
  initialUsers: UserProfile[];
  initialSearch?: string;
  initialPlan?: string;
  initialAccess?: string;
  initialPayment?: string;
}

export function UsersTable({
  initialUsers,
  initialSearch = '',
  initialPlan = '',
  initialAccess = '',
  initialPayment = '',
}: Props) {
  const [search, setSearch] = useState(initialSearch);
  const [planFilter, setPlanFilter] = useState(initialPlan);
  const [accessFilter, setAccessFilter] = useState(initialAccess);
  const [paymentFilter, setPaymentFilter] = useState(initialPayment);
  const [actionModal, setActionModal] = useState<{
    type: 'suspend' | 'activate' | 'pause' | 'cancel' | 'payment';
    user: UserProfile;
  } | null>(null);

  const filtered = useMemo(() => {
    return initialUsers.filter((u) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchesPlan = !planFilter || u.plan === planFilter;
      const matchesAccess = !accessFilter || u.accessStatus === accessFilter;
      const matchesPayment = !paymentFilter || u.paymentStatus === paymentFilter;
      return matchesSearch && matchesPlan && matchesAccess && matchesPayment;
    });
  }, [initialUsers, search, planFilter, accessFilter, paymentFilter]);

  return (
    <>
      {/* Filtros */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-4">
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
            />
          </div>

          <select
            value={planFilter}
            onChange={(e) => setPlanFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">Todos os planos</option>
            <option value="STARTER">Starter</option>
            <option value="PROFISSIONAL">Profissional</option>
            <option value="ENTERPRISE">Enterprise</option>
          </select>

          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">Todos os acessos</option>
            <option value="ATIVO">Ativo</option>
            <option value="PAUSADO">Pausado</option>
            <option value="SUSPENSO">Suspenso</option>
            <option value="CANCELADO">Cancelado</option>
            <option value="AGUARDANDO_PAGAMENTO">Aguard. Pagamento</option>
            <option value="EM_TESTE">Em Teste</option>
          </select>

          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="">Todos pagamentos</option>
            <option value="PAGO">Pago</option>
            <option value="PENDENTE">Pendente</option>
            <option value="VENCIDO">Vencido</option>
            <option value="EM_TESTE">Em Teste</option>
            <option value="ISENTO">Isento</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Tabela */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/2">
              <tr className="border-b border-[#2d3148]">
                {['Nome / E-mail', 'Plano', 'Acesso', 'Pagamento', 'Vencimento', 'Valor/mês', 'Criado em', 'Ações'].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-slate-400 px-5 py-4 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2d3148]/50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center text-slate-500 text-sm py-12">
                    Nenhum usuário encontrado com os filtros aplicados.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => (
                  <tr key={u.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-4">
                      <p className="text-white text-sm font-medium">{u.name}</p>
                      <p className="text-slate-500 text-xs">{u.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.plan} type="plan" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.accessStatus} type="access" />
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={u.paymentStatus} type="payment" />
                    </td>
                    <td className="px-5 py-4 text-slate-400 text-sm whitespace-nowrap">
                      {formatDate(u.expiresAt)}
                    </td>
                    <td className="px-5 py-4 text-slate-300 text-sm">
                      {u.monthlyAmount
                        ? `R$ ${Number(u.monthlyAmount).toFixed(2).replace('.', ',')}`
                        : '—'}
                    </td>
                    <td className="px-5 py-4 text-slate-500 text-xs whitespace-nowrap">
                      {formatDate(u.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        <Link
                          href={`/usuarios/${u.id}`}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-1.5 text-xs font-semibold text-amber-300 transition-all hover:bg-amber-500/20 hover:text-amber-200"
                          title="Gerenciar usuario"
                        >
                          <Settings2 className="w-4 h-4" />
                          Gerenciar
                        </Link>
                        {u.accessStatus === 'ATIVO' || u.accessStatus === 'EM_TESTE' ? (
                          <button
                            onClick={() => setActionModal({ type: 'suspend', user: u })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                            title="Suspender"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => setActionModal({ type: 'activate', user: u })}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
                            title="Reativar"
                          >
                            <UserCheck className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => setActionModal({ type: 'payment', user: u })}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                          title="Registrar pagamento"
                        >
                          <DollarSign className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 py-3 border-t border-[#2d3148] text-xs text-slate-500">
          Exibindo {filtered.length} de {initialUsers.length} usuário{initialUsers.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modal de ação rápida */}
      {actionModal && (
        <QuickActionModal
          type={actionModal.type}
          user={actionModal.user}
          onClose={() => setActionModal(null)}
        />
      )}
    </>
  );
}
