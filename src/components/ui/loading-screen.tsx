import React from 'react';
import { Spinner } from './spinner';

interface LoadingScreenProps {
  message?: string;
  className?: string;
}

/**
 * Full-screen centered loading indicator.
 */
export function LoadingScreen({ message = 'Loading...', className = '' }: LoadingScreenProps) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <Spinner size="lg" />
        <div className="text-gray-500">{message}</div>
      </div>
    </div>
  );
}