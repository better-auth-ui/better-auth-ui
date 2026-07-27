"use client"

import { groupOAuthConsents } from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  useListOAuthConsents
} from "@better-auth-ui/react"
import { Fragment } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { ItemGroup, ItemSeparator } from "@/components/ui/item"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "@/lib/utils"
import { AuthorizedApplication } from "./authorized-application"
import { AuthorizedApplicationSkeleton } from "./authorized-application-skeleton"
import { AuthorizedApplicationsEmpty } from "./authorized-applications-empty"

export type AuthorizedApplicationsProps = {
  className?: string
}

/**
 * Security card listing the OAuth applications this account has authorized.
 *
 * It manages consent records, not sign-in sessions and not live access
 * tokens. Better Auth can store more than one consent per client, so records
 * are grouped by client ID and rendered as a single application.
 */
export function AuthorizedApplications({
  className
}: AuthorizedApplicationsProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)

  const { data: consents, isPending } = useListOAuthConsents(
    authClient as OAuthProviderAuthClient
  )

  const applications = groupOAuthConsents(consents)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <h2 className="truncate text-sm font-semibold">
        {localization.connectedApplications}
      </h2>

      <Card className="p-0">
        <CardContent className="p-0">
          {isPending ? (
            <AuthorizedApplicationSkeleton />
          ) : !applications.length ? (
            <AuthorizedApplicationsEmpty />
          ) : (
            <ItemGroup className="gap-0">
              {applications.map((application, index) => (
                <Fragment key={application.clientId}>
                  {index > 0 && <ItemSeparator />}
                  <AuthorizedApplication application={application} />
                </Fragment>
              ))}
            </ItemGroup>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
