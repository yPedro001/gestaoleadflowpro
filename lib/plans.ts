// Configuração centralizada dos planos do LeadFlowPro
// Altere aqui para atualizar limites de todos os usuários

export type PlanKey = 'STARTER' | 'PROFISSIONAL' | 'ENTERPRISE';

export interface PlanConfig {
  key: PlanKey;
  label: string;
  description: string;
  maxLeads: number | null;      // null = ilimitado
  maxOperators: number | null;  // null = ilimitado
  maxCadenceStages: number | null;
  canExportCsv: boolean;
  canUseAnalytics: boolean;
  canUseAgenda: boolean;
  canUseTemplateVariables: boolean;
  canUseMultiOperators: boolean;
  color: string;
  badgeColor: string;
}

export const PLANS: Record<PlanKey, PlanConfig> = {
  STARTER: {
    key: 'STARTER',
    label: 'Starter',
    description: 'Plano básico para usuários iniciantes',
    maxLeads: 500,
    maxOperators: 1,
    maxCadenceStages: 3,
    canExportCsv: false,
    canUseAnalytics: false,
    canUseAgenda: false,
    canUseTemplateVariables: false,
    canUseMultiOperators: false,
    color: '#64748b',
    badgeColor: 'bg-slate-500/20 text-slate-300',
  },
  PROFISSIONAL: {
    key: 'PROFISSIONAL',
    label: 'Profissional',
    description: 'Plano intermediário para equipes que precisam escalar',
    maxLeads: 5000,
    maxOperators: 5,
    maxCadenceStages: 6,
    canExportCsv: true,
    canUseAnalytics: true,
    canUseAgenda: true,
    canUseTemplateVariables: true,
    canUseMultiOperators: true,
    color: '#3b82f6',
    badgeColor: 'bg-blue-500/20 text-blue-300',
  },
  ENTERPRISE: {
    key: 'ENTERPRISE',
    label: 'Enterprise',
    description: 'Plano avançado para operações maiores',
    maxLeads: null,
    maxOperators: null,
    maxCadenceStages: null,
    canExportCsv: true,
    canUseAnalytics: true,
    canUseAgenda: true,
    canUseTemplateVariables: true,
    canUseMultiOperators: true,
    color: '#f59e0b',
    badgeColor: 'bg-amber-500/20 text-amber-300',
  },
};

export function getPlanConfig(plan: PlanKey): PlanConfig {
  return PLANS[plan];
}

export function getPlanLabel(plan: PlanKey): string {
  return PLANS[plan]?.label ?? plan;
}
