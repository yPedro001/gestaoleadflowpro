'use server';

import { createAdminSupabase } from '@/lib/supabase/server';
import { SupportTicket, TicketStatus, TicketPriority } from '@/types';
import { revalidatePath } from 'next/cache';
import { checkAdminAccess } from '@/actions/auth';

export async function getAdminTickets() {
  const { isAuthorized } = await checkAdminAccess();
  if (!isAuthorized) throw new Error('Não autorizado');

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      profile:profiles(*)
    `)
    .order('is_read_by_admin', { ascending: true }) // unread first
    .order('last_message_at', { ascending: false });

  if (error) {
    console.error('Error fetching tickets:', error);
    return [];
  }

  return data as SupportTicket[];
}

export async function getAdminTicketDetails(id: string) {
  const { isAuthorized } = await checkAdminAccess();
  if (!isAuthorized) throw new Error('Não autorizado');

  const supabase = createAdminSupabase();
  const { data, error } = await supabase
    .from('support_tickets')
    .select(`
      *,
      profile:profiles(*),
      messages:support_ticket_messages(*)
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching ticket details:', error);
    throw new Error('Chamado não encontrado');
  }

  // Marcar como lido pelo admin ao abrir
  if (!data.is_read_by_admin) {
    await supabase.from('support_tickets').update({ is_read_by_admin: true }).eq('id', id);
  }

  // Ordenar mensagens
  if (data.messages) {
    data.messages.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }

  return data as SupportTicket;
}

export async function adminReplyTicket(ticketId: string, message: string, newStatus?: TicketStatus, newPriority?: TicketPriority) {
  const { isAuthorized, user } = await checkAdminAccess();
  if (!isAuthorized) throw new Error('Não autorizado');

  const supabase = createAdminSupabase();
  const { data: adminProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_uid', user?.id)
    .maybeSingle();
  
  // Create message
  const { error: msgError } = await supabase
    .from('support_ticket_messages')
    .insert({
      ticket_id: ticketId,
      sender_type: 'ADMIN',
      sender_profile_id: adminProfile?.id ?? null,
      message,
    });

  if (msgError) throw msgError;

  // Update ticket
  const updateData: any = {
    is_read_by_customer: false,
    is_read_by_admin: true,
    last_message_at: new Date().toISOString(),
    status: newStatus || 'RESPONDIDO',
  };

  if (newPriority) {
    updateData.priority = newPriority;
  }

  const { error: updateError } = await supabase
    .from('support_tickets')
    .update(updateData)
    .eq('id', ticketId);

  if (updateError) throw updateError;

  const { data: ticket } = await supabase.from('support_tickets').select('profile_id').eq('id', ticketId).single();
  if (ticket) {
    const { error: notifError } = await supabase.from('notifications').insert({
      profile_id: ticket.profile_id,
      title: 'Nova Resposta no Suporte',
      message: `A equipe do LeadFlowPro respondeu ao seu chamado.`,
      type: 'TICKET_UPDATE',
      is_read: false
    });
    if (notifError) console.error("Could not send notification:", notifError);
  }

  revalidatePath('/chamados');
  revalidatePath(`/chamados/${ticketId}`);
}

export async function updateTicketStatus(ticketId: string, status: TicketStatus, priority?: TicketPriority) {
  const { isAuthorized } = await checkAdminAccess();
  if (!isAuthorized) throw new Error('Não autorizado');

  const supabase = createAdminSupabase();
  const updateData: any = {
    status,
    is_read_by_customer: false, 
  };

  if (priority) {
    updateData.priority = priority;
  }

  if (status === 'FECHADO' || status === 'RESOLVIDO') {
    updateData.closed_at = new Date().toISOString();
  } else {
    updateData.closed_at = null;
  }

  const { error } = await supabase
    .from('support_tickets')
    .update(updateData)
    .eq('id', ticketId);

  if (error) throw error;

  revalidatePath('/chamados');
  revalidatePath(`/chamados/${ticketId}`);
}
