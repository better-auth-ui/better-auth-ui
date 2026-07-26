import { Skeleton } from "@/components/ui/skeleton"

export function AuthorizedApplicationSkeleton() {
  return (
    <div class="flex items-start gap-3 p-6">
      <Skeleton class="size-10 shrink-0 rounded-md" />

      <div class="flex flex-1 flex-col gap-2">
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-40" />

        <div class="flex gap-1.5">
          <Skeleton class="h-5 w-20 rounded-full" />
          <Skeleton class="h-5 w-24 rounded-full" />
        </div>
      </div>
    </div>
  )
}
