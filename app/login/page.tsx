import { LoginForm } from '@/components/auth/LoginForm';
import { ShieldCheck } from 'lucide-react';

export const metadata = {
  title: 'Login — GestãoLeadFlowPro',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1117] p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="bg-amber-500 p-3 rounded-2xl shadow-lg shadow-amber-500/30">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            GestãoLeadFlowPro
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Painel administrativo exclusivo
          </p>
        </div>

        {resolvedSearchParams.error === 'acesso_negado' && (
          <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl px-4 py-3 text-sm text-center">
            Acesso negado. Você não possui permissão de administrador.
          </div>
        )}

        <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-8 shadow-2xl">
          <LoginForm />
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          Acesso restrito. Este painel não possui cadastro público.
        </p>
      </div>
    </div>
  );
}
