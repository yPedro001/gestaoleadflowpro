import { getUserById } from '@/actions/users';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { UserDetailActions } from '@/components/users/UserDetailActions';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await getUserById(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in max-w-4xl">
      <div className="flex items-center justify-between">
        <Link href="/usuarios" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Usuários
        </Link>
        <Link
          href={`/usuarios/${user.id}/editar`}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-all"
        >
          <Edit className="w-4 h-4" />
          Editar
        </Link>
      </div>

      {/* Card principal */}
      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            <p className="text-slate-400 text-sm">{user.email}</p>
          </div>
          <div className="flex flex-col gap-2 items-end">
            <StatusBadge status={user.plan} type="plan" />
            <StatusBadge status={user.access_status} type="access" />
            <StatusBadge status={user.payment_status} type="payment" />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[{
            label: 'Valor Mensal',
            value: user.monthly_amount ? formatCurrency(parseFloat(user.monthly_amount)) : '—',
          }, {
            label: 'Forma de Pagamento',
            value: user.payment_method || '—',
          }, {
            label: 'Vencimento',
            value: formatDate(user.expires_at),
          }, {
            label: 'Último Pagamento',
            value: formatDate(user.last_payment_at),
          }, {
            label: 'Próxima Cobrança',
            value: formatDate(user.next_billing_at),
          }, {
            label: 'Criado em',
            value: formatDateTime(user.created_at),
          }, {
            label: 'Auth UID',
            value: user.auth_uid?.slice(0, 8) + '...',
          }, {
            label: 'Role',
            value: user.role,
          }].map(({ label, value }) => (
            <div key={label} className="bg-white/3 rounded-xl p-3">
              <p className="text-xs text-slate-500 mb-1">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          ))}
        </div>

        {user.suspension_reason && (
          <div className="mt-4 bg-red-500/5 border border-red-500/15 rounded-xl px-4 py-3">
            <p className="text-xs text-red-400 font-semibold mb-1">Motivo da Suspensão</p>
            <p className="text-sm text-slate-300">{user.suspension_reason}</p>
          </div>
        )}

        {user.internal_notes && (
          <div className="mt-4 bg-white/3 rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 font-semibold mb-1">Notas Internas</p>
            <p className="text-sm text-slate-300">{user.internal_notes}</p>
          </div>
        )}
      </div>

      {/* Ações */}
      <UserDetailActions user={user} />

      {/* Histórico de pagamentos */}
      {user.billing_records && user.billing_records.length > 0 && (
        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Histórico de Pagamentos</h3>
          <div className="space-y-3">
            {user.billing_records.map((record: any) => (
              <div key={record.id} className="flex items-center justify-between py-3 border-b border-[#2d3148]/50 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{formatCurrency(parseFloat(record.amount))}</p>
                  <p className="text-slate-500 text-xs">{record.payment_method || 'Forma não informada'} • {record.reference_month || ''}</p>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-xs">{formatDate(record.paid_at)}</p>
                  <StatusBadge status={record.payment_status} type="payment" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
