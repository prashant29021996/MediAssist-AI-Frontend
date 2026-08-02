import React from "react";
import { Card, CardBody, CardHeader, Button } from "@/components/ui";
import { DataTable, Column } from "@/components/DataTable";

interface ListLayoutProps<T extends { id: string | number }> {
  /** Page title (e.g., "Departments") */
  title?: string;
  /** Page subtitle/description */
  subtitle?: string;
  /** Card header title (e.g., "Department List") */
  cardTitle: string;
  /** Static description for the card header (overrides the auto-computed count) */
  cardDescription?: string;
  /** Data array to display */
  data: T[];
  /** Total record count (for server-side pagination) */
  total?: number;
  /** Column definitions */
  columns: Column<T>[];
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /** Empty state icon */
  emptyIcon?: string;
  /** Empty state title */
  emptyTitle?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Row click handler */
  onRowClick?: (item: T) => void;
  /** Action button label (e.g., "Add Department") */
  actionLabel?: string;
  /** Action button click handler */
  onAction?: () => void;
  /** Whether to show the action button */
  showAction?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Fields to search across */
  searchFields?: (keyof T)[];
  /** Page size (default: 10) */
  pageSize?: number;
  /** Key field for rows */
  keyField?: keyof T;
  /** Label for records (e.g., "department", "doctor") */
  recordLabel?: string;
  /** Whether to show the page header (default: true). Set to false when the page already renders its own header. */
  showPageHeader?: boolean;
  /** Server-side pagination mode */
  serverSide?: boolean;
  /** Called when page/search changes (required when serverSide is true) */
  onFetch?: (params: { page: number; page_size: number; search: string }) => void;
  /** Additional content to render below the table (e.g., modals) */
  children?: React.ReactNode;
}

export function ListLayout<T extends { id: string | number }>({
  title,
  subtitle,
  cardTitle,
  cardDescription,
  data,
  total,
  columns,
  loading = false,
  loadingMessage = "Loading...",
  emptyIcon = "📋",
  emptyTitle = "No Records Yet",
  emptyDescription = "Records will appear here once added.",
  onRowClick,
  actionLabel,
  onAction,
  showAction = true,
  searchPlaceholder = "Search...",
  searchFields,
  pageSize = 10,
  keyField = "id",
  recordLabel = "record",
  showPageHeader = true,
  serverSide = false,
  onFetch,
  children,
}: ListLayoutProps<T>) {
  const itemCount = serverSide ? (total ?? data.length) : data.length;
  const description =
    cardDescription ?? `${itemCount} ${recordLabel}${itemCount !== 1 ? "s" : ""}`;

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      {showPageHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{cardTitle}</h3>
              <p className="text-sm text-gray-500 mt-1">{description}</p>
            </div>
            {showAction && actionLabel && onAction && (
              <Button onClick={onAction}>{actionLabel}</Button>
            )}
          </div>
        </CardHeader>
        <CardBody>
          <DataTable
            data={data}
            columns={columns}
            keyField={keyField}
            onRowClick={onRowClick}
            pageSize={pageSize}
            searchable
            searchPlaceholder={searchPlaceholder}
            searchFields={searchFields}
            loading={loading}
            loadingMessage={loadingMessage}
            emptyMessage={emptyDescription}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            serverSide={serverSide}
            total={total}
            onFetch={onFetch}
          />
        </CardBody>
      </Card>

      {/* Render modals / additional content */}
      {children}
    </div>
  );
}
