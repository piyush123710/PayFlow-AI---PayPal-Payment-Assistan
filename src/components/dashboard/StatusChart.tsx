import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface StatusChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export const StatusChart: React.FC<StatusChartProps> = ({ data }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      return (
        <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl shadow-xl">
          <p className="text-xs font-semibold text-white">{item.name}</p>
          <p className="text-sm font-bold text-slate-300">
            {item.value} ({total > 0 ? Math.round((item.value / total) * 100) : 0}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 backdrop-blur-sm flex flex-col justify-between">
      <div>
        <h3 className="text-sm font-bold text-white tracking-tight">Payment Status</h3>
        <p className="text-xs text-slate-400">Distribution of all payment orders</p>
      </div>

      <div className="h-52 w-full relative flex items-center justify-center my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<CustomTooltip />} />
            <Pie
              data={data}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-black text-white">{total}</span>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
        {data.map((item, idx) => (
          <div key={idx} className="flex flex-col items-center text-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-slate-400 truncate">{item.name}</span>
            </div>
            <span className="text-xs font-bold text-white">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
