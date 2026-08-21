"use client"

import {
  type AuthorizedOAuthApplication,
  type OAuthProviderAuthClient,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { usePublicOAuthClient } from "@better-auth-ui/react/plugins/oauth-provider"
import { Shield } from "@gravity-ui/icons"
import { Avatar, Button, Chip, Link, Skeleton } from "@heroui/react"
import { useState } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
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
  const { authClient, locale } = useAuth()
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
    <div className="flex flex-wrap items-start gap-3">
      {publicClient.isPending ? (
        <Skeleton className="size-10 shrink-0 rounded-xl" />
      ) : (
        <Avatar className="size-10 shrink-0 rounded-xl">
          <Avatar.Image
            alt={clientName}
            referrerPolicy="no-referrer"
            src={logoUrl}
          />
          <Avatar.Fallback>
            <Shield className="size-4.5" />
          </Avatar.Fallback>
        </Avatar>
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex min-w-0 flex-col">
          {publicClient.isPending ? (
            <Skeleton className="h-4 w-32 rounded-lg" />
          ) : (
            <span className="truncate text-sm font-medium leading-tight">
              {clientName}
            </span>
          )}

          {websiteUrl ? (
            <Link
              className="truncate text-muted text-xs"
              href={websiteUrl}
              rel="noreferrer"
              target="_blank"
            >
              {websiteUrl}
            </Link>
          ) : null}

          {application.updatedAt ? (
            <span className="text-muted text-xs">
              {`${localization.lastAuthorized} ${application.updatedAt.toLocaleDateString(
                locale.languageTag,
                { dateStyle: "medium" }
              )}`}
            </span>
          ) : null}
        </div>

        {application.scopes.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {application.scopes.map((scope) => (
              <Chip key={scope} size="sm" variant="secondary">
                {
                  resolveOAuthScopeMetadata(scopeMetadata, scope, {
                    clientId: application.clientId,
                    requestedScopes: application.scopes
                  }).label
                }
              </Chip>
            ))}
          </div>
        )}
      </div>

      <Button
        className="shrink-0"
        size="sm"
        variant="outline"
        onPress={() => setRemoveOpen(true)}
      >
        {localization.removeAuthorization}
      </Button>

      <RemoveAuthorizationDialog
        application={application}
        clientName={clientName}
        isOpen={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </div>
  )
}
