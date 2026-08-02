import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
  Input,
  EmptyState,
} from "@/components/ui";

export interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  /** Fields to include in search matching for this column (client-side only) */
  searchFields?: (keyof T)[];
}

interface DataTableProps<T extends { id: string | number }> {
  data: T[];
  columns: Column<T>[];
  keyField?: keyof T;
  onRowClick?: (item: T) => void;
  rowClassName?: string;
  emptyMessage?: string;
  /** Empty state icon (shown inside the table when no data) */
  emptyIcon?: React.ReactNode;
  /** Empty state title (shown inside the table when no data) */
  emptyTitle?: string;
  /** Enable search bar (default: true) */
  searchable?: boolean;
  /** Placeholder for the search input */
  searchPlaceholder?: string;
  /** Fields to search across (client-side only; ignored when serverSide is true) */
  searchFields?: (keyof T)[];
  /** Page size for pagination (default: 10) */
  pageSize?: number;
  /** Enable pagination (default: true) */
  paginate?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Loading message */
  loadingMessage?: string;
  /**
   * Server-side mode: when true, the DataTable does NOT filter or paginate locally.
   * Instead it calls onFetch with the current page/search/pageSize and displays
   * the returned data directly. The total count drives the pagination controls.
   */
  serverSide?: boolean;
  /** Total record count (required when serverSide is true) */
  total?: number;
  /** Called when the page or search query changes (required when serverSide is true) */
  onFetch?: (params: { page: number; page_size: number; search: string }) => void;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  keyField = "id",
  onRowClick,
  rowClassName = "",
  emptyMessage = "No records found",
  emptyIcon,
  emptyTitle = "No Records Yet",
  searchable = true,
  searchPlaceholder = "Search...",
  searchFields,
  pageSize = 10,
  paginate = true,
  loading = false,
  loadingMessage = "Loading...",
  serverSide = false,
  total,
  onFetch,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when data changes (client-side only)
  useEffect(() => {
    if (!serverSide) {
      setCurrentPage(1);
    }
  }, [data, serverSide]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Notify parent when page/search changes (server-side mode)
  useEffect(() => {
    if (serverSide && onFetch) {
      const timer = setTimeout(() => {
        onFetch({
          page: currentPage,
          page_size: pageSize,
          search: searchQuery,
        });
      }, searchQuery ? 700 : 0); // Debounce search input
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, pageSize, serverSide]);

  // Client-side filtering (only when not serverSide)
  const filteredData = useMemo(() => {
    if (serverSide) return data;

    if (!searchQuery.trim()) return data;

    const query = searchQuery.toLowerCase();
    return data.filter((item) => {
      // If specific search fields are provided, search only those
      if (searchFields) {
        return searchFields.some((field) => {
          const value = item[field];
          return value !== undefined && value !== null && String(value).toLowerCase().includes(query);
        });
      }
      // Otherwise, search all string/number fields
      return Object.values(item as unknown as Record<string, unknown>).some((value) => {
        return value !== undefined && value !== null && String(value).toLowerCase().includes(query);
      });
    });
  }, [data, searchQuery, searchFields, serverSide]);

  const totalCount = serverSide ? (total ?? filteredData.length) : filteredData.length;
  const totalPages = paginate ? Math.ceil(totalCount / pageSize) : 1;
  const currentPageSafe = serverSide ? currentPage : Math.min(currentPage, Math.max(totalPages, 1));

  const paginatedData = serverSide
    ? data
    : paginate
      ? filteredData.slice((currentPageSafe - 1) * pageSize, currentPageSafe * pageSize)
      : filteredData;

  // In server-side mode, if current page > total pages, reset to page 1
  useEffect(() => {
    if (serverSide && totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [serverSide, totalPages, currentPage]);

  const renderCell = (item: T, column: Column<T>) => {
    if (typeof column.accessor === "function") {
      return column.accessor(item);
    }
    const value = item[column.accessor];
    return value !== undefined && value !== null ? String(value) : "-";
  };

  const startItem = totalCount === 0 ? 0 : (currentPageSafe - 1) * pageSize + 1;
  const endItem = Math.min(currentPageSafe * pageSize, totalCount);

  return (
    <div>
      {/* Search Bar */}
      {searchable && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
              🔍
            </span>
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="pl-9"
            />
          </div>
          <span className="text-sm text-gray-500 whitespace-nowrap">
            {totalCount} record{totalCount !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Table */}
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead key={index} className={col.className}>
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                {loadingMessage}
              </TableCell>
            </TableRow>
          ) : paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8">
                {searchQuery ? (
                  <EmptyState
                    icon={emptyIcon}
                    title="No Results Found"
                    description={`No records match your search for "${searchQuery}". Try adjusting your search terms.`}
                  />
                ) : (
                  <EmptyState
                    icon={emptyIcon}
                    title={emptyTitle}
                    description={emptyMessage}
                  />
                )}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => (
              <TableRow
                key={String(item[keyField])}
                className={`${rowClassName} ${onRowClick ? "cursor-pointer hover:bg-gray-50" : ""}`}
                onClick={onRowClick ? () => onRowClick(item) : undefined}
              >
                {columns.map((col, index) => (
                  <TableCell key={index} className={col.className}>
                    {renderCell(item, col)}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* Pagination Controls */}
      {paginate && totalCount > 0 && totalPages > 1 && (
        <div className="flex items-center justify-between mt-4 px-1">
          <span className="text-sm text-gray-500">
            Showing {startItem}–{endItem} of {totalCount}
          </span>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPageSafe === 1}
            >
              ← Prev
            </Button>
            <span className="text-sm text-gray-600 px-2">
              Page {currentPageSafe} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPageSafe === totalPages}
            >
              Next →
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
