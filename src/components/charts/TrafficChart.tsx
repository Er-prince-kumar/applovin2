'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TrafficChartProps {
  data: { date: string; clicks: number; visitors: number }[];
  height?: number;
}

export default function TrafficChart({ data, height = 280 }: TrafficChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[280px] flex items-center justify-center text-sm text-gray-400">
        No traffic events found for this period.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            axisLine={{ stroke: '#374151' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#151B26',
              borderColor: '#374151',
              borderRadius: '0.75rem',
              color: '#F9FAFB',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
            }}
            labelStyle={{ color: '#9CA3AF', marginBottom: '4px', fontSize: '12px' }}
          />
          <Legend
            verticalAlign="top"
            align="right"
            wrapperStyle={{ paddingBottom: '12px', fontSize: '12px' }}
          />
          <Bar dataKey="clicks" name="Total Clicks" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="visitors" name="Unique Visitors" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
