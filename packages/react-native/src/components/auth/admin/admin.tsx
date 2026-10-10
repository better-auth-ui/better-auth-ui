import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { adminPlugin } from "../../../lib/auth/admin-plugin"
import { useNativeAuthenticate } from "../../../lib/auth/use-native-authenticate"
import type { CardSlotProps } from "../../../lib/auth-plugin"
import { useAuthNavigation } from "../../../navigation/navigation-context"
import { Description } from "../../../primitives/description"
import { Tabs } from "../../../primitives/tabs"
import { AdminUsers } from "./admin-users"
import { StopImpersonating } from "./stop-impersonating"

export function Admin({ view, ...props }: CardSlotProps & { view?: string }) {
  const { plugins } = useAuth()
  const { localization } = useAuthPlugin(adminPlugin)
  const navigation = useAuthNavigation()
  const current = navigation.current()
  const selected =
    view ?? (current?.section === "admin" ? current.view : "users")
  useNativeAuthenticate({ section: "admin", view: selected })
  const tabs = plugins.flatMap((plugin) => plugin.adminTabs ?? [])
  return (
    <Tabs
      className={props.className}
      selectedKey={selected}
      onSelectionChange={(view) => navigation.push({ section: "admin", view })}
    >
      <StopImpersonating />
      <Tabs.List aria-label={localization.admin}>
        <Tabs.Tab id="users">{localization.users}</Tabs.Tab>
        {tabs.map((tab) => (
          <Tabs.Tab key={tab.id} id={tab.id}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      <Tabs.Panel id="users">
        <AdminUsers variant={props.variant} />
      </Tabs.Panel>
      {tabs.map((tab) => (
        <Tabs.Panel key={tab.id} id={tab.id}>
          <tab.component />
        </Tabs.Panel>
      ))}
      {selected !== "users" && !tabs.some((tab) => tab.id === selected) ? (
        <Description>{localization.unknownViewDescription}</Description>
      ) : null}
    </Tabs>
  )
}
