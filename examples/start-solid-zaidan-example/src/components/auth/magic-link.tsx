import type { MagicLinkAuthClient } from "@better-auth-ui/core/plugins/magic-link"
import {
  magicLinkPlugin as coreMagicLinkPlugin,
  type MagicLinkLocalization,
  magicLinkLocalization
} from "@better-auth-ui/core/plugins/magic-link"
import { AuthLink, type AuthPlugin, useAuth } from "@better-auth-ui/solid"
import { useSignInMagicLink } from "@better-auth-ui/solid/plugins/magic-link"
import { type Component, createSignal, For, Show } from "solid-js"
import { MAGIC_LINK_SENT_STORAGE_KEY } from "@/components/auth/magic-link-sent"
import {
  ProviderButtons,
  type SocialLayout
} from "@/components/auth/provider-buttons"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
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
  const auth = useAuth<MagicLinkAuthClient>()
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
  const magicLinkSentPath = () =>
    magicLinkPluginConfig()?.viewPaths?.auth?.magicLinkSent ?? "magic-link-sent"
  const signInMagicLink = useSignInMagicLink(auth.authClient, () => ({
    onSuccess: (_data, variables) => {
      sessionStorage.setItem(MAGIC_LINK_SENT_STORAGE_KEY, variables.email)
      auth.navigate({
        to: `${auth.basePaths.auth}/${magicLinkSentPath()}`
      })
    }
  }))
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
            <FieldGroup>
              <Field data-invalid={Boolean(emailError())}>
                <FieldLabel for="magic-link-email">
                  {auth.localization.auth.email}
                </FieldLabel>
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
                  {(message) => <FieldError>{message()}</FieldError>}
                </Show>
              </Field>
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
            </FieldGroup>
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
            <AuthLink
              href={`${auth.basePaths.auth}/${auth.viewPaths.auth.signUp}`}
            >
              {auth.localization.auth.signUp}
            </AuthLink>
          </p>
        </Show>
      </CardContent>
    </Card>
  )
}
