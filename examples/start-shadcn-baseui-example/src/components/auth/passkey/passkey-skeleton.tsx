"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function PasskeySkeleton() {
  return (
    <Card className="border-0 bg-transparent shadow-none ring-0">
      <CardContent className="flex items-center gap-3">
        <Skeleton className="size-10 rounded-md" />

        <div className="flex flex-col gap-1">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-32" />
        </div>
      </CardContent>
    </Card>
  )
}
