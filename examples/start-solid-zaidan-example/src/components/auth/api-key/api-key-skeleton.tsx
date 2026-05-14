import { Skeleton } from "@/components/ui/skeleton"

export function ApiKeySkeleton() {
  return (
    <div class="flex items-center gap-3 p-4">
      <Skeleton class="size-10 rounded-md" />
      <div class="flex flex-col gap-1">
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-36" />
        <Skeleton class="h-3 w-32" />
      </div>
    </div>
  )
}
