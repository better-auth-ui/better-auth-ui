import { useAuth } from "@better-auth-ui/solid"
import type { SettingsSession } from "@/components/auth/settings/shared/types"
import { DeleteUser } from "./delete-user"

const defaultDangerZoneTitle = "Danger zone"

export function DangerZone(props: { session: SettingsSession }) {
  const auth = useAuth()
  const dangerZoneTitle = () =>
    auth.localization.settings.dangerZone || defaultDangerZoneTitle

  return (
    <div class="flex w-full flex-col">
      <h2 class="mb-3 text-sm font-semibold text-destructive">
        {dangerZoneTitle()}
      </h2>

      <DeleteUser session={props.session} />
    </div>
  )
}
