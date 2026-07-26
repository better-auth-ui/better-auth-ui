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
import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { oauthProviderPlugin } from "@/lib/auth/oauth-provider-plugin"
import { cn } from "@/lib/utils"
import type { SocialLayout } from "../provider-buttons"
import { SignUp } from "../sign-up"

export type OAuthSignUpProps = {
  className?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
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
  socialPosition
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
      <Card className={cn("w-full max-w-sm", className)}>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">
            {localization.accountCreated}
          </CardTitle>

          <CardDescription>
            {interpolateClient(
              oauthContinue.isError
                ? localization.continueFailed
                : localization.continuing,
              clientName
            )}
          </CardDescription>
        </CardHeader>

        {oauthContinue.isError && (
          <CardFooter>
            <Button
              className="w-full"
              disabled={oauthContinue.isPending}
              onClick={() => oauthContinue.mutate({ created: true })}
            >
              {oauthContinue.isPending && <Spinner />}

              {localization.tryAgain}
            </Button>
          </CardFooter>
        )}
      </Card>
    )
  }

  return (
    <SignUp
      className={className}
      socialLayout={socialLayout}
      socialPosition={socialPosition}
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
