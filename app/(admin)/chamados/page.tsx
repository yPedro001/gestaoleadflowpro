import { getAdminTickets } from '@/actions/support';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LifeBuoy, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata = { title: 'Chamados | GestãoLeadFlowPro' };
export const dynamic = 'force-dynamic';

const formatSafeDate = (dateStr: string | null | undefined, formatStr: string) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return format(d, formatStr, { locale: ptBR });
  } catch {
    return 'N/A';
  }
};

export default async function ChamadosPage() {
  const tickets = await getAdminTickets();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-1 rounded-md text-xs font-medium">Aberto</span>;
      case 'ATENDIMENTO': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md text-xs font-medium">Em Atendimento</span>;
      case 'RESPONDIDO': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-1 rounded-md text-xs font-medium">Respondido</span>;
      case 'AGUARDANDO_CLIENTE': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-1 rounded-md text-xs font-medium">Aguard. Cliente</span>;
      case 'RESOLVIDO': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-2 py-1 rounded-md text-xs font-medium">Resolvido</span>;
      case 'FECHADO': return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-2 py-1 rounded-md text-xs font-medium">Fechado</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'BAIXA': return <span className="text-slate-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Baixa</span>;
      case 'NORMAL': return <span className="text-blue-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Normal</span>;
      case 'ALTA': return <span className="text-red-400 text-xs font-medium flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Alta</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-amber-500" />
            Gestão de Chamados
          </h1>
          <p className="text-slate-400 mt-1">Acompanhe e responda os tickets de suporte dos clientes.</p>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="bg-[#13161f] border border-[#2d3148] rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-[#1a1f2e] rounded-full flex items-center justify-center mx-auto mb-4">
            <LifeBuoy className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum chamado</h3>
          <p className="text-slate-400">Não há chamados de suporte no momento.</p>
        </div>
      ) : (
        <div className="bg-[#13161f] border border-[#2d3148] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#1a1f2e] border-b border-[#2d3148] text-slate-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Chamado</th>
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Status / Prioridade</th>
                  <th className="px-6 py-4 font-medium">Última Atualização</th>
                  <th className="px-6 py-4 font-medium text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2d3148]">
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${!ticket.is_read_by_admin ? 'bg-amber-500/10 text-amber-400' : 'bg-[#2d3148] text-slate-400'}`}>
                          <LifeBuoy className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-white font-medium mb-1 line-clamp-1">{ticket.title}</p>
                          <p className="text-slate-400 text-xs flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> {ticket.category}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white font-medium">{ticket.profile?.name || 'Desconhecido'}</p>
                      <p className="text-slate-400 text-xs">{ticket.profile?.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        {getStatusBadge(ticket.status)}
                        {getPriorityBadge(ticket.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-slate-300 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-slate-500" />
                        {formatSafeDate(ticket.last_message_at, "dd MMM, HH:mm")}
                      </p>
                      {!ticket.is_read_by_admin && (
                        <span className="inline-block mt-1 bg-amber-500 text-[#0f1219] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                          Novo
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/chamados/${ticket.id}`}
                        className="inline-flex items-center justify-center px-4 py-2 bg-[#2d3148] hover:bg-[#3d425c] text-white rounded-lg transition-colors font-medium text-xs"
                      >
                        Abrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
