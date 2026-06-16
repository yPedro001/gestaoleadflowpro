import { getUserById } from '@/actions/users';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { EditUserForm } from '@/components/users/EditUserForm';

export const dynamic = 'force-dynamic';

export default async function EditUserPage({ params }: { params: { id: string } }) {
  let user;
  try {
    user = await getUserById(params.id);
  } catch {
    notFound();
  }

  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <Link
          href={`/usuarios/${user.id}`}
          className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para Detalhes
        </Link>
        <h1 className="text-2xl font-bold text-white">Editar Usuário</h1>
        <p className="text-slate-400 text-sm mt-1">{user.email}</p>
      </div>
      <EditUserForm user={user} />
    </div>
  );
}
