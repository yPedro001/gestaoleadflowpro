import type { AccessStatus, PaymentStatus, UserPlan } from '@/types';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: AccessStatus | PaymentStatus | UserPlan;
  type: 'access' | 'payment' | 'plan';
}

const accessColors: Record<AccessStatus, string> = {
  ATIVO: 'bg-green-500/15 text-green-400 border-green-500/20',
  PAUSADO: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  SUSPENSO: 'bg-red-500/15 text-red-400 border-red-500/20',
  CANCELADO: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
  AGUARDANDO_PAGAMENTO: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  EM_TESTE: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
};

const paymentColors: Record<PaymentStatus, string> = {
  PAGO: 'bg-green-500/15 text-green-400 border-green-500/20',
  PENDENTE: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  VENCIDO: 'bg-red-500/15 text-red-400 border-red-500/20',
  EM_TESTE: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  ISENTO: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
  CANCELADO: 'bg-slate-500/15 text-slate-400 border-slate-500/20',
};

const planColors: Record<UserPlan, string> = {
  STARTER: 'bg-slate-500/15 text-slate-300 border-slate-500/20',
  PROFISSIONAL: 'bg-blue-500/15 text-blue-300 border-blue-500/20',
  ENTERPRISE: 'bg-amber-500/15 text-amber-300 border-amber-500/20',
};

const accessLabels: Record<AccessStatus, string> = {
  ATIVO: 'Ativo',
  PAUSADO: 'Pausado',
  SUSPENSO: 'Suspenso',
  CANCELADO: 'Cancelado',
  AGUARDANDO_PAGAMENTO: 'Aguard. Pag.',
  EM_TESTE: 'Em Teste',
};

const paymentLabels: Record<PaymentStatus, string> = {
  PAGO: 'Pago',
  PENDENTE: 'Pendente',
  VENCIDO: 'Vencido',
  EM_TESTE: 'Em Teste',
  ISENTO: 'Isento',
  CANCELADO: 'Cancelado',
};

const planLabels: Record<UserPlan, string> = {
  STARTER: 'Starter',
  PROFISSIONAL: 'Profissional',
  ENTERPRISE: 'Enterprise',
};

export function StatusBadge({ status, type }: StatusBadgeProps) {
  let colorClass = '';
  let label = status;

  if (type === 'access') {
    colorClass = accessColors[status as AccessStatus] ?? '';
    label = accessLabels[status as AccessStatus] ?? status;
  } else if (type === 'payment') {
    colorClass = paymentColors[status as PaymentStatus] ?? '';
    label = paymentLabels[status as PaymentStatus] ?? status;
  } else if (type === 'plan') {
    colorClass = planColors[status as UserPlan] ?? '';
    label = planLabels[status as UserPlan] ?? status;
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colorClass
      )}
    >
      {label}
    </span>
  );
}
