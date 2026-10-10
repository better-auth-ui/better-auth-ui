"use client"

import {
  type AuthorizedOAuthApplication,
  type OAuthProviderAuthClient,
  resolveOAuthScopeMetadata,
  sanitizeOAuthClientUrl
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import { usePublicOAuthClient } from "@better-auth-ui/react/plugins/oauth-provider"
import { Shield, ChevronRight, Check } from "@gravity-ui/icons"
import { Avatar, Button, Link, Skeleton } from "@heroui/react"
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
    <div className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-3 gap-y-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]">
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
      </div>

      <Button
        className="col-start-2 w-fit shrink-0 sm:col-start-3 sm:row-start-1"
        size="sm"
        variant="outline"
        onPress={() => setRemoveOpen(true)}
      >
        {localization.removeAuthorization}
      </Button>

      {application.scopes.length > 0 ? (
        <details className="group/permissions col-span-full sm:col-start-2 sm:col-span-2">
          <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-sm text-sm text-muted focus-visible:outline-2 focus-visible:outline-focus [&::-webkit-details-marker]:hidden">
            <ChevronRight
              aria-hidden="true"
              className="size-4 shrink-0 group-open/permissions:rotate-90"
            />
            {localization.permissions}{" "}
            <span>({application.scopes.length})</span>
          </summary>
          <ul className="mt-3 grid gap-3 rounded-lg bg-surface-secondary p-4">
            {application.scopes.map((scope) => {
              const details = resolveOAuthScopeMetadata(scopeMetadata, scope, {
                clientId: application.clientId,
                requestedScopes: application.scopes
              })
              return (
                <li key={scope} className="flex gap-3">
                  <Check
                    aria-hidden="true"
                    className="mt-0.5 size-4 shrink-0 text-muted"
                  />
                  <div className="grid min-w-0 gap-1">
                    <p className="text-sm font-medium break-words">
                      {details.label}
                    </p>
                    {details.description ? (
                      <p className="text-sm leading-5 text-muted">
                        {details.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              )
            })}
          </ul>
        </details>
      ) : null}

      <RemoveAuthorizationDialog
        application={application}
        clientName={clientName}
        isOpen={removeOpen}
        onOpenChange={setRemoveOpen}
      />
    </div>
  )
}
