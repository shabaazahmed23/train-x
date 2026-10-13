'use client';

import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { logFitnessProgressAction } from '@/lib/actions';
import { formatDate } from '@/lib/utils';
import { TrendingUp, Plus, Scale, Percent } from 'lucide-react';

interface ProgressRecord {
  id: string;
  recordDate: string;
  weightKg: number;
  bodyFatPercentage?: number | null;
  chestCm?: number | null;
  waistCm?: number | null;
  notes?: string | null;
}

interface ProgressTrackerProps {
  records: ProgressRecord[];
}

export function ProgressTracker({ records }: ProgressTrackerProps) {
  const chartData = [...records].reverse().map((r) => ({
    date: formatDate(r.recordDate),
    weight: Number(r.weightKg),
    bodyFat: r.bodyFatPercentage ? Number(r.bodyFatPercentage) : null,
  }));

  return (
    <div className="space-y-8">
      {/* Interactive Recharts Progress Chart */}
      <div className="card-luxury p-6 bg-[#161616] border-[#262626] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#F5F5F0]">Weight Progression Curve</h3>
            <p className="text-[11px] text-[#7E7E78]">Body composition trends over time</p>
          </div>
          <span className="text-[10px] font-mono text-[#C8A96B] px-2.5 py-0.5 rounded bg-[#C8A96B]/15 border border-[#C8A96B]/30">
            KG &bull; Metric
          </span>
        </div>

        {chartData.length < 2 ? (
          <p className="text-xs text-[#7E7E78] py-12 text-center">
            Log at least 2 measurements to render your interactive trend line chart.
          </p>
        ) : (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#242424" vertical={false} />
                <XAxis dataKey="date" stroke="#7E7E78" fontSize={11} tickLine={false} />
                <YAxis stroke="#7E7E78" fontSize={11} tickLine={false} axisLine={false} domain={['dataMin - 2', 'dataMax + 2']} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#181818',
                    borderColor: '#333333',
                    borderRadius: '6px',
                    color: '#F5F5F0',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`${value} kg`, 'Weight']}
                />
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="#C8A96B"
                  strokeWidth={2.5}
                  dot={{ fill: '#C8A96B', r: 4 }}
                  activeDot={{ r: 6, fill: '#F5F5F0' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Log Metric Form */}
        <div className="lg:col-span-5 card-luxury p-6 bg-[#161616] border-[#262626]">
          <h3 className="text-sm font-bold text-[#F5F5F0] mb-4 border-b border-[#242424] pb-2 flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#C8A96B]" /> Log Today&apos;s Measurement
          </h3>

          <form
            action={async (fd) => {
              await logFitnessProgressAction(fd);
            }}
            className="space-y-3 text-xs"
          >
            <div>
              <label className="block text-[#A0A09B] mb-1 font-medium">Body Weight (kg) *</label>
              <input
                name="weightKg"
                type="number"
                step="0.1"
                required
                placeholder="e.g. 76.5"
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0] focus:outline-none focus:border-[#C8A96B]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[#A0A09B] mb-1 font-medium">Body Fat (%)</label>
                <input
                  name="bodyFatPercentage"
                  type="number"
                  step="0.1"
                  placeholder="e.g. 17.5"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0]"
                />
              </div>
              <div>
                <label className="block text-[#A0A09B] mb-1 font-medium">Waist (cm)</label>
                <input
                  name="waistCm"
                  type="number"
                  step="0.5"
                  placeholder="e.g. 82.0"
                  className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#A0A09B] mb-1 font-medium">Notes & Energy Level</label>
              <textarea
                name="notes"
                rows={2}
                placeholder="Felt strong on squats, 8 hours sleep..."
                className="w-full rounded bg-[#111] border border-[#282828] px-3.5 py-2.5 text-[#F5F5F0]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded bg-[#C8A96B] hover:bg-[#DFCA98] text-black font-bold uppercase text-xs tracking-wider transition-colors"
            >
              Save Biometric Log
            </button>
          </form>
        </div>

        {/* History Table */}
        <div className="lg:col-span-7 card-luxury p-6 bg-[#161616] border-[#262626]">
          <h3 className="text-sm font-bold text-[#F5F5F0] mb-4 border-b border-[#242424] pb-2">
            Assessment Log Archive
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#222] text-[#8E8E88]">
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Weight</th>
                  <th className="py-2.5 px-3">Body Fat</th>
                  <th className="py-2.5 px-3">Waist</th>
                  <th className="py-2.5 px-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1F1F1F]">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-[#1A1A1A] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#F5F5F0]">{formatDate(r.recordDate)}</td>
                    <td className="py-2.5 px-3 font-bold text-[#C8A96B]">{Number(r.weightKg)} kg</td>
                    <td className="py-2.5 px-3 text-[#A0A09B]">{r.bodyFatPercentage ? `${Number(r.bodyFatPercentage)}%` : '—'}</td>
                    <td className="py-2.5 px-3 text-[#A0A09B]">{r.waistCm ? `${Number(r.waistCm)} cm` : '—'}</td>
                    <td className="py-2.5 px-3 text-[#7E7E78] max-w-xs truncate">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
