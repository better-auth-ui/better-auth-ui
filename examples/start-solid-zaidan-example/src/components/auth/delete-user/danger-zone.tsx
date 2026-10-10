import { useAuth } from "@better-auth-ui/solid"
import { cn } from "cn"
import { DeleteAccount } from "./delete-account"

const defaultDangerZoneTitle = "Danger zone"

export type DangerZoneProps = {
  class?: string
}

export function DangerZone(props: DangerZoneProps = {}) {
  const auth = useAuth()
  const dangerZoneTitle = () =>
    auth.localization.settings.dangerZone || defaultDangerZoneTitle

  return (
    <div class={cn("flex w-full flex-col", props.class)}>
      <h2 class="mb-3 text-sm font-semibold text-destructive">
        {dangerZoneTitle()}
      </h2>

      <DeleteAccount />
    </div>
  )
}
