"use client"

import {
  hasOAuthPrompt,
  type OAuthAuthorizationRequest,
  type OAuthProviderAuthClient,
  parseOAuthAuthorizationRequest
} from "@better-auth-ui/core/plugins/oauth-provider"
import { useAuth, useAuthPlugin } from "@better-auth-ui/react"
import {
  useOAuthContinue,
  usePublicOAuthClient
} from "@better-auth-ui/react/plugins/oauth-provider"
import { Button, Card, type CardProps, cn, Spinner } from "@heroui/react"
import { useEffect, useState } from "react"

import { oauthProviderPlugin } from "../../../lib/auth/oauth-provider-plugin"
import type { SocialLayout } from "../provider-buttons"
import { SignUp } from "../sign-up"

export type OAuthSignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
  variant?: CardProps["variant"]
}

const interpolateClient = (template: string, clientName: string) =>
  template.replace("{{client}}", clientName)

/**
 * Sign-up view that resumes a signed OAuth authorization request.
 *
 * When Better Auth sends the user here with `prompt=create`, the ordinary
 * sign-up form still does the account creation. Only once that succeeds and
 * leaves a usable session does this call `oauth2.continue({ created: true })`
 * so Better Auth can finish the authorization it started.
 *
 * Without `prompt=create` this is just the normal sign-up view.
 */
export function OAuthSignUp({
  className,
  socialLayout,
  socialPosition,
  variant
}: OAuthSignUpProps) {
  const { authClient } = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = authClient as OAuthProviderAuthClient

  const [request, setRequest] = useState<OAuthAuthorizationRequest>()
  const [isCreated, setIsCreated] = useState(false)

  useEffect(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  }, [])

  const isOAuthSignUp = Boolean(request && hasOAuthPrompt(request, "create"))

  const publicClient = usePublicOAuthClient(oauthClient, request?.clientId, {
    enabled: isOAuthSignUp
  })
  const clientName = publicClient.data?.client_name || localization.application

  const oauthContinue = useOAuthContinue(oauthClient)

  // The account already exists at this point, so retrying continuation is the
  // only sensible recovery — never send the user back through the form.
  if (isCreated) {
    return (
      <Card
        className={cn("w-full max-w-sm gap-5 md:p-6", className)}
        variant={variant}
      >
        <Card.Header>
          <Card.Title className="text-xl font-semibold">
            {localization.accountCreated}
          </Card.Title>

          <Card.Description>
            {interpolateClient(
              oauthContinue.isError
                ? localization.continueFailed
                : localization.continuing,
              clientName
            )}
          </Card.Description>
        </Card.Header>

        {oauthContinue.isError && (
          <Card.Footer>
            <Button
              className="w-full"
              isPending={oauthContinue.isPending}
              onPress={() => oauthContinue.mutate({ created: true })}
            >
              {oauthContinue.isPending && <Spinner color="current" size="sm" />}

              {localization.tryAgain}
            </Button>
          </Card.Footer>
        )}
      </Card>
    )
  }

  return (
    <SignUp
      className={className}
      socialLayout={socialLayout}
      socialPosition={socialPosition}
      variant={variant}
      onSignUpSuccess={
        isOAuthSignUp
          ? () => {
              setIsCreated(true)
              oauthContinue.mutate({ created: true })
            }
          : undefined
      }
    />
  )
}
