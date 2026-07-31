import React from 'react';

type StatColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple';

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  color?: StatColor;
  hint?: string;
  className?: string;
}

const colorStyles: Record<StatColor, { border: string; text: string }> = {
  blue: { border: 'border-blue-500', text: 'text-blue-600' },
  green: { border: 'border-green-500', text: 'text-green-600' },
  red: { border: 'border-red-500', text: 'text-red-600' },
  yellow: { border: 'border-yellow-500', text: 'text-yellow-600' },
  purple: { border: 'border-purple-500', text: 'text-purple-600' },
};

/**
 * Stat card with a colored left border, label, and large value.
 */
export function StatCard({ label, value, color = 'blue', hint, className = '' }: StatCardProps) {
  const styles = colorStyles[color];

  return (
    <div className={`bg-white rounded-lg shadow p-6 border-l-4 ${styles.border} ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">{label}</h3>
      <p className={`mt-2 text-3xl font-bold ${styles.text}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}