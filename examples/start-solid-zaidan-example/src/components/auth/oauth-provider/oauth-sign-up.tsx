import {
  hasOAuthPrompt,
  type OAuthAuthorizationRequest,
  parseOAuthAuthorizationRequest
} from "@better-auth-ui/core/plugins"
import {
  type OAuthProviderAuthClient,
  oauthContinueOptions,
  useAuth,
  useAuthPlugin,
  usePublicOAuthClient
} from "@better-auth-ui/solid"
import { createMutation } from "@tanstack/solid-query"
import { createSignal, onMount, Show } from "solid-js"

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
  class?: string
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
export function OAuthSignUp(props: OAuthSignUpProps) {
  const auth = useAuth()
  const { localization } = useAuthPlugin(oauthProviderPlugin)
  const oauthClient = auth.authClient as OAuthProviderAuthClient

  const [request, setRequest] = createSignal<OAuthAuthorizationRequest>()
  const [isCreated, setIsCreated] = createSignal(false)

  onMount(() => {
    setRequest(parseOAuthAuthorizationRequest(window.location.search))
  })

  const isOAuthSignUp = () => {
    const current = request()

    return Boolean(current && hasOAuthPrompt(current, "create"))
  }

  const publicClient = usePublicOAuthClient(oauthClient, () =>
    isOAuthSignUp() ? request()?.clientId : undefined
  )
  const clientName = () =>
    publicClient.data?.client_name || localization.application

  const oauthContinue = createMutation(() => oauthContinueOptions(oauthClient))

  return (
    <Show
      when={isCreated()}
      fallback={
        <SignUp
          class={props.class}
          socialLayout={props.socialLayout}
          socialPosition={props.socialPosition}
          onSignUpSuccess={
            isOAuthSignUp()
              ? () => {
                  setIsCreated(true)
                  oauthContinue.mutate({ created: true })
                }
              : undefined
          }
        />
      }
    >
      {/* The account already exists at this point, so retrying continuation
          is the only sensible recovery — never send the user back through
          the form. */}
      <Card class={cn("w-full max-w-sm", props.class)}>
        <CardHeader>
          <CardTitle class="text-xl">{localization.accountCreated}</CardTitle>
          <CardDescription>
            {interpolateClient(
              oauthContinue.isError
                ? localization.continueFailed
                : localization.continuing,
              clientName()
            )}
          </CardDescription>
        </CardHeader>

        <Show when={oauthContinue.isError}>
          <CardFooter>
            <Button
              class="w-full"
              disabled={oauthContinue.isPending}
              onClick={() => oauthContinue.mutate({ created: true })}
            >
              <Show when={oauthContinue.isPending}>
                <Spinner />
              </Show>
              {localization.tryAgain}
            </Button>
          </CardFooter>
        </Show>
      </Card>
    </Show>
  )
}
