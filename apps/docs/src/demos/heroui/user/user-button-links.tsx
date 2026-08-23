import { UserButton } from "@better-auth-ui/heroui"
import { LayoutCells, Persons } from "@gravity-ui/icons"

export function UserButtonLinksDemo() {
  return (
    <UserButton
      links={[
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutCells className="text-muted" />,
          visibility: "authenticated"
        },
        {
          label: "Team",
          href: "/team",
          icon: <Persons className="text-muted" />
        }
      ]}
    />
  )
}
