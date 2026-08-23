import { LayoutDashboard, Users } from "lucide-react"

import { UserButton } from "@/components/auth/user/user-button"

export function UserButtonLinksDemo() {
  return (
    <UserButton
      links={[
        {
          label: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="text-muted-foreground" />,
          visibility: "authenticated"
        },
        {
          label: "Team",
          href: "/team",
          icon: <Users className="text-muted-foreground" />
        }
      ]}
    />
  )
}
