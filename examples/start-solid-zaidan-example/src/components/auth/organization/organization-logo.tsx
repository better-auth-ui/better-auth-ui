import type { Organization } from "better-auth/client"
import { BriefcaseBusiness } from "lucide-solid"
import type { JSX } from "solid-js"
import { Show } from "solid-js"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type OrganizationLogoSize = "sm" | "md" | "lg"

export type OrganizationLogoProps = {
  class?: string
  fallback?: JSX.Element
  isPending?: boolean
  organization?: Partial<Organization> | null
  size?: OrganizationLogoSize
}

const sizeClass: Record<OrganizationLogoSize, string> = {
  sm: "size-8",
  md: "size-10",
  lg: "size-20"
}

function getInitials(name?: string | null) {
  const normalized = name?.trim()

  if (!normalized) return null

  return normalized.slice(0, 2).toUpperCase()
}

export function OrganizationLogo(props: OrganizationLogoProps) {
  const size = () => props.size ?? "md"
  const logo = () => props.organization?.logo?.trim()
  const label = () => props.organization?.name ?? "Organization"
  const fallback = () =>
    props.fallback ??
    getInitials(props.organization?.name) ?? (
      <BriefcaseBusiness class="size-4" />
    )

  return (
    <Show
      when={!props.isPending || props.organization}
      fallback={
        <Skeleton class={cn("rounded-full", sizeClass[size()], props.class)} />
      }
    >
      <Avatar
        class={cn(
          "rounded-full bg-muted text-muted-foreground",
          sizeClass[size()],
          props.class
        )}
      >
        <Show when={logo()}>
          {(src) => <AvatarImage alt={label()} src={src()} />}
        </Show>
        <AvatarFallback class="rounded-full bg-muted text-muted-foreground">
          {fallback()}
        </AvatarFallback>
      </Avatar>
    </Show>
  )
}
