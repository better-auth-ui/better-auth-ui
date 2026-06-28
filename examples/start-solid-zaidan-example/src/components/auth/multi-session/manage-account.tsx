import {
  multiSessionPlugin as coreMultiSessionPlugin,
  type MultiSessionLocalization,
  multiSessionLocalization
} from "@better-auth-ui/core/plugins/multi-session"
import { useAuth } from "@better-auth-ui/solid"
import { ArrowLeftRight, LogOut, MoreHorizontal } from "lucide-solid"
import { Show } from "solid-js"
import {
  resolveUserInitials,
  resolveUserLabel
} from "@/components/auth/settings/shared/helpers"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle
} from "@/components/ui/item"
import { Skeleton } from "@/components/ui/skeleton"

export function ManageAccountRow(props: {
  description: string
  email?: string | null
  image?: string | null
  isBusy: boolean
  isCurrentSession?: boolean
  name?: string | null
  onSignOut: () => void
  onSwitch?: () => void
}) {
  const auth = useAuth()
  const label = () => resolveUserLabel(props.name, props.email)
  const multiSessionPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMultiSessionPlugin.id)
  const multiSessionLabels = (): MultiSessionLocalization => ({
    ...multiSessionLocalization,
    ...(multiSessionPluginConfig()?.localization as
      | Partial<MultiSessionLocalization>
      | undefined)
  })

  return (
    <Item class="rounded-none px-4 py-3">
      <ItemMedia class="rounded-full bg-transparent">
        <Avatar class="size-10 rounded-full bg-muted text-muted-foreground">
          <AvatarImage alt={label()} src={props.image ?? undefined} />
          <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
            {resolveUserInitials(props.name, props.email)}
          </AvatarFallback>
        </Avatar>
      </ItemMedia>
      <ItemContent class="p-0">
        <ItemTitle>
          <Show fallback={label()} when={props.isCurrentSession}>
            {props.name ? props.name : null}
          </Show>
        </ItemTitle>
        <ItemDescription>{props.email}</ItemDescription>
      </ItemContent>
      <ItemActions>
        <Show
          fallback={
            <DropdownMenu>
              <DropdownMenuTrigger
                as={Button}
                class="shrink-0"
                disabled={props.isBusy}
                size="icon-sm"
                variant="ghost"
              >
                <MoreHorizontal class="size-4" />
              </DropdownMenuTrigger>

              <DropdownMenuContent class="min-w-fit">
                <DropdownMenuItem onSelect={props.onSwitch}>
                  <ArrowLeftRight class="text-muted-foreground" />
                  {multiSessionLabels().switchAccount}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={props.onSignOut}>
                  <LogOut class="text-muted-foreground" />
                  {auth.localization.auth.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          }
          when={props.isCurrentSession}
        >
          <Button
            class="shrink-0"
            disabled={props.isBusy}
            onClick={props.onSignOut}
            size="sm"
            type="button"
            variant="outline"
          >
            <LogOut class="size-4" />
            {auth.localization.auth.signOut}
          </Button>
        </Show>
      </ItemActions>
    </Item>
  )
}

export function ManageAccountRowSkeleton() {
  return (
    <Item class="rounded-none px-4 py-3">
      <ItemMedia class="rounded-full bg-transparent">
        <Skeleton class="size-10 rounded-full" />
      </ItemMedia>
      <ItemContent>
        <Skeleton class="h-4 w-28" />
        <Skeleton class="h-3 w-20" />
      </ItemContent>
      <ItemActions>
        <Skeleton class="h-8 w-8 rounded-md" />
      </ItemActions>
    </Item>
  )
}
