"use client"

import {
  assertAuthClientHasOrganizationOrThrow,
  useActiveOrganization,
  useAuth,
  useOrganizationInvitations
} from "@better-auth-ui/react"
import { Building2 } from "lucide-react"
import { OrganizationInvitations } from "@/components/auth/organization/members/organization-invitations-table"
import { OrganizationMembers } from "@/components/auth/organization/members/organization-members-table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

export type MembersProps = {
  className?: string
}

export function Members({ className }: MembersProps) {
  const { authClient, Link } = useAuth()
  assertAuthClientHasOrganizationOrThrow(authClient)

  const { data: activeOrganization } = useActiveOrganization(authClient)
  const organizationId = activeOrganization?.id

  const { data: invitations } = useOrganizationInvitations(authClient)

  const activeInvitationsCount =
    invitations?.filter((invitation) => invitation.status === "pending")
      .length ?? 0

  if (!organizationId) {
    return (
      <div className={cn("flex flex-col gap-6", className)}>
        <h1 className="font-bold text-3xl">Members</h1>

        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Building2 className="size-5 text-muted-foreground" />
            </div>

            <div className="flex flex-col gap-1">
              <p className="font-medium">No active organization</p>
              <p className="text-muted-foreground text-sm">
                Create an organization to invite members and collaborate.
              </p>
            </div>

            <Button asChild size="sm">
              <Link href="/auth/onboarding">Create organization</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <h1 className="font-bold text-3xl">Members</h1>

      <Tabs className="gap-6" defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="invitations">
            Invitations
            {activeInvitationsCount > 0 && (
              <Badge className="ml-1 h-5 px-1.5" variant="secondary">
                {activeInvitationsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <OrganizationMembers />
        </TabsContent>

        <TabsContent value="invitations">
          <OrganizationInvitations />
        </TabsContent>
      </Tabs>
    </div>
  )
}
