'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type StatCardProps = {
  title: string
  value: number | string
  description?: string
  icon?: React.ReactNode
}

export function StatCard({ title, value, description, icon }: StatCardProps) {
  return (
    <Card className="overflow-hidden ring-1 ring-ring/20 hover:ring-ring/40 transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {icon ? <div className="text-accent">{icon}</div> : null}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description ? (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        ) : null}
      </CardContent>
    </Card>
  )
}
