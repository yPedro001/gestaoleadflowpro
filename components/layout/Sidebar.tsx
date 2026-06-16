'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, LogOut, ShieldCheck, FileText
} from 'lucide-react';
import { adminLogout } from '@/actions/auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/usuarios', label: 'Usuários', icon: Users },
  { href: '/logs', label: 'Logs de Auditoria', icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed top-0 left-0 h-full w-[260px] bg-[#13161f] border-r border-[#2d3148] flex flex-col z-40"
    >
      {/* Logo */}
      <div className="p-6 border-b border-[#2d3148]">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500 p-2 rounded-xl shadow-lg shadow-amber-500/30">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">GestãoLeadFlowPro</p>
            <p className="text-slate-500 text-xs">Painel Admin</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              pathname.startsWith(href)
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            )}
          >
            <Icon className="w-4 h-4 shrink-0" />
            {label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#2d3148]">
        <form action={adminLogout}>
          <button
            type="submit"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/5 transition-all w-full"
          >
            <LogOut className="w-4 h-4" />
            Sair do Painel
          </button>
        </form>
      </div>
    </aside>
  );
}
