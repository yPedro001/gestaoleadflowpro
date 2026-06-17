import { getAdminTicketDetails, adminReplyTicket, updateTicketStatus } from '@/actions/support';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { LifeBuoy, ArrowLeft, Send, CheckCircle2, User, ShieldCheck, Mail, Calendar, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { TicketPriority, TicketStatus } from '@/types';

export const metadata = { title: 'Detalhes do Chamado | GestãoLeadFlowPro' };
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

const ticketStatuses = ['ABERTO', 'ATENDIMENTO', 'RESPONDIDO', 'AGUARDANDO_CLIENTE', 'RESOLVIDO', 'FECHADO'] as const;
const ticketPriorities = ['BAIXA', 'NORMAL', 'ALTA'] as const;

function parseTicketStatus(value: FormDataEntryValue | null): TicketStatus | undefined {
  return typeof value === 'string' && ticketStatuses.includes(value as TicketStatus)
    ? (value as TicketStatus)
    : undefined;
}

function parseTicketPriority(value: FormDataEntryValue | null): TicketPriority | undefined {
  return typeof value === 'string' && ticketPriorities.includes(value as TicketPriority)
    ? (value as TicketPriority)
    : undefined;
}

export default async function ChamadoAdminDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ticket = await getAdminTicketDetails(id).catch(() => null);

  if (!ticket) {
    notFound();
  }

  async function handleReply(formData: FormData) {
    'use server';
    const message = formData.get('message') as string;
    const status = parseTicketStatus(formData.get('status'));
    const priority = parseTicketPriority(formData.get('priority'));
    
    await adminReplyTicket(id, message, status, priority);
  }

  async function handleStatusChange(formData: FormData) {
    'use server';
    const status = parseTicketStatus(formData.get('status'));
    if (!status) return;
    await updateTicketStatus(id, status);
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ABERTO': return <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Aberto</span>;
      case 'ATENDIMENTO': return <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Em Atendimento</span>;
      case 'RESPONDIDO': return <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Respondido</span>;
      case 'AGUARDANDO_CLIENTE': return <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Aguardando Cliente</span>;
      case 'RESOLVIDO': return <span className="bg-slate-500/10 text-slate-400 border border-slate-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Resolvido</span>;
      case 'FECHADO': return <span className="bg-slate-800 text-slate-500 border border-slate-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Fechado</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/chamados" 
            className="p-2 bg-[#13161f] border border-[#2d3148] hover:bg-[#1a1f2e] rounded-xl text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-white">Chamado #{ticket.id.slice(0, 8)}</h1>
              {getStatusBadge(ticket.status)}
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {ticket.category}
              <span className="text-slate-600">•</span>
              <AlertCircle className="w-4 h-4" /> Prioridade: {ticket.priority}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Painel Esquerdo: Mensagens */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#13161f] border border-[#2d3148] rounded-2xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">{ticket.title}</h2>
            
            <div className="space-y-6 mb-8">
              {/* Mensagem Original */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 bg-[#1a1f2e] border border-[#2d3148] rounded-2xl p-4 rounded-tl-none">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-slate-200">{ticket.profile?.name} (Cliente)</span>
                    <span className="text-xs text-slate-500">
                      {formatSafeDate(ticket.created_at, "dd MMM yyyy, HH:mm")}
                    </span>
                  </div>
                  <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{ticket.description}</p>
                </div>
              </div>

              {/* Respostas */}
              {ticket.messages?.map((msg: any) => (
                <div key={msg.id} className="flex gap-4">
                  {msg.sender_type === 'ADMIN' ? (
                    <>
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 border border-amber-500/30">
                        <ShieldCheck className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1 bg-amber-950/10 border border-amber-900/30 rounded-2xl p-4 rounded-tl-none">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-amber-400">Você (Admin)</span>
                          <span className="text-xs text-amber-500/50">
                            {formatSafeDate(msg.created_at, "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                        <User className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 bg-[#1a1f2e] border border-[#2d3148] rounded-2xl p-4 rounded-tl-none">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-semibold text-slate-200">{ticket.profile?.name} (Cliente)</span>
                          <span className="text-xs text-slate-500">
                            {formatSafeDate(msg.created_at, "dd MMM yyyy, HH:mm")}
                          </span>
                        </div>
                        <p className="text-slate-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Form de Resposta Admin */}
            <form action={handleReply} className="border-t border-[#2d3148] pt-6 space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Sua Resposta</label>
                <textarea 
                  name="message" 
                  id="message" 
                  required 
                  rows={4}
                  placeholder="Escreva a resposta para o cliente..." 
                  className="w-full bg-[#1a1f2e] border border-[#2d3148] rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500/50 transition-all resize-y"
                ></textarea>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="status" className="block text-xs font-medium text-slate-400 mb-1">Alterar Status para:</label>
                  <select name="status" defaultValue="RESPONDIDO" className="w-full bg-[#1a1f2e] border border-[#2d3148] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                    <option value="RESPONDIDO">Respondido</option>
                    <option value="AGUARDANDO_CLIENTE">Aguardando Cliente</option>
                    <option value="RESOLVIDO">Resolvido</option>
                    <option value="FECHADO">Fechado</option>
                    <option value="ATENDIMENTO">Em Atendimento</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label htmlFor="priority" className="block text-xs font-medium text-slate-400 mb-1">Prioridade:</label>
                  <select name="priority" defaultValue={ticket.priority} className="w-full bg-[#1a1f2e] border border-[#2d3148] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500/50">
                    <option value="BAIXA">Baixa</option>
                    <option value="NORMAL">Normal</option>
                    <option value="ALTA">Alta</option>
                  </select>
                </div>
                <div className="flex-1 flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-600 text-[#0f1219] font-bold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2 h-9"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Resposta
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Painel Direito: Infos do Cliente */}
        <div className="space-y-6">
          <div className="bg-[#13161f] border border-[#2d3148] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-amber-500" />
              Dados do Cliente
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 mb-1">Nome</p>
                <p className="text-sm text-white font-medium">{ticket.profile?.name}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/> E-mail</p>
                <p className="text-sm text-slate-300 break-all">{ticket.profile?.email}</p>
              </div>
              <div className="flex items-center justify-between border-t border-[#2d3148] pt-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Plano</p>
                  <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded text-xs font-bold">
                    {ticket.profile?.plan}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Acesso</p>
                  <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-xs font-bold">
                    {ticket.profile?.access_status || 'N/A'}
                  </span>
                </div>
              </div>
              <div className="border-t border-[#2d3148] pt-4">
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Cliente desde</p>
                <p className="text-sm text-slate-300">
                  {formatSafeDate(ticket.profile?.created_at, "dd MMM yyyy")}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#13161f] border border-[#2d3148] rounded-2xl p-6">
            <h3 className="font-bold text-white mb-4">Ações Rápidas</h3>
            <form action={handleStatusChange} className="space-y-3">
              <button 
                type="submit" 
                name="status" 
                value="ATENDIMENTO"
                className="w-full text-left px-4 py-2 rounded-lg bg-[#1a1f2e] hover:bg-[#2d3148] text-slate-300 text-sm transition-colors border border-transparent hover:border-amber-500/30"
              >
                Marcar como Em Atendimento
              </button>
              <button 
                type="submit" 
                name="status" 
                value="RESOLVIDO"
                className="w-full text-left px-4 py-2 rounded-lg bg-[#1a1f2e] hover:bg-[#2d3148] text-emerald-400 text-sm transition-colors border border-transparent hover:border-emerald-500/30"
              >
                Marcar como Resolvido
              </button>
              <button 
                type="submit" 
                name="status" 
                value="FECHADO"
                className="w-full text-left px-4 py-2 rounded-lg bg-[#1a1f2e] hover:bg-slate-800 text-slate-400 text-sm transition-colors border border-transparent hover:border-slate-600"
              >
                Fechar Chamado
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
}
