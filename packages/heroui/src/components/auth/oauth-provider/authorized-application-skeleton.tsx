import { Skeleton } from "@heroui/react"

export function AuthorizedApplicationSkeleton() {
  return (
    <div className="flex items-start gap-3">
      <Skeleton className="size-10 shrink-0 rounded-xl" />

      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded-lg" />
        <Skeleton className="h-3 w-40 rounded-lg" />

        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
