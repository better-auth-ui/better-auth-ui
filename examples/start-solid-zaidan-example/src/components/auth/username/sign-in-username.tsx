import { authQueryKeys } from "@better-auth-ui/core"
import {
  type UsernameLocalization,
  usernameLocalization
} from "@better-auth-ui/core/plugins"
import {
  signInEmailOptions,
  signInUsernameOptions,
  type UsernameAuthClient,
  useAuth
} from "@better-auth-ui/solid"
import { createMutation, useQueryClient } from "@tanstack/solid-query"
import { Link } from "@tanstack/solid-router"
import { Eye, EyeOff } from "lucide-solid"
import { type Component, createSignal, For, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import type { SocialLayout } from "../provider-buttons"
import { ProviderButtons } from "../provider-buttons"
import { resolveSubmittedSignIn } from "../sign-in-path"

export type SignInUsernameProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

type AuthButtonComponent = Component<{ view?: string }>

type AuthPluginWithButtons = {
  authButtons?: AuthButtonComponent[]
  id: string
}

export function SignInUsername(props: SignInUsernameProps) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [identifier, setIdentifier] = createSignal("")
  const [identifierError, setIdentifierError] = createSignal<string>()
  const [password, setPassword] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const onSignInSuccess = () => {
    queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
    auth.navigate({ to: auth.redirectTo })
  }
  const signIn = createMutation(() => ({
    ...signInEmailOptions(auth.authClient),
    onSuccess: onSignInSuccess
  }))
  const signInUsername = createMutation(() => ({
    ...signInUsernameOptions(auth.authClient as UsernameAuthClient),
    onSuccess: onSignInSuccess
  }))
  const usernamePlugin = auth.plugins.find((plugin) => plugin.id === "username")
  const usernameAuth = Boolean(usernamePlugin)
  const usernameLabels: UsernameLocalization = {
    ...usernameLocalization,
    ...(usernamePlugin?.localization as
      | Partial<UsernameLocalization>
      | undefined)
  }
  const socialPosition = () => props.socialPosition ?? "bottom"
  const showSeparator = () =>
    Boolean(auth.emailAndPassword?.enabled && auth.socialProviders?.length)

  const submitSignIn = (
    event: SubmitEvent & { currentTarget: HTMLFormElement }
  ) => {
    event.preventDefault()

    const { password: submittedPassword, signInPath } = resolveSubmittedSignIn({
      formData: new FormData(event.currentTarget),
      usernameAuth
    })

    setIdentifier(
      signInPath.kind === "username" ? signInPath.username : signInPath.email
    )
    setPassword(submittedPassword)

    if (signInPath.kind === "username") {
      signInUsername.mutate({
        password: submittedPassword,
        username: signInPath.username
      })
      return
    }

    signIn.mutate({
      email: signInPath.email,
      password: submittedPassword
    })
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signIn}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Show when={socialPosition() === "top"}>
          <Show when={auth.socialProviders?.length}>
            <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
          </Show>
          <Show when={showSeparator()}>
            <div class="my-4 text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
          </Show>
        </Show>

        <form aria-label="Sign in" onSubmit={submitSignIn}>
          <div class="flex flex-col gap-6">
            <div class="grid gap-3">
              <Label for="sign-in-email">
                {usernameAuth
                  ? usernameLabels.username
                  : auth.localization.auth.email}
              </Label>
              <Input
                aria-invalid={Boolean(identifierError())}
                autocomplete={usernameAuth ? "username" : "email"}
                id="sign-in-email"
                name={usernameAuth ? "username" : "email"}
                onInput={(event) => {
                  setIdentifier(event.currentTarget.value)
                  setIdentifierError(undefined)
                }}
                onInvalid={(event) => {
                  event.preventDefault()
                  setIdentifierError(event.currentTarget.validationMessage)
                }}
                placeholder={
                  usernameAuth
                    ? usernameLabels.usernameOrEmailPlaceholder
                    : auth.localization.auth.emailPlaceholder
                }
                required
                type={usernameAuth ? "text" : "email"}
                value={identifier()}
              />

              <Show when={identifierError()}>
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <div class="grid gap-3">
              <Label for="sign-in-password">
                {auth.localization.auth.password}
              </Label>
              <div class="relative">
                <Input
                  aria-invalid={Boolean(passwordError())}
                  autocomplete="current-password"
                  class="pr-12"
                  id="sign-in-password"
                  maxLength={auth.emailAndPassword.maxPasswordLength}
                  minLength={auth.emailAndPassword.minPasswordLength}
                  name="password"
                  onInput={(event) => {
                    setPassword(event.currentTarget.value)
                    setPasswordError(undefined)
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setPasswordError(event.currentTarget.validationMessage)
                  }}
                  placeholder={auth.localization.auth.passwordPlaceholder}
                  required
                  type={isPasswordVisible() ? "text" : "password"}
                  value={password()}
                />

                <Button
                  aria-label={
                    isPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  class="absolute right-1 top-1/2 -translate-y-1/2"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  size="icon-sm"
                  title={
                    isPasswordVisible()
                      ? auth.localization.auth.hidePassword
                      : auth.localization.auth.showPassword
                  }
                  type="button"
                  variant="ghost"
                >
                  {isPasswordVisible() ? (
                    <EyeOff aria-hidden class="size-4" />
                  ) : (
                    <Eye aria-hidden class="size-4" />
                  )}
                </Button>
              </div>

              <Show when={passwordError()}>
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>

            <Button
              disabled={signIn.isPending || signInUsername.isPending}
              type="submit"
            >
              {signIn.isPending || signInUsername.isPending
                ? `${auth.localization.auth.signIn}…`
                : auth.localization.auth.signIn}
            </Button>

            <For
              each={(auth.plugins as AuthPluginWithButtons[]).flatMap(
                (plugin) =>
                  (plugin.authButtons ?? []).map((AuthButton, index) => ({
                    AuthButton,
                    key: `${plugin.id}-${index.toString()}`
                  }))
              )}
            >
              {({ AuthButton }) => <AuthButton view="signIn" />}
            </For>

            <Show when={signIn.isError || signInUsername.isError}>
              <p role="alert">Unable to sign in. Try again.</p>
            </Show>
          </div>
        </form>

        <Show
          when={socialPosition() === "bottom" && auth.socialProviders?.length}
        >
          <div class="my-4 text-center text-muted-foreground text-xs">
            {auth.localization.auth.or}
          </div>
          <ProviderButtons socialLayout={props.socialLayout} view="signIn" />
        </Show>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <Show when={auth.emailAndPassword.forgotPassword}>
            <Link
              class="text-sm underline-offset-4 hover:underline"
              params={{ path: auth.viewPaths.auth.forgotPassword }}
              to="/auth/$path"
            >
              {auth.localization.auth.forgotPasswordLink}
            </Link>
          </Show>

          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.needToCreateAnAccount}{" "}
            <Link
              class="underline underline-offset-4"
              params={{ path: auth.viewPaths.auth.signUp }}
              to="/auth/$path"
            >
              {auth.localization.auth.signUp}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
