import { Item, ItemContent, ItemMedia } from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export function UserInvitationRowSkeleton() {
  return (
    <Item>
      <ItemMedia>
        <Skeleton class="size-10 shrink-0 rounded-md" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-40 rounded-md" />
        <Skeleton class="h-3 w-28 rounded-md" />
      </ItemContent>
    </Item>
  )
}
