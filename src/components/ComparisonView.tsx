'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { Scenario, ComparisonData, AppError } from '@/types';
import { LoadingIndicator } from './LoadingIndicator';
import { ErrorDisplay } from './ErrorDisplay';

const COLORS = ['#3b82f6', '#ef4444', '#22c55e', '#a855f7'];

interface Props {
  scenarios: Scenario[];
  comparisonData: ComparisonData | null;
  isLoading: boolean;
  error: AppError | null;
  onRetry: () => void;
}

export function ComparisonView({ scenarios, comparisonData, isLoading, error, onRetry }: Props) {
  if (isLoading) return <LoadingIndicator message="Analyzing and comparing scenarios..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;
  if (!comparisonData) return <p className="text-sm text-gray-500">No comparison data</p>;

  const chartRows = comparisonData.metrics.map((m) => {
    const row: Record<string, string | number> = { metric: m.name };
    m.values.forEach((v) => {
      const sc = scenarios.find((s) => s.scenario_id === v.scenarioId);
      row[sc?.title ?? v.scenarioId] = v.value;
    });
    return row;
  });

  const barKeys = comparisonData.metrics[0]?.values.map((v) => {
    const sc = scenarios.find((s) => s.scenario_id === v.scenarioId);
    return sc?.title ?? v.scenarioId;
  }) ?? [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((sc) => (
          <div key={sc.scenario_id} className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
            <h4 className="text-sm font-semibold text-white">{sc.title}</h4>
            <ul className="mt-3 space-y-2">
              {comparisonData.metrics.map((m) => {
                const v = m.values.find((v) => v.scenarioId === sc.scenario_id);
                return v ? (
                  <li key={m.name} className="flex items-center justify-between text-xs">
                    <span className="text-gray-400">{m.name}</span>
                    <span className="tabular-nums text-gray-300">{v.value}<span className="ml-1 text-gray-500">— {v.label}</span></span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h4 className="mb-4 text-sm font-semibold text-white">Comparison Chart</h4>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartRows}>
            <XAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#111827', border: '1px solid #1f2937', borderRadius: 12, color: '#e5e7eb', fontSize: 12 }} />
            <Legend wrapperStyle={{ color: '#9ca3af', fontSize: 12 }} />
            {barKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h4 className="text-sm font-semibold text-white">AI Insights</h4>
        <p className="mt-3 text-sm leading-relaxed text-gray-400">{comparisonData.summary}</p>
      </div>
    </div>
  );
}
