"use client"

import { groupOAuthConsents } from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  useListOAuthConsents
} from "@better-auth-ui/react"
import { Card, type CardProps, cn } from "@heroui/react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import { AuthorizedApplication } from "./authorized-application"
import { AuthorizedApplicationSkeleton } from "./authorized-application-skeleton"
import { AuthorizedApplicationsEmpty } from "./authorized-applications-empty"

export type AuthorizedApplicationsProps = {
  className?: string
  variant?: CardProps["variant"]
}

/**
 * Security card listing the OAuth applications this account has authorized.
 *
 * It manages consent records, not sign-in sessions and not live access
 * tokens. Better Auth can store more than one consent per client, so records
 * are grouped by client ID and rendered as a single application.
 */
export function AuthorizedApplications({
  className,
  variant
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

      <Card variant={variant}>
        <Card.Content>
          {isPending ? (
            <AuthorizedApplicationSkeleton />
          ) : !applications.length ? (
            <AuthorizedApplicationsEmpty />
          ) : (
            applications.map((application, index) => (
              <div key={application.clientId}>
                {index > 0 && (
                  <div className="-mx-4 my-4 border-b border-dashed" />
                )}

                <AuthorizedApplication application={application} />
              </div>
            ))
          )}
        </Card.Content>
      </Card>
    </div>
  )
}
