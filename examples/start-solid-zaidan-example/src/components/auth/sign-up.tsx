import { authQueryKeys } from "@better-auth-ui/core"
import {
  type UsernameLocalization,
  usernameLocalization
} from "@better-auth-ui/core/plugins"
import { signUpEmailOptions, useAuth } from "@better-auth-ui/solid"
import { createMutation, useQueryClient } from "@tanstack/solid-query"
import { Link } from "@tanstack/solid-router"
import { Eye, EyeOff } from "lucide-solid"
import { createSignal, Show } from "solid-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ProviderButtons, type SocialLayout } from "./provider-buttons"

export type SignUpProps = {
  class?: string
  socialLayout?: SocialLayout
  socialPosition?: "top" | "bottom"
}

export function SignUp(props: SignUpProps) {
  const auth = useAuth()
  const queryClient = useQueryClient()
  const [email, setEmail] = createSignal("")
  const [emailError, setEmailError] = createSignal<string>()
  const [name, setName] = createSignal("")
  const [nameError, setNameError] = createSignal<string>()
  const [username, setUsername] = createSignal("")
  const [usernameError, setUsernameError] = createSignal<string>()
  const [password, setPassword] = createSignal("")
  const [passwordError, setPasswordError] = createSignal<string>()
  const [confirmPassword, setConfirmPassword] = createSignal("")
  const [confirmPasswordError, setConfirmPasswordError] = createSignal<string>()
  const [isPasswordVisible, setIsPasswordVisible] = createSignal(false)
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] =
    createSignal(false)
  const signUp = createMutation(() => ({
    ...signUpEmailOptions(auth.authClient),
    onSuccess: () => {
      if (auth.emailAndPassword.requireEmailVerification) {
        auth.navigate({
          to: `${auth.basePaths.auth}/${auth.viewPaths.auth.signIn}`
        })
        return
      }

      queryClient.invalidateQueries({ queryKey: authQueryKeys.session })
      auth.navigate({ to: auth.redirectTo })
    }
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

  const submitSignUp = (event: SubmitEvent) => {
    event.preventDefault()

    setConfirmPasswordError(undefined)

    if (
      auth.emailAndPassword.confirmPassword &&
      password() !== confirmPassword()
    ) {
      setConfirmPasswordError(auth.localization.auth.passwordsDoNotMatch)
      return
    }

    signUp.mutate({
      email: email(),
      name: name(),
      password: password(),
      ...(usernameAuth ? { username: username() } : {})
    })
  }

  return (
    <Card class={cn("w-full max-w-sm", props.class)}>
      <CardHeader>
        <CardTitle class="text-xl font-semibold">
          {auth.localization.auth.signUp}
        </CardTitle>
      </CardHeader>

      <CardContent>
        <Show when={socialPosition() === "top"}>
          <Show when={auth.socialProviders?.length}>
            <ProviderButtons socialLayout={props.socialLayout} view="signUp" />
          </Show>
          <Show when={showSeparator()}>
            <div class="my-4 text-center text-muted-foreground text-xs">
              {auth.localization.auth.or}
            </div>
          </Show>
        </Show>

        <form aria-label="Sign up" onSubmit={submitSignUp}>
          <div class="flex flex-col gap-6">
            <Show when={auth.emailAndPassword.name}>
              <div class="grid gap-3">
                <Label for="sign-up-name">{auth.localization.auth.name}</Label>
                <Input
                  aria-invalid={Boolean(nameError())}
                  autocomplete="name"
                  id="sign-up-name"
                  name="name"
                  onInput={(event) => {
                    setName(event.currentTarget.value)
                    setNameError(undefined)
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setNameError(event.currentTarget.validationMessage)
                  }}
                  placeholder={auth.localization.auth.namePlaceholder}
                  required={auth.emailAndPassword.name}
                  type="text"
                  value={name()}
                />

                <Show when={nameError()}>
                  {(message) => (
                    <p class="text-sm text-destructive" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>
            <Show when={usernameAuth}>
              <div class="grid gap-3">
                <Label for="sign-up-username">{usernameLabels.username}</Label>
                <Input
                  aria-invalid={Boolean(usernameError())}
                  autocomplete="username"
                  id="sign-up-username"
                  name="username"
                  onInput={(event) => {
                    setUsername(event.currentTarget.value)
                    setUsernameError(undefined)
                  }}
                  onInvalid={(event) => {
                    event.preventDefault()
                    setUsernameError(event.currentTarget.validationMessage)
                  }}
                  placeholder={usernameLabels.usernamePlaceholder}
                  required
                  type="text"
                  value={username()}
                />

                <Show when={usernameError()}>
                  {(message) => (
                    <p class="text-sm text-destructive" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>
            <div class="grid gap-3">
              <Label for="sign-up-email">{auth.localization.auth.email}</Label>
              <Input
                aria-invalid={Boolean(emailError())}
                autocomplete="email"
                id="sign-up-email"
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
                {(message) => (
                  <p class="text-sm text-destructive" role="alert">
                    {message()}
                  </p>
                )}
              </Show>
            </div>
            <div class="grid gap-3">
              <Label for="sign-up-password">
                {auth.localization.auth.password}
              </Label>
              <div class="relative">
                <Input
                  aria-invalid={Boolean(passwordError())}
                  autocomplete="new-password"
                  class="pr-12"
                  id="sign-up-password"
                  maxLength={auth.emailAndPassword.maxPasswordLength}
                  minLength={auth.emailAndPassword.minPasswordLength}
                  name="password"
                  onInput={(event) => {
                    setPassword(event.currentTarget.value)
                    setPasswordError(undefined)
                    setConfirmPasswordError(undefined)
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
            <Show when={auth.emailAndPassword.confirmPassword}>
              <div class="grid gap-3">
                <Label for="sign-up-confirm-password">
                  {auth.localization.auth.confirmPassword}
                </Label>
                <div class="relative">
                  <Input
                    aria-invalid={Boolean(confirmPasswordError())}
                    autocomplete="new-password"
                    class="pr-12"
                    id="sign-up-confirm-password"
                    maxLength={auth.emailAndPassword.maxPasswordLength}
                    minLength={auth.emailAndPassword.minPasswordLength}
                    name="confirmPassword"
                    onInput={(event) => {
                      setConfirmPassword(event.currentTarget.value)
                      setConfirmPasswordError(undefined)
                    }}
                    onInvalid={(event) => {
                      event.preventDefault()
                      setConfirmPasswordError(
                        event.currentTarget.validationMessage
                      )
                    }}
                    placeholder={
                      auth.localization.auth.confirmPasswordPlaceholder
                    }
                    required
                    type={isConfirmPasswordVisible() ? "text" : "password"}
                    value={confirmPassword()}
                  />

                  <Button
                    aria-label={
                      isConfirmPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    class="absolute right-1 top-1/2 -translate-y-1/2"
                    onClick={() =>
                      setIsConfirmPasswordVisible((visible) => !visible)
                    }
                    size="icon-sm"
                    title={
                      isConfirmPasswordVisible()
                        ? auth.localization.auth.hidePassword
                        : auth.localization.auth.showPassword
                    }
                    type="button"
                    variant="ghost"
                  >
                    {isConfirmPasswordVisible() ? (
                      <EyeOff aria-hidden class="size-4" />
                    ) : (
                      <Eye aria-hidden class="size-4" />
                    )}
                  </Button>
                </div>

                <Show when={confirmPasswordError()}>
                  {(message) => (
                    <p class="text-sm text-destructive" role="alert">
                      {message()}
                    </p>
                  )}
                </Show>
              </div>
            </Show>
            <Button disabled={signUp.isPending} type="submit">
              {signUp.isPending
                ? `${auth.localization.auth.signUp}…`
                : auth.localization.auth.signUp}
            </Button>
            <Show when={signUp.isSuccess}>
              <p role="status">
                Account created. Check your email if verification is required.
              </p>
            </Show>
            <Show when={signUp.isError}>
              <p role="alert">Unable to create an account. Try again.</p>
            </Show>
          </div>
        </form>

        <Show
          when={socialPosition() === "bottom" && auth.socialProviders?.length}
        >
          <div class="my-4 text-center text-muted-foreground text-xs">
            {auth.localization.auth.or}
          </div>
          <ProviderButtons socialLayout={props.socialLayout} view="signUp" />
        </Show>

        <div class="mt-4 flex w-full flex-col items-center gap-3">
          <p class="text-center text-sm text-muted-foreground">
            {auth.localization.auth.alreadyHaveAnAccount}{" "}
            <Link
              class="underline underline-offset-4"
              params={{ path: auth.viewPaths.auth.signIn }}
              to="/auth/$path"
            >
              {auth.localization.auth.signIn}
            </Link>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
