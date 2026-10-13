'use client';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsChartsProps {
  revenueTrend: Array<{ month: string; amount: number }>;
  planDistribution: Array<{ name: string; count: number }>;
  attendanceDays: Array<{ day: string; count: number }>;
}

export function AnalyticsCharts({
  revenueTrend,
  planDistribution,
  attendanceDays,
}: AnalyticsChartsProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Revenue Collection Trend */}
      <div className="card-luxury p-6 bg-[#161616] border-[#262626]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F0]">Monthly Revenue Collections</h3>
            <p className="text-[11px] text-[#7E7E78]">Actual verified payments recorded</p>
          </div>
          <span className="text-[10px] font-mono text-[#C8A96B] px-2 py-0.5 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/30">
            INR ₹
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C8A96B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#C8A96B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
              <XAxis dataKey="month" stroke="#7E7E78" fontSize={11} tickLine={false} />
              <YAxis
                stroke="#7E7E78"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181818',
                  borderColor: '#333333',
                  borderRadius: '6px',
                  color: '#F5F5F0',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [formatCurrency(Number(value) || 0), 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="amount"
                stroke="#C8A96B"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#goldGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Plan Popularity Distribution */}
      <div className="card-luxury p-6 bg-[#161616] border-[#262626]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F0]">Plan Popularity & Active Enrollments</h3>
            <p className="text-[11px] text-[#7E7E78]">Distribution by membership tier</p>
          </div>
          <span className="text-[10px] font-mono text-[#A0A09B] px-2 py-0.5 rounded bg-[#222]">
            Active Tiers
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={planDistribution} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
              <XAxis dataKey="name" stroke="#7E7E78" fontSize={10} tickLine={false} interval={0} />
              <YAxis stroke="#7E7E78" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#181818',
                  borderColor: '#333333',
                  borderRadius: '6px',
                  color: '#F5F5F0',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${value} Members`, 'Enrollments']}
              />
              <Bar dataKey="count" fill="#C8A96B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
