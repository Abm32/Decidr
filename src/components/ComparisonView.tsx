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
  if (isLoading) return <LoadingIndicator message="Comparing scenarios..." />;
  if (error) return <ErrorDisplay error={error} onRetry={onRetry} />;
  if (!comparisonData) return <p className="text-sm text-gray-400">No comparison data</p>;

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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {scenarios.map((sc) => (
          <div key={sc.scenario_id} className="rounded-lg bg-gray-800 p-4">
            <h4 className="text-sm font-semibold text-gray-100">{sc.title}</h4>
            <ul className="mt-2 space-y-1">
              {comparisonData.metrics.map((m) => {
                const v = m.values.find((v) => v.scenarioId === sc.scenario_id);
                return v ? (
                  <li key={m.name} className="flex justify-between text-xs text-gray-300">
                    <span>{m.name}</span>
                    <span className="text-gray-400">{v.value} – {v.label}</span>
                  </li>
                ) : null;
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartRows}>
            <XAxis dataKey="metric" tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#e5e7eb' }} />
            <Legend wrapperStyle={{ color: '#d1d5db' }} />
            {barKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={COLORS[i % COLORS.length]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-lg bg-gray-800 p-4">
        <h4 className="text-sm font-semibold text-gray-100">Insights</h4>
        <p className="mt-2 text-sm text-gray-300">{comparisonData.summary}</p>
      </div>
    </div>
  );
}
