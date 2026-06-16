import Link from 'next/link';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate } from '@/lib/utils';
import type { UserProfile } from '@/types';

interface Props {
  users: UserProfile[];
}

export function RecentUsersTable({ users }: Props) {
  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-semibold">Clientes Recentes</h3>
        <Link href="/usuarios" className="text-amber-400 hover:text-amber-300 text-sm font-medium transition-colors">
          Ver todos →
        </Link>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2d3148]">
              <th className="text-left text-xs font-semibold text-slate-400 pb-3 pr-4">Nome</th>
              <th className="text-left text-xs font-semibold text-slate-400 pb-3 pr-4">Plano</th>
              <th className="text-left text-xs font-semibold text-slate-400 pb-3 pr-4">Acesso</th>
              <th className="text-left text-xs font-semibold text-slate-400 pb-3">Vencimento</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2d3148]/50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-slate-500 text-sm py-8">
                  Nenhum usuário cadastrado
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-white/2 transition-colors">
                  <td className="py-3 pr-4">
                    <Link href={`/usuarios/${u.id}`} className="text-white text-sm font-medium hover:text-amber-400 transition-colors">
                      {u.name}
                    </Link>
                    <p className="text-slate-500 text-xs">{u.email}</p>
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={u.plan} type="plan" />
                  </td>
                  <td className="py-3 pr-4">
                    <StatusBadge status={u.accessStatus} type="access" />
                  </td>
                  <td className="py-3 text-slate-400 text-sm">
                    {formatDate(u.expiresAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
