import { getDashboardStats, getUsers } from '@/actions/users';
import { KpiCard } from '@/components/ui/KpiCard';
import { PlanDistributionChart } from '@/components/dashboard/PlanDistributionChart';
import { RecentUsersTable } from '@/components/dashboard/RecentUsersTable';
import {
  Users, UserCheck, UserX, AlertTriangle, Clock,
  TrendingUp, Package, Star, Zap
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

export const metadata = { title: 'Dashboard — GestãoLeadFlowPro' };
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [stats, users] = await Promise.all([
    getDashboardStats(),
    getUsers(),
  ]);

  return (
    <div className="space-y-8 animate-in">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">Visão geral dos clientes e assinaturas do LeadFlowPro</p>
      </div>

      {/* KPIs principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total de Clientes"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          color="blue"
        />
        <KpiCard
          title="Ativos"
          value={stats.activeUsers}
          icon={<UserCheck className="w-5 h-5" />}
          color="green"
        />
        <KpiCard
          title="Suspensos / Cancelados"
          value={stats.suspendedUsers}
          icon={<UserX className="w-5 h-5" />}
          color="red"
        />
        <KpiCard
          title="Inadimplentes"
          value={stats.defaulterUsers}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="amber"
        />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Vencendo em 7 dias"
          value={stats.expiringUsers}
          icon={<Clock className="w-5 h-5" />}
          color="orange"
        />
        <KpiCard
          title="Receita Mensal"
          value={formatCurrency(stats.monthlyRevenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          color="emerald"
          isText
        />
        <KpiCard
          title="Pausados"
          value={stats.pausedUsers}
          icon={<Package className="w-5 h-5" />}
          color="slate"
        />
        <KpiCard
          title="Enterprise"
          value={stats.enterpriseCount}
          icon={<Star className="w-5 h-5" />}
          color="amber"
        />
      </div>

      {/* Gráfico + tabela recente */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <PlanDistributionChart
            starter={stats.starterCount}
            profissional={stats.profissionalCount}
            enterprise={stats.enterpriseCount}
          />
        </div>
        <div className="lg:col-span-2">
          <RecentUsersTable users={users.slice(0, 8)} />
        </div>
      </div>
    </div>
  );
}
