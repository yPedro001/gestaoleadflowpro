import { getUsers } from '@/actions/users';
import { UsersTable } from '@/components/users/UsersTable';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';

export const metadata = { title: 'Usuários — GestãoLeadFlowPro' };
export const dynamic = 'force-dynamic';

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; plan?: string; access?: string; payment?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const users = await getUsers();

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuários</h1>
          <p className="text-slate-400 text-sm mt-1">
            {users.length} cliente{users.length !== 1 ? 's' : ''} cadastrado{users.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/usuarios/novo"
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-amber-500/20 text-sm"
        >
          <UserPlus className="w-4 h-4" />
          Novo Usuário
        </Link>
      </div>

      <UsersTable
        initialUsers={users}
        initialSearch={resolvedSearchParams.q}
        initialPlan={resolvedSearchParams.plan}
        initialAccess={resolvedSearchParams.access}
        initialPayment={resolvedSearchParams.payment}
      />
    </div>
  );
}
