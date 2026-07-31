import React from 'react';

type InfoRowColor = 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'gray';

interface InfoRowProps {
  title: string;
  description?: string;
  color?: InfoRowColor;
  action?: React.ReactNode;
  className?: string;
}

const colorStyles: Record<InfoRowColor, string> = {
  blue: 'bg-blue-50',
  green: 'bg-green-50',
  red: 'bg-red-50',
  yellow: 'bg-yellow-50',
  purple: 'bg-purple-50',
  gray: 'bg-gray-50',
};

/**
 * A row with a title, description, and optional action on the right.
 * Commonly used in dashboard management sections.
 */
export function InfoRow({
  title,
  description,
  color = 'blue',
  action,
  className = '',
}: InfoRowProps) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg ${colorStyles[color]} ${className}`}>
      <div>
        <p className="font-medium text-gray-900">{title}</p>
        {description && <p className="text-sm text-gray-500">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}