'use client'

import React from 'react'

type DataRow = {
  id: string
  [key: string]: any
}

type Column = {
  header: string
  accessor?: string
  cell?: (row: DataRow, index: number) => React.ReactNode
  className?: string
}

type DataTableProps = {
  caption?: string
  columns: Column[]
  data: DataRow[]
  emptyMessage?: string
  loading?: boolean
  className?: string
}

export function DataTable({
  caption,
  columns,
  data,
  emptyMessage = 'No data to display',
  loading = false,
  className = '',
}: DataTableProps) {
  if (loading) {
    return (
      <div className={`rounded-md border border-border bg-card p-8 text-center ${className}`}>
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!data.length) {
    return (
      <div className={`rounded-md border border-border bg-muted p-4 text-sm text-muted-foreground ${className}`}>
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className={`overflow-x-auto rounded-lg border border-border bg-card ${className}`}>
      <table className="min-w-full divide-y divide-border">
        {caption && (
          <caption className="sr-only">{caption}</caption>
        )}
        <thead className="bg-muted">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                scope="col"
                className={`px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-foreground ${column.className || ''}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {data.map((row, rowIndex) => (
            <tr key={row.id} className="hover:bg-muted">
              {columns.map((column, colIndex) => (
                <td
                  key={`${row.id}-${colIndex}`}
                  className={`whitespace-nowrap px-4 py-2 text-sm text-foreground ${column.className || ''}`}
                >
                  {column.cell
                    ? column.cell(row, colIndex)
                    : column.accessor
                    ? row[column.accessor]
                    : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}