export type UserPlan = 'STARTER' | 'PROFISSIONAL' | 'ENTERPRISE';

export type AccessStatus =
  | 'ATIVO'
  | 'PAUSADO'
  | 'SUSPENSO'
  | 'CANCELADO'
  | 'AGUARDANDO_PAGAMENTO'
  | 'EM_TESTE';

export type PaymentStatus =
  | 'PAGO'
  | 'PENDENTE'
  | 'VENCIDO'
  | 'EM_TESTE'
  | 'ISENTO'
  | 'CANCELADO';

export type UserRole = 'USER' | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  authUid: string;
  name: string;
  email: string;
  role: UserRole;
  plan: UserPlan;
  accessStatus: AccessStatus;
  paymentStatus: PaymentStatus;
  monthlyAmount: number | null;
  paymentMethod: string | null;
  expiresAt: string | null;
  lastPaymentAt: string | null;
  nextBillingAt: string | null;
  internalNotes: string | null;
  suspensionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BillingRecord {
  id: string;
  profileId: string;
  amount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: string | null;
  referenceMonth: string | null;
  paidAt: string | null;
  dueAt: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminAuditLog {
  id: string;
  adminEmail: string;
  targetProfileId: string | null;
  targetEmail: string | null;
  action: string;
  previousData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
  reason: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  suspendedUsers: number;
  defaulterUsers: number;
  expiringUsers: number;
  starterCount: number;
  profissionalCount: number;
  enterpriseCount: number;
  monthlyRevenue: number;
}

export type TicketStatus = 'ABERTO' | 'ATENDIMENTO' | 'RESPONDIDO' | 'AGUARDANDO_CLIENTE' | 'RESOLVIDO' | 'FECHADO';
export type TicketCategory = 'ACESSO' | 'ERRO' | 'DUVIDA' | 'FINANCEIRO' | 'SUGESTAO' | 'OUTRO';
export type TicketPriority = 'BAIXA' | 'NORMAL' | 'ALTA';
export type MessageSenderType = 'CUSTOMER' | 'ADMIN';

export interface SupportTicket {
  id: string;
  profile_id: string;
  category: TicketCategory;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  is_read_by_admin: boolean;
  is_read_by_customer: boolean;
  last_message_at: string;
  closed_at: string | null;
  created_at: string;
  updated_at: string;
  profile?: UserProfile; // Joined profile data
  messages?: SupportTicketMessage[]; // Joined messages
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  sender_type: MessageSenderType;
  sender_profile_id: string | null;
  message: string;
  is_internal_note: boolean;
  created_at: string;
}
