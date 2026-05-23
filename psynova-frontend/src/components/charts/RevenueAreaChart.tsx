'use client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface Props {
  data: { month: string; revenue: number }[];
  gradientId?: string;
  height?: number;
  tooltipLabel?: string;
}

export default function RevenueAreaChart({
  data,
  gradientId = 'revenueGrad',
  height = 220,
  tooltipLabel,
}: Props) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4A90D9" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#4A90D9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F1F0EE" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
        <YAxis
          tick={{ fontSize: 11, fill: '#6B7280' }}
          tickFormatter={(v) => `$${v}`}
        />
        <Tooltip
          formatter={(v) =>
            tooltipLabel
              ? [formatCurrency(Number(v)), tooltipLabel]
              : formatCurrency(Number(v))
          }
          contentStyle={{
            borderRadius: 12,
            border: '1px solid #F1F0EE',
            fontSize: 12,
          }}
        />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#4A90D9"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
