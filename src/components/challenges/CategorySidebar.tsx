'use client'

import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

type CategoryInfo = {
  name: string
  count: number
  icon?: string
}

type CategorySidebarProps = {
  categories: CategoryInfo[]
  totalCount: number
}

const categoryIcons: Record<string, string> = {
  web: 'fa-globe',
  crypto: 'fa-lock',
  pwn: 'fa-bug',
  reverse: 'fa-cogs',
  forensics: 'fa-search',
  misc: 'fa-puzzle-piece',
  binary: 'fa-file-code',
  steganography: 'fa-eye',
  osint: 'fa-satellite',
  network: 'fa-network-wired',
  mobile: 'fa-mobile-alt',
  blockchain: 'fa-link',
  ai: 'fa-robot',
  iot: 'fa-microchip',
}

const categoryColors: Record<string, string> = {
  web: 'text-primary',
  crypto: 'text-secondary',
  pwn: 'text-destructive',
  reverse: 'text-success',
  forensics: 'text-warning',
  misc: 'text-muted-foreground',
  binary: 'text-info',
  steganography: 'text-muted-foreground',
  osint: 'text-primary',
  network: 'text-success',
  mobile: 'text-secondary',
  blockchain: 'text-secondary',
  ai: 'text-primary',
  iot: 'text-warning',
}

export default function CategorySidebar({ categories, totalCount }: CategorySidebarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedCategory = searchParams?.get('category') || ''

  const handleCategoryClick = (category: string) => {
    if (category === '') {
      router.push('/challenges')
    } else {
      router.push(`/challenges?category=${encodeURIComponent(category)}`)
    }
  }

  return (
    <div className="sticky top-4 h-fit">
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="p-3 border-b border-border bg-muted/50">
          <h6 className="text-sm font-bold text-foreground mb-0 flex items-center gap-2">
            <i className="fas fa-filter text-primary"></i>
            Challenges
          </h6>
        </div>

        <div className="p-0">
          <button
            onClick={() => handleCategoryClick('')}
            className={`w-full flex items-center justify-between px-3 py-3 text-sm transition-all border-b border-border ${
              selectedCategory === ''
                ? 'bg-primary/10 border-l-4 border-l-primary font-semibold'
                : 'border-l-4 border-l-transparent hover:bg-primary/5'
            }`}
          >
            <span className="flex items-center gap-2">
              <i className="fas fa-th-large text-primary"></i>
              All Categories
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              selectedCategory === ''
                ? 'bg-primary/20 text-primary'
                : 'bg-muted text-muted-foreground'
            }`}>
              {totalCount}
            </span>
          </button>

          {categories.map((cat) => {
            const icon = categoryIcons[cat.name.toLowerCase()] || 'fa-folder'
            const color = categoryColors[cat.name.toLowerCase()] || 'text-gray-600'
            return (
              <button
                key={cat.name}
                onClick={() => handleCategoryClick(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-3 text-sm transition-all border-b border-border last:border-b-0 ${
                  selectedCategory === cat.name
                    ? 'bg-primary/10 border-l-4 border-l-primary font-semibold'
                    : 'border-l-4 border-l-transparent hover:bg-primary/5'
                }`}
              >
                <span className="flex items-center gap-2">
                  <i className={`fas ${icon} ${color}`}></i>
                  {cat.name}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedCategory === cat.name
                    ? 'bg-primary/20 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {cat.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
