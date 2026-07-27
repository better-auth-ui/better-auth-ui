import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export function ApiKeySkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton class="size-10 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-36" />
        <Skeleton class="h-3 w-32" />
      </ItemContent>
    </Item>
  )
}
