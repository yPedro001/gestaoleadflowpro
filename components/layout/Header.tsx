import { createServerSupabase } from '@/lib/supabase/server';
import { ShieldCheck } from 'lucide-react';

export async function Header() {
  const supabase = await createServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <header className="fixed top-0 right-0 left-[260px] h-16 bg-[#13161f]/80 backdrop-blur border-b border-[#2d3148] flex items-center justify-between px-6 z-30">
      <div />
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-white">{user?.email}</p>
          <p className="text-xs text-amber-400 flex items-center justify-end gap-1">
            <ShieldCheck className="w-3 h-3" />
            Super Admin
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
          <span className="text-amber-400 font-bold text-sm">
            {user?.email?.[0]?.toUpperCase() ?? 'A'}
          </span>
        </div>
      </div>
    </header>
  );
}
