import { getAuditLogs } from '@/actions/users';
import { formatDateTime } from '@/lib/utils';
import { FileText } from 'lucide-react';

export const metadata = { title: 'Logs de Auditoria — GestãoLeadFlowPro' };
export const dynamic = 'force-dynamic';

export default async function LogsPage() {
  const logs = await getAuditLogs(200);

  const actionLabels: Record<string, string> = {
    CREATE_USER: '+ Criou usuário',
    UPDATE_USER: '✏ Atualizou usuário',
    CHANGE_PASSWORD: '🔒 Alterou senha',
    SUSPEND_USER: '⏸ Suspendeu',
    REACTIVATE_USER: '✅ Reativou',
    CANCEL_USER: '❌ Cancelou',
    DELETE_USER: '🗑 Excluiu',
    REGISTER_PAYMENT: '💰 Registrou pagamento',
  };

  return (
    <div className="space-y-6 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Logs de Auditoria</h1>
        <p className="text-slate-400 text-sm mt-1">Histórico de todas as ações administrativas</p>
      </div>

      <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl overflow-hidden">
        {logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-500">
            <FileText className="w-12 h-12 mb-3 opacity-30" />
            <p>Nenhum log registrado ainda</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/2">
                <tr className="border-b border-[#2d3148]">
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-4">Ação</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-4">Usuário Afetado</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-4">Admin</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-4">Data/Hora</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-4">Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3148]/50">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-white text-sm font-medium">
                        {actionLabels[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-300 text-sm">{log.target_email ?? '—'}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-400 text-sm">{log.admin_email}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-400 text-sm">{formatDateTime(log.created_at)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-slate-500 text-xs">{log.reason ?? '—'}</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
