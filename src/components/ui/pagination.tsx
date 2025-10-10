'use client'

import React from 'react'

type PaginationProps = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = '',
}: PaginationProps) {
  if (totalPages <= 1) return null

  const getVisiblePages = () => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: (number | string)[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push('...')
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }

  return (
    <div className={`flex items-center justify-center space-x-2 mt-6 ${className}`}>
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1 text-sm rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
      >
        Previous
      </button>

      <div className="flex space-x-1">
        {getVisiblePages().map((page, index) => (
          <span key={index}>
            {page === '...' ? (
              <span className="px-3 py-1 text-sm text-foreground">...</span>
            ) : (
              <button
                onClick={() => onPageChange(page as number)}
                className={`px-3 py-1 text-sm rounded-md border border-input ${
                  currentPage === page
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-foreground hover:bg-accent'
                }`}
              >
                {page}
              </button>
            )}
          </span>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1 text-sm rounded-md border border-input bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent"
      >
        Next
      </button>
    </div>
  )
}