import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  color: 'blue' | 'green' | 'red' | 'amber' | 'orange' | 'emerald' | 'slate';
  isText?: boolean;
  subtitle?: string;
}

const colorMap: Record<string, string> = {
  blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  green: 'text-green-400 bg-green-500/10 border-green-500/20',
  red: 'text-red-400 bg-red-500/10 border-red-500/20',
  amber: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  orange: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
  emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  slate: 'text-slate-400 bg-slate-500/10 border-slate-500/20',
};

export function KpiCard({ title, value, icon, color, isText, subtitle }: KpiCardProps) {
  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5 hover:border-[#3d4168] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <div className={cn('p-2 rounded-xl border', colorMap[color])}>
          {icon}
        </div>
      </div>
      <p className={cn('font-bold', isText ? 'text-xl' : 'text-3xl', 'text-white')}>
        {value}
      </p>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
}
