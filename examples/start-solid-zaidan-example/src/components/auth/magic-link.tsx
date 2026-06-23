import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkLocalization,
  magicLinkLocalization
} from "@better-auth-ui/core/plugins/magic-link"
import {
  type MagicLinkAuthClient,
  useAuth,
  useSignInMagicLink
} from "@better-auth-ui/solid"
import type { AuthPlugin } from "@better-auth-ui/solid/plugins"
import { Link } from "@tanstack/solid-router"
import { type Component, createSignal, For, Show } from "solid-js"
import { toast } from "solid-sonner"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

export type MagicLinkProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "bottom" | "top"
}

type AuthButtonComponent = Component<{ view?: string }>

type AuthPluginWithButtons = AuthPlugin & {
  authButtons?: AuthButtonComponent[]
}

export function MagicLink(props: MagicLinkProps) {
  const auth = useAuth()
  const [email, setEmail] = createSignal("")
  const [emailError, setEmailError] = createSignal<string>()
  const magicLinkPluginConfig = () =>
    auth.plugins.find((plugin) => plugin.id === coreMagicLinkPlugin.id)
  const magicLinkLabels = (): MagicLinkLocalization => ({
    ...magicLinkLocalization,
    ...(magicLinkPluginConfig()?.localization as
      | Partial<MagicLinkLocalization>
      | undefined)
  })
  const signInMagicLink = useSignInMagicLink(
    auth.authClient as MagicLinkAuthClient,
    {
      onSuccess: () => {
        setEmail("")
        toast.success(magicLinkLabels().magicLinkSent)
      }
    }
  )
  const showSeparator = () => Boolean(auth.socialProviders?.length)
  const socialPosition = () => props.socialPosition ?? "bottom"

  const submitMagicLink = (
    event: SubmitEvent & { currentTarget: HTMLFormElement }
  ) => {
    event.preventDefault()
    signInMagicLink.mutate({
      callbackURL: `${auth.baseURL}${auth.redirectTo}`,
      email: email()
    } as Parameters<typeof signInMagicLink.mutate>[0])
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div class="flex flex-col gap-6">
          <Show
            when={socialPosition() === "top" && auth.socialProviders?.length}
          >
            <ProviderButtons socialLayout={props.socialLayout} />
            <Show when={showSeparator()}>
              <div class="text-center text-muted-foreground text-xs">
                {auth.localization.auth.or}
              </div>
            </Show>
          </Show>
          <form aria-label="Magic link" onSubmit={submitMagicLink}>
            <div class="grid gap-3">
              <Label for="magic-link-email">
                {auth.localization.auth.email}
              </Label>
              <Input
                aria-invalid={Boolean(emailError())}
                autocomplete="email"
                disabled={signInMagicLink.isPending}
                id="magic-link-email"
                name="email"
                onInput={(event) => {
                  setEmail(event.currentTarget.value)
                  setEmailError(undefined)
                }}
                onInvalid={(event) => {
                  event.preventDefault()
                  setEmailError(event.currentTarget.validationMessage)
                }}
                placeholder={auth.localization.auth.emailPlaceholder}
                required
                type="email"
                value={email()}
              />
              <Show when={emailError()}>
                {(message) => <p role="alert">{message()}</p>}
              </Show>
              <div class="flex flex-col gap-3">
                <Button disabled={signInMagicLink.isPending} type="submit">
                  {magicLinkLabels().sendMagicLink}
                </Button>

                <For
                  each={(auth.plugins as AuthPluginWithButtons[]).flatMap(
                    (plugin) =>
                      (plugin.authButtons ?? []).map((AuthButton) => ({
                        AuthButton
                      }))
                  )}
                >
                  {({ AuthButton }) => <AuthButton view="magicLink" />}
                </For>
              </div>
            </div>
          </form>
          <Show
            when={socialPosition() === "bottom" && auth.socialProviders?.length}
          >
            <Show when={showSeparator()}>
              <div class="text-center text-muted-foreground text-xs">
                {auth.localization.auth.or}
              </div>
            </Show>
            <ProviderButtons socialLayout={props.socialLayout} />
          </Show>
        </div>
        <Show when={auth.emailAndPassword?.enabled}>
          <p class="mt-4 text-center text-muted-foreground text-sm">
            {auth.localization.auth.needToCreateAnAccount}{" "}
            <Link
              params={{ path: auth.viewPaths.auth.signUp }}
              to="/auth/$path"
            >
              {auth.localization.auth.signUp}
            </Link>
          </p>
        </Show>
      </CardContent>
    </Card>
  )
}
