import React from 'react';

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Scrollable wrapper for tables to handle overflow on small screens.
 */
export function TableContainer({ children, className = '' }: TableContainerProps) {
  return <div className={`overflow-x-auto ${className}`}>{children}</div>;
}

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Base table element with standard styling.
 */
export function Table({ children, className = '' }: TableProps) {
  return (
    <table className={`min-w-full divide-y divide-gray-200 ${className}`}>
      {children}
    </table>
  );
}

interface TableHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHeader({ children, className = '' }: TableHeaderProps) {
  return <thead className={`bg-gray-50 ${className}`}>{children}</thead>;
}

interface TableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function TableBody({ children, className = '' }: TableBodyProps) {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
      {children}
    </tbody>
  );
}

interface TableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableRow({ children, className = '', ...props }: TableRowProps) {
  return (
    <tr className={className} {...props}>
      {children}
    </tr>
  );
}

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function TableHead({ children, className = '' }: TableHeadProps) {
  return (
    <th
      scope="col"
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}
    >
      {children}
    </th>
  );
}

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export function TableCell({ children, className = '', ...props }: TableCellProps) {
  return (
    <td
      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-500 ${className}`}
      {...props}
    >
      {children}
    </td>
  );
}
