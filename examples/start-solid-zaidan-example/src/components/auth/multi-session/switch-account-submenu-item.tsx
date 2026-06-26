import {
  type MultiSessionAuthClient,
  useAuth,
  useSetActiveSession
} from "@better-auth-ui/solid"
import { LoaderCircle } from "lucide-solid"
import type { DeviceSession } from "@/components/auth/settings/shared/types"
import { UserView } from "@/components/auth/user/user-view"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"

export type SwitchAccountSubmenuItemProps = {
  deviceSession: DeviceSession
}

export function SwitchAccountSubmenuItem(props: SwitchAccountSubmenuItemProps) {
  const auth = useAuth<MultiSessionAuthClient>()
  const setActiveSession = useSetActiveSession(auth.authClient, {
    onSuccess: () => window.scrollTo({ top: 0 })
  })

  return (
    <DropdownMenuItem
      disabled={setActiveSession.isPending}
      onSelect={() => {
        setActiveSession.mutate({
          sessionToken: props.deviceSession.session.token
        } as Parameters<typeof setActiveSession.mutate>[0])
      }}
    >
      <UserView user={props.deviceSession.user} />
      {setActiveSession.isPending ? (
        <LoaderCircle class="ml-auto size-4 animate-spin" />
      ) : null}
    </DropdownMenuItem>
  )
}
