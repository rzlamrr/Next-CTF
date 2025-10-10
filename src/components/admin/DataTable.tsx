'use client'

import React from 'react'

export type Column<T> = {
  key: keyof T | string
  header: string
  className?: string
  render?: (row: T) => React.ReactNode
}

export type DataTableProps<T> = {
  columns: Column<T>[]
  data?: T[]
  loading?: boolean
  error?: string | null
  emptyMessage?: string
  footer?: React.ReactNode
}

/**
 * Minimal, flexible data table for admin pages
 * - Renders header from columns
 * - Supports custom cell render via column.render
 * - Handles loading, error, and empty states
 */
export function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  error = null,
  emptyMessage = 'No data found',
  footer,
}: DataTableProps<T>) {
  const hasData = (data?.length ?? 0) > 0

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted">
          <tr>
            {columns.map(col => (
              <th
                key={String(col.key)}
                scope="col"
                className={[
                  'px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-primary',
                  col.className ?? '',
                ].join(' ')}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-border bg-card">
          {loading ? (
            <tr>
              <td
                className="px-4 py-6 text-sm text-muted-foreground"
                colSpan={columns.length}
              >
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td
                className="px-4 py-6 text-sm text-destructive"
                colSpan={columns.length}
              >
                {error}
              </td>
            </tr>
          ) : !hasData ? (
            <tr>
              <td
                className="px-4 py-6 text-sm text-muted-foreground"
                colSpan={columns.length}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data!.map((row, idx) => (
              <tr
                key={(row as any).id ?? idx}
                className="hover:bg-muted/50"
              >
                {columns.map(col => (
                  <td
                    key={String(col.key)}
                    className={[
                      'whitespace-nowrap px-4 py-2 text-sm text-foreground',
                      col.className ?? '',
                    ].join(' ')}
                  >
                    {col.render
                      ? col.render(row)
                      : (row as any)[col.key as keyof T]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>

        {footer ? (
          <tfoot className="bg-muted">
            <tr>
              <td colSpan={columns.length} className="px-4 py-3">
                {footer}
              </td>
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  )
}
