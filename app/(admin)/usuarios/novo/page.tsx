import { CreateUserForm } from '@/components/users/CreateUserForm';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Novo Usuário — GestãoLeadFlowPro' };

export default function NovoUsuarioPage() {
  return (
    <div className="space-y-6 animate-in max-w-2xl">
      <div>
        <Link href="/usuarios" className="flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-4 transition-colors w-fit">
          <ArrowLeft className="w-4 h-4" />
          Voltar para Usuários
        </Link>
        <h1 className="text-2xl font-bold text-white">Criar Novo Usuário</h1>
        <p className="text-slate-400 text-sm mt-1">
          O usuário criado aqui poderá acessar o LeadFlowPro com as credenciais definidas.
        </p>
      </div>
      <CreateUserForm />
    </div>
  );
}
