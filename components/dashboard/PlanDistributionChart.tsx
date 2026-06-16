'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface Props {
  starter: number;
  profissional: number;
  enterprise: number;
}

const COLORS = ['#64748b', '#3b82f6', '#f59e0b'];

export function PlanDistributionChart({ starter, profissional, enterprise }: Props) {
  const data = [
    { name: 'Starter', value: starter },
    { name: 'Profissional', value: profissional },
    { name: 'Enterprise', value: enterprise },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-[#1a1d27] border border-[#2d3148] rounded-2xl p-5">
      <h3 className="text-white font-semibold mb-4">Distribuição por Plano</h3>
      {data.length === 0 ? (
        <div className="flex items-center justify-center h-48 text-slate-500 text-sm">
          Nenhum cliente cadastrado
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: '#1a1d27',
                border: '1px solid #2d3148',
                borderRadius: '12px',
                color: '#e2e8f0',
              }}
            />
            <Legend
              formatter={(value) => (
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
