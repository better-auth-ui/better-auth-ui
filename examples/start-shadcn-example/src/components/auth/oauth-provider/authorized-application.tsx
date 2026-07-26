"use client"

import {
  type AuthorizedOAuthApplication,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  useAuth,
  useAuthPlugin,
  usePublicOAuthClient
} from "@better-auth-ui/react"
import { ShieldCheck } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { RemoveAuthorizationDialog } from "./remove-authorization-dialog"

export type AuthorizedApplicationProps = {
  /** @remarks `AuthorizedOAuthApplication` */
  application: AuthorizedOAuthApplication
}

/**
 * A single authorized application row.
 *
 * Each row loads its own public client metadata so one slow or missing
 * application never blocks the rest of the card.
 */
export function AuthorizedApplication({
  application
}: AuthorizedApplicationProps) {
  const { authClient } = useAuth()
  const { localization, scopeMetadata } = useAuthPlugin(oauthProviderPlugin)
  const [removeOpen, setRemoveOpen] = useState(false)

  const publicClient = usePublicOAuthClient(
    authClient as OAuthProviderAuthClient,
    application.clientId
  )

  const client = publicClient.data
  const clientName = client?.client_name || application.clientId
  const logoUrl = sanitizeOAuthClientUrl(client?.logo_uri)
  const websiteUrl = sanitizeOAuthClientUrl(client?.client_uri)

  return (
    <Card className="bg-transparent border-0 ring-0 shadow-none">
      <CardContent className="flex flex-wrap items-start gap-3">
        {publicClient.isPending ? (
          <Skeleton className="size-10 shrink-0 rounded-md" />
        ) : (
          <Avatar className="size-10 shrink-0 rounded-md">
            <AvatarImage
              alt={clientName}
              referrerPolicy="no-referrer"
              src={logoUrl}
            />
            <AvatarFallback className="rounded-md">
              <ShieldCheck className="size-4.5" />
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex min-w-0 flex-col">
            {publicClient.isPending ? (
              <Skeleton className="h-4 w-32" />
            ) : (
              <span className="truncate text-sm font-medium leading-tight">
                {clientName}
              </span>
            )}

            {websiteUrl ? (
              <a
                className="truncate text-xs text-muted-foreground underline-offset-4 hover:underline"
                href={websiteUrl}
                rel="noreferrer"
                target="_blank"
              >
                {websiteUrl}
              </a>
            ) : null}

            {application.updatedAt ? (
              <span className="text-xs text-muted-foreground">
                {`${localization.lastAuthorized} ${application.updatedAt.toLocaleDateString(
                  undefined,
                  { dateStyle: "medium" }
                )}`}
              </span>
            ) : null}
          </div>

          {application.scopes.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {application.scopes.map((scope) => (
                <Badge key={scope} variant="secondary">
                  {
                    resolveOAuthScopeMetadata(scopeMetadata, scope, {
                      clientId: application.clientId,
                      requestedScopes: application.scopes
                    }).label
                  }
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Button
          className="shrink-0"
          size="sm"
          variant="outline"
          onClick={() => setRemoveOpen(true)}
        >
          {localization.removeAuthorization}
        </Button>

        <RemoveAuthorizationDialog
          application={application}
          clientName={clientName}
          open={removeOpen}
          onOpenChange={setRemoveOpen}
        />
      </CardContent>
    </Card>
  )
}
