import type { ComponentProps } from "solid-js"
import { Show, splitProps } from "solid-js"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "cn"
import {
  OrganizationLogo,
  type OrganizationLogoSize
} from "./organization-logo"

export type OrganizationViewSkeletonProps = ComponentProps<"div"> & {
  hideSlug?: boolean
  size?: OrganizationLogoSize
}

export function OrganizationViewSkeleton(props: OrganizationViewSkeletonProps) {
  const [local, others] = splitProps(props, ["class", "hideSlug", "size"])
  const size = () => local.size ?? "md"

  return (
    <div class={cn("flex min-w-0 items-center gap-2", local.class)} {...others}>
      <OrganizationLogo
        isPending
        class={size() === "sm" ? "size-5" : undefined}
        size={size() === "lg" ? "md" : "sm"}
      />

      <div class="flex min-w-0 flex-col gap-1">
        <Skeleton class="h-3.5 w-20 rounded-md" />

        <Show when={!local.hideSlug}>
          <Skeleton class="h-3 w-28 rounded-md" />
        </Show>
      </div>
    </div>
  )
}
