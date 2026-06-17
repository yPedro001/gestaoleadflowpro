import { getUserById } from '@/actions/users';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, formatDateTime, formatCurrency } from '@/lib/utils';
import { UserDetailActions } from '@/components/users/UserDetailActions';
import { EditUserForm } from '@/components/users/EditUserForm';

export const dynamic = 'force-dynamic';

export default async function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  let user: any;
  try {
    const { id } = await params;
    user = await getUserById(id);
  } catch {
    notFound();
  }

  const billingRecords = Array.isArray(user.billing_records) ? user.billing_records : [];

  return (
    <div className="max-w-[1400px] animate-in space-y-6">
      <Link href="/usuarios" className="flex w-fit items-center gap-2 text-sm text-slate-400 transition-colors hover:text-white">
        <ArrowLeft className="h-4 w-4" />
        Voltar para Usuarios
      </Link>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(360px,0.9fr)_minmax(520px,1.1fr)]">
        <section className="space-y-6">
          <div className="rounded-2xl border border-[#2d3148] bg-[#1a1d27] p-6">
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.24em] text-amber-400">Gerenciar usuario</p>
                <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                <p className="break-all text-sm text-slate-400">{user.email}</p>
              </div>
              <div className="flex flex-wrap gap-2 sm:flex-col sm:items-end">
                <StatusBadge status={user.plan} type="plan" />
                <StatusBadge status={user.access_status} type="access" />
                <StatusBadge status={user.payment_status} type="payment" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {[
                {
                  label: 'Valor Mensal',
                  value: user.monthly_amount ? formatCurrency(Number(user.monthly_amount)) : '-',
                },
                { label: 'Forma de Pagamento', value: user.payment_method || '-' },
                { label: 'Vencimento', value: formatDate(user.expires_at) },
                { label: 'Ultimo Pagamento', value: formatDate(user.last_payment_at) },
                { label: 'Proxima Cobranca', value: formatDate(user.next_billing_at) },
                { label: 'Criado em', value: formatDateTime(user.created_at) },
                { label: 'Auth UID', value: user.auth_uid ? `${user.auth_uid.slice(0, 8)}...` : '-' },
                { label: 'Role', value: user.role },
              ].map(({ label, value }) => (
                <div key={label} className="rounded-xl bg-white/3 p-3">
                  <p className="mb-1 text-xs text-slate-500">{label}</p>
                  <p className="break-words text-sm font-medium text-white">{value}</p>
                </div>
              ))}
            </div>

            {user.suspension_reason && (
              <div className="mt-4 rounded-xl border border-red-500/15 bg-red-500/5 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-red-400">Motivo da suspensao</p>
                <p className="text-sm text-slate-300">{user.suspension_reason}</p>
              </div>
            )}

            {user.internal_notes && (
              <div className="mt-4 rounded-xl bg-white/3 px-4 py-3">
                <p className="mb-1 text-xs font-semibold text-slate-500">Notas internas</p>
                <p className="whitespace-pre-wrap text-sm text-slate-300">{user.internal_notes}</p>
              </div>
            )}
          </div>

          {billingRecords.length > 0 && (
            <div className="rounded-2xl border border-[#2d3148] bg-[#1a1d27] p-6">
              <h3 className="mb-4 font-semibold text-white">Historico de pagamentos</h3>
              <div className="space-y-3">
                {billingRecords.map((record: any) => (
                  <div key={record.id} className="flex items-center justify-between border-b border-[#2d3148]/50 py-3 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-white">{formatCurrency(Number(record.amount))}</p>
                      <p className="text-xs text-slate-500">{record.payment_method || 'Forma nao informada'} {record.reference_month ? `- ${record.reference_month}` : ''}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">{formatDate(record.paid_at)}</p>
                      <StatusBadge status={record.payment_status} type="payment" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-6">
          <EditUserForm user={user} />
          <UserDetailActions user={user} />
        </section>
      </div>
    </div>
  );
}
