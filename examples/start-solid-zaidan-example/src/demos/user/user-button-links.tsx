import { LayoutDashboard, Users } from "lucide-solid"

import { UserButton } from "@/components/auth/user/user-button"

export function UserButtonLinksDemo() {
  return (
    <UserButton
      links={[
        {
          label: <span>Dashboard</span>,
          href: "/dashboard",
          icon: <LayoutDashboard class="size-4 text-muted-foreground" />,
          visibility: "authenticated"
        },
        {
          label: <span>Team</span>,
          href: "/team",
          icon: <Users class="size-4 text-muted-foreground" />
        }
      ]}
    />
  )
}
