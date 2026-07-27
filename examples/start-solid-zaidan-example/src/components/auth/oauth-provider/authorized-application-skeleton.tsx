import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export function AuthorizedApplicationSkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton class="size-10 shrink-0 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-32" />
        <Skeleton class="h-3 w-40" />

        <div class="flex gap-1.5">
          <Skeleton class="h-5 w-20 rounded-full" />
          <Skeleton class="h-5 w-24 rounded-full" />
        </div>
      </ItemContent>
    </Item>
  )
}
